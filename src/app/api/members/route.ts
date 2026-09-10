import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateMemberId } from '@/lib/utils';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateRegistrationReceiptPdf } from '@/lib/registrationReceiptPdf';
import {
  sendCorrectionNoticeEmail,
  sendRegistrationReceiptEmail,
  sendMembershipFeeReceiptEmail,
} from '@/lib/mailer';

export const dynamic = 'force-dynamic';

/**
 * Primary Members API Route
 * Handles listing, applicant registration, editing, status transitions, and deletions
 */

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const canView = Boolean(
      session &&
      (hasPermission(session.role, 'members') ||
       session.role === 'SUPER_ADMIN' ||
       session.role === 'ADMIN' ||
       session.role === 'MEMBER_MANAGER' ||
       session.role === 'FINANCE_MANAGER' ||
       session.role === 'VOLUNTEER_MANAGER')
    );

    if (!canView) {
      return NextResponse.json(
        { error: 'Unauthorized: Member management access required.' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl ? req.nextUrl.searchParams : new URL(req.url).searchParams;
    const singleId = searchParams.get('id');
    const singleMemberId = searchParams.get('memberId');

    // Handle single member lookup by id or memberId
    if (singleId || singleMemberId) {
      const member = await prisma.member.findFirst({
        where: {
          OR: [
            ...(singleId ? [{ id: singleId }] : []),
            ...(singleMemberId ? [{ memberId: singleMemberId }] : []),
          ],
        },
      });

      if (!member) {
        return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, member });
    }

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { memberId: { contains: q } },
        { fullName: { contains: q } },
        { mobile: { contains: q } },
        { email: { contains: q } },
        { district: { contains: q } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const {
      fullName,
      guardianName,
      dob,
      gender,
      mobile,
      email,
      address,
      district,
      state,
      pincode,
      occupation,
      category,
      photoUrl,
    } = body;

    if (!fullName || !String(fullName).trim() || !mobile || !String(mobile).trim() || !email || !String(email).trim()) {
      return NextResponse.json(
        { error: 'Full name, mobile number, and email address are required.' },
        { status: 400 }
      );
    }

    // Generate guaranteed unique member ID using collision-checked loop
    let memberId = '';
    let counter = await prisma.member.count();
    while (true) {
      memberId = generateMemberId(counter);
      const existing = await prisma.member.findUnique({ where: { memberId } });
      if (!existing) break;
      counter++;
    }

    // Safe fee amount parsing
    let parsedFee = 0;
    if (body.feeAmount !== undefined && body.feeAmount !== null && body.feeAmount !== '') {
      const num = parseFloat(String(body.feeAmount).replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) parsedFee = num;
    }

    const member = await prisma.member.create({
      data: {
        memberId,
        fullName: String(fullName).trim(),
        guardianName: guardianName ? String(guardianName).trim() : null,
        dob: dob ? String(dob).trim() : null,
        gender: gender || 'Male',
        mobile: String(mobile).trim(),
        email: String(email).trim().toLowerCase(),
        address: address ? String(address).trim() : null,
        district: district ? String(district).trim() : null,
        state: state || 'Jharkhand',
        pincode: pincode ? String(pincode).trim() : null,
        occupation: occupation ? String(occupation).trim() : null,
        category: category || 'General Member',
        photoUrl: photoUrl || null,
        feeAmount: parsedFee,
        paymentStatus: body.paymentStatus || (parsedFee > 0 ? 'PAID' : 'FREE'),
        paymentId: body.paymentId ? String(body.paymentId).trim() : null,
        paymentMethod: body.paymentMethod || (parsedFee > 0 ? 'ONLINE_GATEWAY' : 'FREE'),
        status: 'PENDING',
      },
    });

    // Generate Registration Receipt PDF Buffer
    let receiptPdfBuffer: Buffer | undefined;
    try {
      receiptPdfBuffer = await generateRegistrationReceiptPdf({
        cardNumber: memberId,
        fullName: String(fullName).trim(),
        role: category || 'General Member',
        personType: 'MEMBER',
        email: String(email).trim().toLowerCase(),
        mobile: String(mobile).trim(),
        address: address ? String(address).trim() : null,
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        photoUrl: photoUrl || null,
      });
    } catch (pdfErr) {
      console.warn('Membership registration receipt PDF generation warning:', pdfErr);
    }

    // Dispatch membership fee receipt email with PDF attachment
    let receiptSent = false;
    try {
      const mailRes = await sendMembershipFeeReceiptEmail({
        recipientEmail: String(email).trim().toLowerCase(),
        recipientName: String(fullName).trim(),
        memberId,
        category: category || 'General Member',
        feeAmount: parsedFee,
        paymentMethod: body.paymentMethod || (parsedFee > 0 ? 'ONLINE_GATEWAY' : 'FREE'),
        paymentId: body.paymentId ? String(body.paymentId).trim() : null,
        pdfBuffer: receiptPdfBuffer,
      });
      receiptSent = mailRes.success;
    } catch (mailErr) {
      console.error('Failed to dispatch membership fee receipt email:', mailErr);
    }

    await logAuditAction({
      action: 'MEMBER_APPLY',
      module: 'MEMBER',
      performedBy: String(fullName).trim(),
      userEmail: String(email).trim().toLowerCase(),
      details: `New membership registration submitted with ID ${memberId} (${category || 'General Member'}). Receipt email ${receiptSent ? 'dispatched' : 'queued'}.`,
    });

    return NextResponse.json({ success: true, member, receiptSent });
  } catch (error: any) {
    console.error('Membership registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit membership registration.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const canManage = Boolean(
      session &&
      (hasPermission(session.role, 'members') ||
       session.role === 'SUPER_ADMIN' ||
       session.role === 'ADMIN' ||
       session.role === 'MEMBER_MANAGER')
    );

    if (!canManage) {
      return NextResponse.json({ error: 'Unauthorized: Member management privileges required.' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const searchParams = req.nextUrl ? req.nextUrl.searchParams : new URL(req.url).searchParams;
    const memberTargetId = body.id || searchParams.get('id');

    if (!memberTargetId) {
      return NextResponse.json({ error: 'Member record ID is required for update.' }, { status: 400 });
    }

    const existing = await prisma.member.findUnique({
      where: { id: memberTargetId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const {
      status,
      category,
      rejectionReason,
      adminRemarks,
      fullName,
      guardianName,
      dob,
      gender,
      mobile,
      email,
      address,
      district,
      state,
      pincode,
      occupation,
      photoUrl,
      feeAmount,
      paymentStatus,
      paymentId,
      paymentMethod,
    } = body;

    const newStatus = status || existing.status;
    const newCategory = category || existing.category;
    const newRemarks = adminRemarks !== undefined ? adminRemarks : existing.adminRemarks;
    const newFullName = fullName || existing.fullName;
    const newPhotoUrl = photoUrl !== undefined ? photoUrl : existing.photoUrl;

    let parsedFee: number | undefined = undefined;
    if (feeAmount !== undefined) {
      const num = parseFloat(String(feeAmount).replace(/[^0-9.]/g, ''));
      parsedFee = !isNaN(num) ? num : existing.feeAmount ?? 0;
    }

    const updated = await prisma.member.update({
      where: { id: memberTargetId },
      data: {
        status: newStatus,
        category: newCategory,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : existing.rejectionReason,
        adminRemarks: newRemarks,
        fullName: newFullName,
        guardianName: guardianName !== undefined ? guardianName : existing.guardianName,
        dob: dob !== undefined ? dob : existing.dob,
        gender: gender !== undefined ? gender : existing.gender,
        mobile: mobile ? String(mobile).trim() : existing.mobile,
        email: email ? String(email).trim().toLowerCase() : existing.email,
        address: address !== undefined ? address : existing.address,
        district: district !== undefined ? district : existing.district,
        state: state !== undefined ? state : existing.state,
        pincode: pincode !== undefined ? pincode : existing.pincode,
        occupation: occupation !== undefined ? occupation : existing.occupation,
        photoUrl: newPhotoUrl,
        feeAmount: parsedFee !== undefined ? parsedFee : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
        paymentId: paymentId !== undefined ? paymentId : undefined,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : undefined,
      },
    });

    // 1. If status is NEEDS_CORRECTION: dispatch correction email to applicant
    if (newStatus === 'NEEDS_CORRECTION' && newRemarks && updated.email) {
      try {
        await sendCorrectionNoticeEmail({
          recipientEmail: updated.email,
          recipientName: updated.fullName,
          referenceId: existing.memberId,
          personType: 'Member',
          remarks: newRemarks,
        });
      } catch (err) {
        console.error('Error dispatching member correction email:', err);
      }
    }

    // 2. If status is ACTIVE: generate ID card and dispatch receipt/certificate email with PDF attachment
    if (newStatus === 'ACTIVE') {
      const issueDate = new Date();
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + (updated.category === 'Life Member' ? 5 : 1));

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org'}/verify/${existing.memberId}`;

      await prisma.idCard.upsert({
        where: { cardNumber: existing.memberId },
        update: {
          status: 'ACTIVE',
          fullName: updated.fullName,
          role: updated.category,
          photoUrl: updated.photoUrl,
        },
        create: {
          cardNumber: existing.memberId,
          personType: 'MEMBER',
          personId: existing.id,
          fullName: updated.fullName,
          role: updated.category,
          photoUrl: updated.photoUrl,
          issueDate,
          validUntil,
          qrCodeData: verificationUrl,
          status: 'ACTIVE',
          remarks: 'Member credential issued upon administrative approval.',
        },
      });

      await prisma.member.update({
        where: { id: memberTargetId },
        data: { idCardIssued: true, validUntil },
      });

      // Generate Official A4 Registration Receipt & Certificate PDF
      let receiptPdfBuffer: Buffer | undefined;
      try {
        receiptPdfBuffer = await generateRegistrationReceiptPdf({
          cardNumber: existing.memberId,
          fullName: updated.fullName,
          role: updated.category || 'Member',
          personType: 'MEMBER',
          email: updated.email,
          mobile: updated.mobile,
          address: updated.address ? `${updated.address}${updated.district ? `, ${updated.district}` : ''}${updated.pincode ? ` - ${updated.pincode}` : ''}` : 'Nipania, Chatra, Jharkhand',
          issueDate,
          validUntil,
          photoUrl: updated.photoUrl,
        });
      } catch (pdfErr) {
        console.error('Failed to generate member Registration Receipt PDF:', pdfErr);
      }

      // Dispatch official registration receipt email with receipt PDF attachment
      if (updated.email) {
        try {
          await sendRegistrationReceiptEmail({
            recipientEmail: updated.email,
            recipientName: updated.fullName,
            cardNumber: existing.memberId,
            role: updated.category || 'Member',
            personType: 'Member',
            verificationUrl,
            validityDate: validUntil,
            mobile: updated.mobile,
            address: updated.address,
            pdfBuffer: receiptPdfBuffer,
          });
        } catch (mailErr) {
          console.error('Failed to dispatch member registration receipt email with PDF:', mailErr);
        }
      }
    } else if (existing.idCardIssued) {
      // Keep existing ID Card in sync if member name/role/photo changed
      await prisma.idCard.updateMany({
        where: { cardNumber: existing.memberId },
        data: {
          fullName: updated.fullName,
          role: updated.category,
          photoUrl: updated.photoUrl,
        },
      });
    }

    await logAuditAction({
      action: 'UPDATE_MEMBER',
      module: 'MEMBER',
      performedBy: session?.name || 'Admin User',
      userEmail: session?.email || 'admin@nipaniatrust.org',
      details: `Member ${existing.memberId} (${updated.fullName}) updated. Status: ${newStatus}.`,
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: error.message || 'Failed to update member.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const canDelete = Boolean(
      session &&
      (hasPermission(session.role, 'members') ||
       session.role === 'SUPER_ADMIN' ||
       session.role === 'ADMIN')
    );

    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
    }

    const searchParams = req.nextUrl ? req.nextUrl.searchParams : new URL(req.url).searchParams;
    let targetId = searchParams.get('id');

    if (!targetId) {
      try {
        const body = await req.json();
        targetId = body?.id;
      } catch {
        // body wasn't JSON
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Member record ID is required for deletion.' }, { status: 400 });
    }

    const existing = await prisma.member.findUnique({
      where: { id: targetId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    // Delete associated ID card if present
    await prisma.idCard.deleteMany({
      where: {
        OR: [
          { cardNumber: existing.memberId },
          { personId: existing.id },
        ],
      },
    });

    // Delete member record
    await prisma.member.delete({
      where: { id: targetId },
    });

    await logAuditAction({
      action: 'DELETE_MEMBER',
      module: 'MEMBER',
      performedBy: session?.name || 'Admin User',
      userEmail: session?.email || 'admin@nipaniatrust.org',
      details: `Permanently deleted member ${existing.memberId} (${existing.fullName}) and revoked associated identity cards.`,
    });

    return NextResponse.json({ success: true, message: 'Member deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete member.' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
