import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: 10BD filing access required.' }, { status: 401 });
    }

    const filing = await prisma.tenBDFiling.findUnique({
      where: { id: params.id },
      include: {
        donations: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!filing) {
      return NextResponse.json({ error: '10BD filing batch not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, filing });
  } catch (error: any) {
    console.error('Error fetching 10BD filing batch:', error);
    return NextResponse.json({ error: 'Failed to fetch filing batch.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: Updating 10BD filings requires admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { filingStatus, status, acknowledgementNo, acknowledgementNumber, filingDate, notes } = body;

    const existing = await prisma.tenBDFiling.findUnique({
      where: { id: params.id },
      include: { donations: { select: { id: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Filing batch not found.' }, { status: 404 });
    }

    const updateData: any = {};
    const statusVal = filingStatus || status;
    const ackVal = acknowledgementNo || acknowledgementNumber;
    if (statusVal !== undefined) updateData.filingStatus = String(statusVal).toUpperCase();
    if (ackVal !== undefined) updateData.acknowledgementNo = ackVal ? String(ackVal).trim() : null;
    if (filingDate !== undefined) updateData.filingDate = filingDate ? new Date(filingDate) : new Date();
    if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : null;

    const updated = await prisma.tenBDFiling.update({
      where: { id: params.id },
      data: updateData,
    });

    // If marked as FILED or COMPLETED, update all associated donations
    if (updateData.filingStatus === 'FILED' || updateData.filingStatus === 'COMPLETED') {
      await prisma.donation.updateMany({
        where: { tenBdFilingId: params.id },
        data: {
          tenBdStatus: 'FILED',
        },
      });
    }

    await logAuditAction({
      action: '10BD_MARKED_FILED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Updated 10BD batch ${existing.batchNumber} status to ${updated.filingStatus}. Ack: ${updated.acknowledgementNo || 'N/A'}.`,
    });

    return NextResponse.json({ success: true, filing: updated });
  } catch (error: any) {
    console.error('Error updating 10BD filing batch:', error);
    return NextResponse.json({ error: error.message || 'Failed to update filing batch.' }, { status: 500 });
  }
}
