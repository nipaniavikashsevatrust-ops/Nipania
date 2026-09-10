import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'id_cards')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const personType = searchParams.get('personType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (personType && personType !== 'ALL') where.personType = personType;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { cardNumber: { contains: search } },
        { fullName: { contains: search } },
        { role: { contains: search } },
      ];
    }

    const idCards = await prisma.idCard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ idCards });
  } catch (error: any) {
    console.error('Error fetching ID cards:', error);
    return NextResponse.json({ error: 'Failed to fetch ID cards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'id_cards')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      cardNumber,
      personType,
      personId,
      fullName,
      role,
      photoUrl,
      issueDate,
      validUntil,
      remarks,
    } = body;

    if (!cardNumber || !fullName || !role) {
      return NextResponse.json({ error: 'Card number, full name, and role are required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';
    const qrCodeData = `${appUrl}/verify/${cardNumber}`;

    const card = await prisma.idCard.upsert({
      where: { cardNumber },
      update: {
        personType: personType || 'STAFF',
        fullName,
        role,
        photoUrl: photoUrl || null,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        qrCodeData,
        status: 'ACTIVE',
        remarks: remarks || null,
      },
      create: {
        cardNumber,
        personType: personType || 'STAFF',
        personId: personId || `custom-${Date.now()}`,
        fullName,
        role,
        photoUrl: photoUrl || null,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        qrCodeData,
        status: 'ACTIVE',
        remarks: remarks || null,
      },
    });

    await logAuditAction({
      action: 'ID_GENERATED',
      module: 'ID_CARD',
      performedBy: session.name,
      userEmail: session.email,
      details: `Generated ID Card ${cardNumber} for ${fullName} (${role}).`,
    });

    return NextResponse.json({ success: true, idCard: card });
  } catch (error: any) {
    console.error('Error creating ID card:', error);
    return NextResponse.json({ error: 'Failed to generate ID card' }, { status: 500 });
  }
}
