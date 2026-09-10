import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { generate10BdCsv } from '@/lib/tenBd';
import { getCurrentFinancialYear } from '@/lib/financialYear';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: 10BD export access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fy = searchParams.get('financialYear') || getCurrentFinancialYear();
    const batchId = searchParams.get('batchId');
    const validOnly = searchParams.get('validOnly') === 'true';

    const where: any = {
      financialYear: fy,
      donationEligible80G: true,
    };

    if (batchId) {
      where.tenBdFilingId = batchId;
    }

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    if (donations.length === 0) {
      return NextResponse.json(
        { error: `No eligible donation records found for ${fy} to export.` },
        { status: 404 }
      );
    }

    const trust = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });

    const csvContent = generate10BdCsv(donations, fy, trust);

    const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    await logAuditAction({
      action: '10BD_EXPORTED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Exported 10BD preparation statement for ${fy}: ${donations.length} records totaling ₹${totalAmount}.`,
    });

    const filename = `10BD_Preparation_${fy}_${Date.now()}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/compliance/10bd/export:', error);
    return NextResponse.json({ error: 'Failed to generate 10BD export file.' }, { status: 500 });
  }
}
