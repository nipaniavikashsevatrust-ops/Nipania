import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { validateDonationFor10BD, validateBatchFor10BD } from '@/lib/tenBd';
import { getCurrentFinancialYear } from '@/lib/financialYear';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: 10BD validation access required.' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // optional body
    }

    const fy = body.financialYear;
    const whereClause: any = {
      donationEligible80G: true,
    };
    if (fy && fy !== 'ALL') {
      whereClause.financialYear = fy;
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    const summary = validateBatchFor10BD(donations, fy && fy !== 'ALL' ? fy : getCurrentFinancialYear());

    const issues: any[] = [];
    const validDonationIds: string[] = [];

    for (const d of donations) {
      const v = validateDonationFor10BD(d);
      if (v.isValid) {
        validDonationIds.push(d.id);
      } else {
        const allIssues = [...v.errors, ...v.warnings];
        issues.push({
          id: d.id,
          donationId: d.donationId,
          receiptNumber: d.donationId,
          donorName: d.donorName,
          donorEmail: d.donorEmail,
          donorPhone: d.donorPhone,
          donorAddress: d.donorAddress,
          donorPincode: d.donorPincode,
          amount: d.amount,
          donorPan: d.donorPan,
          errors: v.errors,
          issues: allIssues,
          warnings: v.warnings,
          fieldErrors: v.fieldErrors,
        });
      }
    }

    await logAuditAction({
      action: '10BD_VALIDATED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Validated ${donations.length} records for 10BD ${fy}. Valid: ${validDonationIds.length}, Needs Correction: ${issues.length}.`,
    });

    return NextResponse.json({
      success: true,
      financialYear: fy,
      summary,
      totalEligible: donations.length,
      validCount: validDonationIds.length,
      invalidCount: issues.length,
      validDonationIds,
      issues,
      errors: issues,
    });
  } catch (error: any) {
    console.error('Error in /api/compliance/10bd/validate:', error);
    return NextResponse.json({ error: error.message || 'Failed to run 10BD validation.' }, { status: 500 });
  }
}
