import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { sendTenBEEmail } from '@/lib/mailer';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: Sending 10BE certificates requires admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { donationId, force = false } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required.' }, { status: 400 });
    }

    const donation = await prisma.donation.findFirst({
      where: {
        OR: [{ donationId }, { id: donationId }],
      },
    });

    if (!donation) {
      return NextResponse.json({ error: `Donation record "${donationId}" not found.` }, { status: 404 });
    }

    if (!donation.tenBePdfUrl) {
      return NextResponse.json(
        { error: 'Cannot dispatch email: Official Form 10BE PDF has not been uploaded yet for this donation.' },
        { status: 400 }
      );
    }

    if (donation.tenBeEmailStatus === 'SENT' && !force) {
      return NextResponse.json(
        {
          error: `Form 10BE has already been delivered to ${donation.donorEmail} on ${donation.tenBeEmailSentAt?.toLocaleDateString('en-IN')}. Use "Resend" to send again.`,
        },
        { status: 409 }
      );
    }

    if (!donation.donorEmail) {
      return NextResponse.json({ error: 'Donor record does not have an email address.' }, { status: 400 });
    }

    // Build secure verification link if secureAccessToken is available
    const host = req.headers.get('host') || 'nipaniatrust.org';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const secureVerificationUrl = donation.secureAccessToken
      ? `${protocol}://${host}/receipt/${donation.donationId}?token=${donation.secureAccessToken}`
      : `${protocol}://${host}/receipt/${donation.donationId}`;

    const mailRes = await sendTenBEEmail({
      recipientEmail: donation.donorEmail,
      recipientName: donation.donorName,
      donationId: donation.donationId,
      amount: donation.amount,
      financialYear: donation.financialYear,
      tenBeNumber: donation.tenBeNumber,
      tenBeIssueDate: donation.tenBeIssueDate,
      pdfUrl: donation.tenBePdfUrl,
      secureVerificationUrl,
    });

    if (mailRes.success) {
      const updated = await prisma.donation.update({
        where: { id: donation.id },
        data: {
          tenBeEmailStatus: 'SENT',
          tenBeEmailSentAt: new Date(),
          tenBeEmailError: null,
        },
      });

      await logAuditAction({
        action: force ? '10BE_EMAIL_RESENT' : '10BE_EMAIL_SENT',
        module: 'DONATION',
        performedBy: session.name || session.email,
        userEmail: session.email,
        details: `Form 10BE certificate (${updated.tenBeNumber}) emailed to ${donation.donorEmail} for ${donation.donationId}.`,
      });

      return NextResponse.json({
        success: true,
        message: `Official Form 10BE certificate successfully delivered to ${donation.donorEmail}.`,
        donation: updated,
      });
    } else {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          tenBeEmailStatus: 'FAILED',
          tenBeEmailError: mailRes.message || 'SMTP delivery failure',
        },
      });

      await logAuditAction({
        action: '10BE_EMAIL_FAILED',
        module: 'DONATION',
        performedBy: session.name || session.email,
        userEmail: session.email,
        details: `Failed to email Form 10BE for ${donation.donationId} to ${donation.donorEmail}: ${mailRes.message}.`,
      });

      return NextResponse.json(
        {
          error: `Email delivery failed: ${mailRes.message}. Donation record preserved. You can retry delivery.`,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Error dispatching 10BE email:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch Form 10BE email.' }, { status: 500 });
  }
}
