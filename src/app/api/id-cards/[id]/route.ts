import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card = await prisma.idCard.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ idCard: card });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch ID card' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'id_cards')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, remarks, validUntil } = body;

    const existing = await prisma.idCard.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const updated = await prisma.idCard.update({
      where: { id: params.id },
      data: {
        status: status || existing.status,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        validUntil: validUntil ? new Date(validUntil) : existing.validUntil,
      },
    });

    await logAuditAction({
      action: 'UPDATE_STATUS',
      module: 'ID_CARD',
      performedBy: session.name,
      userEmail: session.email,
      details: `ID Card ${existing.cardNumber} status updated to ${status}.`,
    });

    return NextResponse.json({ success: true, idCard: updated });
  } catch (error: any) {
    console.error('Error updating ID card:', error);
    return NextResponse.json({ error: 'Failed to update ID card' }, { status: 500 });
  }
}
