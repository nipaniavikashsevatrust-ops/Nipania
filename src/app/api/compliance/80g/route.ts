import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { getCurrentFinancialYear, getFinancialYearRange } from '@/lib/financialYear';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: 80G Compliance access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fy = searchParams.get('financialYear') || getCurrentFinancialYear();
    const tenBdStatus = searchParams.get('tenBdStatus');
    const tenBeStatus = searchParams.get('tenBeStatus');
    const emailStatus = searchParams.get('emailStatus');
    const eligibleOnly = searchParams.get('eligibleOnly') === 'true';
    const search = searchParams.get('search');

    const where: any = {};

    if (fy && fy !== 'ALL') {
      where.financialYear = fy;
    }

    if (tenBdStatus && tenBdStatus !== 'ALL') {
      where.tenBdStatus = tenBdStatus;
    }

    if (tenBeStatus && tenBeStatus !== 'ALL') {
      where.tenBeStatus = tenBeStatus;
    }

    if (emailStatus && emailStatus !== 'ALL') {
      where.tenBeEmailStatus = emailStatus;
    }

    if (eligibleOnly) {
      where.donationEligible80G = true;
    }

    if (search) {
      where.OR = [
        { donationId: { contains: search } },
        { donorName: { contains: search } },
        { donorEmail: { contains: search } },
        { donorPan: { contains: search } },
        { tenBeNumber: { contains: search } },
      ];
    }

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tenBdFiling: {
          select: {
            batchNumber: true,
            filingStatus: true,
            acknowledgementNo: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      financialYear: fy,
      count: donations.length,
      donations,
    });
  } catch (error: any) {
    console.error('Error in /api/compliance/80g:', error);
    return NextResponse.json({ error: 'Failed to retrieve 80G compliance records.' }, { status: 500 });
  }
}
