import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { getCurrentFinancialYear } from '@/lib/financialYear';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: 10BD filings access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fy = searchParams.get('financialYear');

    const where: any = {};
    if (fy && fy !== 'ALL') {
      where.financialYear = fy;
    }

    const filings = await prisma.tenBDFiling.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { donations: true },
        },
      },
    });

    const mapped = filings.map((f) => ({
      ...f,
      batchName: f.batchNumber,
      status: f.filingStatus,
      donationCount: f.totalDonations,
      acknowledgementNumber: f.acknowledgementNo,
    }));

    return NextResponse.json({ success: true, filings: mapped });
  } catch (error: any) {
    console.error('Error fetching 10BD filings:', error);
    return NextResponse.json({ error: 'Failed to fetch 10BD filings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: Creating filing batches requires admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { financialYear, notes, donationIds = [] } = body;

    const fy = financialYear && financialYear !== 'ALL' ? financialYear : getCurrentFinancialYear();

    // Generate clean unique batch number
    const count = await prisma.tenBDFiling.count({ where: { financialYear: fy } });
    const batchNumber = `10BD-${fy}-${String(count + 1).padStart(3, '0')}`;

    // Target donations: if explicit donationIds provided, use them; otherwise pick all eligible donations in this FY not yet in a batch
    let targetIds = donationIds;
    if (targetIds.length === 0) {
      const eligible = await prisma.donation.findMany({
        where: {
          financialYear: fy,
          donationEligible80G: true,
          tenBdFilingId: null,
          tenBdStatus: { in: ['PENDING', 'READY'] },
        },
        select: { id: true },
      });
      targetIds = eligible.map((e) => e.id);
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: `No unbatched eligible donations found for ${fy} to create a 10BD filing batch.` },
        { status: 400 }
      );
    }

    const donationsData = await prisma.donation.findMany({
      where: { id: { in: targetIds } },
      select: { amount: true },
    });
    const totalAmount = donationsData.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const filing = await prisma.tenBDFiling.create({
      data: {
        financialYear: fy,
        batchNumber,
        filingStatus: 'DRAFT',
        notes,
        totalDonations: targetIds.length,
        totalAmount,
        filedBy: session.name || session.email,
      },
    });

    // Link donations to batch and mark as INCLUDED
    await prisma.donation.updateMany({
      where: { id: { in: targetIds } },
      data: {
        tenBdFilingId: filing.id,
        tenBdBatchId: batchNumber,
        tenBdStatus: 'INCLUDED',
        tenBdIncludedAt: new Date(),
      },
    });

    await logAuditAction({
      action: '10BD_BATCH_CREATED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Created 10BD batch ${batchNumber} (${fy}) with ${targetIds.length} donations totaling ₹${totalAmount}.`,
    });

    return NextResponse.json({
      success: true,
      filing,
      batchNumber,
      totalDonations: targetIds.length,
      totalAmount,
    });
  } catch (error: any) {
    console.error('Error creating 10BD filing batch:', error);
    return NextResponse.json({ error: error.message || 'Failed to create 10BD filing batch.' }, { status: 500 });
  }
}
