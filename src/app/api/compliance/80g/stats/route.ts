import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { getCurrentFinancialYear } from '@/lib/financialYear';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: Compliance stats access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fy = searchParams.get('financialYear') || getCurrentFinancialYear();

    const where: any = {};
    if (fy && fy !== 'ALL') {
      where.financialYear = fy;
    }

    const allDonations = await prisma.donation.findMany({
      where,
      select: {
        id: true,
        amount: true,
        donationEligible80G: true,
        donorPan: true,
        donorAddress: true,
        donorPincode: true,
        tenBdStatus: true,
        tenBdBatchId: true,
        tenBdFilingId: true,
        tenBeStatus: true,
        tenBeEmailStatus: true,
      },
    });

    let totalDonationsCount = allDonations.length;
    let totalDonationsAmount = 0;
    let eligible80GCount = 0;
    let eligible80GAmount = 0;

    let tenBdReadyCount = 0;
    let tenBdHasIssuesCount = 0;
    let tenBdIncludedCount = 0;
    let tenBdFiledCount = 0;

    let tenBeUploadedCount = 0;
    let tenBePendingUploadCount = 0;
    let tenBeEmailSentCount = 0;
    let tenBeEmailPendingCount = 0;
    let tenBeEmailFailedCount = 0;

    for (const d of allDonations) {
      const amt = Number(d.amount) || 0;
      totalDonationsAmount += amt;

      const isEligible = d.donationEligible80G !== false;
      if (isEligible) {
        eligible80GCount++;
        eligible80GAmount += amt;

        const hasValidPan = Boolean(d.donorPan && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(d.donorPan.trim().toUpperCase()));
        const hasAddress = Boolean(d.donorAddress && d.donorAddress.trim().length > 3);

        if (d.tenBdStatus === 'FILED') {
          tenBdFiledCount++;
        } else if (d.tenBdStatus === 'INCLUDED') {
          tenBdIncludedCount++;
        } else if (hasValidPan && hasAddress) {
          tenBdReadyCount++;
        } else {
          tenBdHasIssuesCount++;
        }

        if (d.tenBeStatus === 'UPLOADED' || d.tenBeStatus === 'AVAILABLE') {
          tenBeUploadedCount++;
          if (d.tenBeEmailStatus === 'SENT') {
            tenBeEmailSentCount++;
          } else if (d.tenBeEmailStatus === 'FAILED') {
            tenBeEmailFailedCount++;
          } else {
            tenBeEmailPendingCount++;
          }
        } else {
          tenBePendingUploadCount++;
        }
      }
    }

    const payload = {
      financialYear: fy,
      totalDonations: totalDonationsCount,
      totalDonationsCount,
      totalDonationsAmount,
      eligible80GCount,
      eligible80GAmount,
      tenBdReadyCount,
      tenBdHasIssuesCount,
      tenBdPendingCount: tenBdHasIssuesCount,
      tenBdIncludedCount,
      tenBdFiledCount,
      tenBeUploadedCount,
      tenBePendingUploadCount,
      tenBePendingCount: tenBePendingUploadCount,
      tenBeEmailSentCount,
      tenBeEmailsSentCount: tenBeEmailSentCount,
      tenBeEmailPendingCount,
      tenBeEmailFailedCount,
    };

    return NextResponse.json({
      success: true,
      financialYear: fy,
      stats: payload,
      kpis: payload,
    });
  } catch (error: any) {
    console.error('Error in /api/compliance/80g/stats:', error);
    return NextResponse.json({ error: 'Failed to calculate compliance statistics.' }, { status: 500 });
  }
}
