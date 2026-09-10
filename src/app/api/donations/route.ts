import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDonationId } from '@/lib/utils';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateDonationReceiptPdf } from '@/lib/donationReceiptPdf';
import { sendDonationReceiptEmail } from '@/lib/mailer';
import { getFinancialYear } from '@/lib/financialYear';
import { generateSecureAccessToken } from '@/lib/tenBd';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'donations')) {
      return NextResponse.json({ error: 'Unauthorized: Donation management access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');
    const causeType = searchParams.get('causeType');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (projectId && projectId !== 'ALL') where.projectId = projectId;
    if (type && type !== 'ALL') where.type = type;

    if (causeType === 'SPONSORSHIP') {
      where.projectTitle = { contains: 'Sponsor' };
    } else if (causeType === 'CAMPAIGN') {
      where.AND = [
        { projectTitle: { not: { contains: 'Sponsor' } } },
        { projectTitle: { not: 'General Welfare Fund' } },
        { projectTitle: { not: 'General Social Welfare Fund' } },
      ];
    } else if (causeType === 'GENERAL') {
      where.OR = [
        { projectTitle: { contains: 'General' } },
        { projectTitle: null },
      ];
    }

    if (search) {
      where.OR = [
        { donationId: { contains: search } },
        { donorName: { contains: search } },
        { donorEmail: { contains: search } },
        { donorPan: { contains: search } },
        { projectTitle: { contains: search } },
      ];
    }

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ donations });
  } catch (error: any) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Failed to fetch donations.' }, { status: 500 });
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
      donorName,
      donorEmail,
      donorPhone,
      donorPan,
      donorAddress,
      amount,
      type = 'ONE_TIME',
      projectId,
      projectTitle,
      paymentMethod = 'ONLINE',
      paymentId,
      orderId,
    } = body;

    if (!donorName || !donorEmail || !donorPhone || !amount) {
      return NextResponse.json(
        { error: 'Missing required donor fields (name, email, phone) or amount.' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid donation amount.' }, { status: 400 });
    }

    // Collision-safe unique donation ID generation
    const count = await prisma.donation.count();
    let donationId = '';
    let counter = count;
    while (true) {
      donationId = generateDonationId(counter);
      const exists = await prisma.donation.findUnique({ where: { donationId } });
      if (!exists) break;
      counter++;
    }

    const cleanDonorName = String(donorName).trim();
    const cleanEmail = String(donorEmail).trim().toLowerCase();
    const cleanPhone = String(donorPhone).trim();
    const cleanPan = donorPan ? String(donorPan).trim().toUpperCase() : null;
    const cleanAddress = donorAddress ? String(donorAddress).trim() : null;
    const actualTitle = projectTitle || 'General Welfare Fund';
    const cleanPaymentId = paymentId ? String(paymentId).trim() : `PAY_${Date.now()}`;
    const cleanOrderId = orderId ? String(orderId).trim() : `ORD_${Date.now()}`;

    const fy = getFinancialYear(new Date());
    const secureAccessToken = generateSecureAccessToken(donationId);

    const donation = await prisma.donation.create({
      data: {
        donationId,
        donorName: cleanDonorName,
        donorEmail: cleanEmail,
        donorPhone: cleanPhone,
        donorPan: cleanPan,
        donorAddress: cleanAddress,
        amount: parsedAmount,
        type,
        projectId: projectId || null,
        projectTitle: actualTitle,
        paymentMethod: String(paymentMethod).toUpperCase(),
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        status: 'SUCCESS',
        isReceiptIssued: true,
        financialYear: fy,
        donationEligible80G: true,
        tenBdStatus: 'PENDING',
        tenBeStatus: 'PENDING',
        tenBeEmailStatus: 'NOT_SENT',
        secureAccessToken,
      },
    });

    // If tied to a project, increment project raised amount
    if (projectId) {
      try {
        await prisma.project.update({
          where: { id: projectId },
          data: {
            raisedAmount: {
              increment: parsedAmount,
            },
          },
        });
      } catch (err) {
        console.warn('Project increment warning:', err);
      }
    }

    // Generate official A4 Section 80G Tax Exemption Receipt PDF Buffer
    let receiptPdfBuffer: Buffer | undefined;
    try {
      receiptPdfBuffer = await generateDonationReceiptPdf({
        donationId,
        donorName: cleanDonorName,
        donorEmail: cleanEmail,
        donorPhone: cleanPhone,
        donorPan: cleanPan,
        donorAddress: cleanAddress,
        amount: parsedAmount,
        paymentMethod: String(paymentMethod).toUpperCase(),
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        projectTitle: actualTitle,
        date: new Date(),
      });
    } catch (pdfErr) {
      console.error('Failed to generate 80G donation receipt PDF:', pdfErr);
    }

    // Dispatch official 80G Donation Receipt Email with PDF Attachment
    let emailSent = false;
    if (cleanEmail) {
      try {
        const mailRes = await sendDonationReceiptEmail({
          recipientEmail: cleanEmail,
          recipientName: cleanDonorName,
          donationId,
          amount: parsedAmount,
          paymentMethod: String(paymentMethod).toUpperCase(),
          paymentId: cleanPaymentId,
          projectTitle: actualTitle,
          donorPan: cleanPan,
          pdfBuffer: receiptPdfBuffer,
        });
        emailSent = mailRes.success;
      } catch (mailErr) {
        console.error('Failed to dispatch 80G donation receipt email:', mailErr);
      }
    }

    await logAuditAction({
      action: 'DONATION_RECORDED',
      module: 'DONATION',
      performedBy: cleanDonorName,
      userEmail: cleanEmail,
      details: `Donation of ₹${parsedAmount} received with ID ${donationId}. Receipt email ${emailSent ? 'sent' : 'queued'}. FY: ${fy}.`,
    });

    return NextResponse.json({
      success: true,
      donation,
      receiptSent: emailSent,
    });
  } catch (error: any) {
    console.error('Donation processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process donation.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'donations')) {
      return NextResponse.json({ error: 'Unauthorized: Donation edit requires admin permission.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      donationId,
      donorName,
      donorEmail,
      donorPhone,
      donorPan,
      donorAddress,
      donorPincode,
      amount,
      status,
      paymentMethod,
      projectTitle,
      type,
      financialYear,
      donationEligible80G,
      tenBdStatus,
      tenBeStatus,
      tenBeNumber,
      tenBeIssueDate,
      officialReceiptNumber,
    } = body;

    const targetId = id || donationId;
    if (!targetId) {
      return NextResponse.json({ error: 'Donation ID is required for editing.' }, { status: 400 });
    }

    const updateData: any = {};
    if (donorName !== undefined) updateData.donorName = String(donorName).trim();
    if (donorEmail !== undefined) updateData.donorEmail = String(donorEmail).trim();
    if (donorPhone !== undefined) updateData.donorPhone = String(donorPhone).trim();
    if (donorPan !== undefined) updateData.donorPan = donorPan ? String(donorPan).trim().toUpperCase() : null;
    if (donorAddress !== undefined) updateData.donorAddress = donorAddress ? String(donorAddress).trim() : null;
    if (donorPincode !== undefined) updateData.donorPincode = donorPincode ? String(donorPincode).trim() : null;
    if (amount !== undefined) updateData.amount = parseFloat(String(amount));
    if (status !== undefined) updateData.status = String(status).toUpperCase();
    if (paymentMethod !== undefined) updateData.paymentMethod = String(paymentMethod).toUpperCase();
    if (projectTitle !== undefined) updateData.projectTitle = String(projectTitle).trim();
    if (type !== undefined) updateData.type = String(type).toUpperCase();
    if (financialYear !== undefined) updateData.financialYear = financialYear ? String(financialYear).trim() : null;
    if (donationEligible80G !== undefined) updateData.donationEligible80G = Boolean(donationEligible80G);
    if (tenBdStatus !== undefined) updateData.tenBdStatus = String(tenBdStatus).toUpperCase();
    if (tenBeStatus !== undefined) updateData.tenBeStatus = String(tenBeStatus).toUpperCase();
    if (tenBeNumber !== undefined) updateData.tenBeNumber = tenBeNumber ? String(tenBeNumber).trim() : null;
    if (tenBeIssueDate !== undefined) updateData.tenBeIssueDate = tenBeIssueDate ? new Date(tenBeIssueDate) : null;
    if (officialReceiptNumber !== undefined) updateData.officialReceiptNumber = officialReceiptNumber ? String(officialReceiptNumber).trim() : null;

    const updated = await prisma.donation.update({
      where: id ? { id } : { donationId },
      data: updateData,
    });

    await logAuditAction({
      action: 'DONATION_UPDATED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Donation ${updated.donationId} updated by admin.`,
    });

    return NextResponse.json({ success: true, donation: updated });
  } catch (error: any) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update donation.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'donations')) {
      return NextResponse.json({ error: 'Unauthorized: Donation deletion requires admin permission.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    let donationId = searchParams.get('donationId');

    if (!id && !donationId) {
      try {
        const body = await req.json();
        id = body.id;
        donationId = body.donationId;
      } catch {}
    }

    if (!id && !donationId) {
      return NextResponse.json({ error: 'Donation ID is required for deletion.' }, { status: 400 });
    }

    const whereClause = id ? { id } : { donationId: donationId! };
    const existing = await prisma.donation.findUnique({ where: whereClause });

    if (!existing) {
      return NextResponse.json({ error: 'Donation not found.' }, { status: 404 });
    }

    await prisma.donation.delete({
      where: whereClause,
    });

    await logAuditAction({
      action: 'DONATION_DELETED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Donation ${existing.donationId} (₹${existing.amount}) deleted by admin.`,
    });

    return NextResponse.json({ success: true, message: 'Donation deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting donation:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete donation.' }, { status: 500 });
  }
}
