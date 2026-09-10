import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { sendTenBEEmail } from '@/lib/mailer';
import { logAuditAction } from '@/lib/audit';
import { getCurrentFinancialYear } from '@/lib/financialYear';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: Bulk email dispatch requires admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { financialYear, mode = 'PENDING_ONLY' } = body;

    const fy = financialYear || getCurrentFinancialYear();

    const where: any = {
      financialYear: fy,
      donationEligible80G: true,
      tenBePdfUrl: { not: null }, // Only donations where official 10BE PDF is uploaded
    };

    if (mode === 'PENDING_ONLY') {
      where.tenBeEmailStatus = 'NOT_SENT';
    } else if (mode === 'FAILED_ONLY') {
      where.tenBeEmailStatus = 'FAILED';
    }

    const eligibleDonations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    if (eligibleDonations.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No donations matching mode "${mode}" in ${fy} with uploaded 10BE certificate waiting for email.`,
        attempted: 0,
        sent: 0,
        failed: 0,
      });
    }

    const host = req.headers.get('host') || 'nipaniatrust.org';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    let sentCount = 0;
    let failedCount = 0;
    const errors: Array<{ donationId: string; donorEmail: string; error: string }> = [];

    // Process sequentially or in gentle batches to avoid overwhelming SMTP provider
    for (const d of eligibleDonations) {
      if (!d.donorEmail) {
        failedCount++;
        errors.push({ donationId: d.donationId, donorEmail: 'N/A', error: 'Missing donor email' });
        continue;
      }

      const secureVerificationUrl = d.secureAccessToken
        ? `${protocol}://${host}/receipt/${d.donationId}?token=${d.secureAccessToken}`
        : `${protocol}://${host}/receipt/${d.donationId}`;

      try {
        const mailRes = await sendTenBEEmail({
          recipientEmail: d.donorEmail,
          recipientName: d.donorName,
          donationId: d.donationId,
          amount: d.amount,
          financialYear: d.financialYear,
          tenBeNumber: d.tenBeNumber,
          tenBeIssueDate: d.tenBeIssueDate,
          pdfUrl: d.tenBePdfUrl,
          secureVerificationUrl,
        });

        if (mailRes.success) {
          sentCount++;
          await prisma.donation.update({
            where: { id: d.id },
            data: {
              tenBeEmailStatus: 'SENT',
              tenBeEmailSentAt: new Date(),
              tenBeEmailError: null,
            },
          });
        } else {
          failedCount++;
          errors.push({ donationId: d.donationId, donorEmail: d.donorEmail, error: mailRes.message });
          await prisma.donation.update({
            where: { id: d.id },
            data: {
              tenBeEmailStatus: 'FAILED',
              tenBeEmailError: mailRes.message,
            },
          });
        }
      } catch (err: any) {
        failedCount++;
        errors.push({ donationId: d.donationId, donorEmail: d.donorEmail, error: err.message });
        await prisma.donation.update({
          where: { id: d.id },
          data: {
            tenBeEmailStatus: 'FAILED',
            tenBeEmailError: err.message,
          },
        });
      }
    }

    await logAuditAction({
      action: '10BE_BULK_EMAILS_DISPATCHED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Bulk dispatched Form 10BE certificates for ${fy} (${mode}): Attempted: ${eligibleDonations.length}, Sent: ${sentCount}, Failed: ${failedCount}.`,
    });

    return NextResponse.json({
      success: true,
      financialYear: fy,
      attempted: eligibleDonations.length,
      sent: sentCount,
      failed: failedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Error in bulk 10BE email dispatch:', error);
    return NextResponse.json({ error: error.message || 'Bulk email dispatch encountered an error.' }, { status: 500 });
  }
}
