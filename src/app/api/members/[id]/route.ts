import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateIdCardPdf } from '@/lib/idCardPdf';
import { generateRegistrationReceiptPdf } from '@/lib/registrationReceiptPdf';
import { sendIdCardApprovalEmail, sendCorrectionNoticeEmail, sendRegistrationReceiptEmail } from '@/lib/mailer';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'members')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.member.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
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
    const newRemarks = adminRemarks !== undefined ? adminRemarks : (existing as any).adminRemarks;
    const newFullName = fullName || existing.fullName;
    const newPhotoUrl = photoUrl !== undefined ? photoUrl : existing.photoUrl;

    const updated = await (prisma.member as any).update({
      where: { id: params.id },
      data: {
        status: newStatus,
        category: newCategory,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : (existing as any).rejectionReason,
        adminRemarks: newRemarks,
        fullName: newFullName,
        guardianName: guardianName !== undefined ? guardianName : existing.guardianName,
        dob: dob !== undefined ? dob : existing.dob,
        gender: gender !== undefined ? gender : existing.gender,
        mobile: mobile || existing.mobile,
        email: email || existing.email,
        address: address !== undefined ? address : existing.address,
        district: district !== undefined ? district : existing.district,
        state: state !== undefined ? state : existing.state,
        pincode: pincode !== undefined ? pincode : existing.pincode,
        occupation: occupation !== undefined ? occupation : existing.occupation,
        photoUrl: newPhotoUrl,
        feeAmount: feeAmount !== undefined ? Number(feeAmount) : (existing as any).feeAmount,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : (existing as any).paymentStatus,
        paymentId: paymentId !== undefined ? paymentId : (existing as any).paymentId,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : (existing as any).paymentMethod,
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

    // 2. If status is ACTIVE: generate ID card and dispatch email with PDF attachment!
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
        where: { id: params.id },
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
      performedBy: session.name,
      userEmail: session.email,
      details: `Member ${existing.memberId} (${updated.fullName}) updated. Status: ${newStatus}.`,
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'members')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.member.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
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
      where: { id: params.id },
    });

    await logAuditAction({
      action: 'DELETE_MEMBER',
      module: 'MEMBER',
      performedBy: session.name,
      userEmail: session.email,
      details: `Permanently deleted member ${existing.memberId} (${existing.fullName}) and revoked any associated identity cards.`,
    });

    return NextResponse.json({ success: true, message: 'Member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
