import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { fullName, email, phone, numberOfGuests = 1 } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone number are required.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: params.id,
        fullName,
        email,
        phone,
        numberOfGuests: parseInt(numberOfGuests) || 1,
        status: 'CONFIRMED',
      },
    });

    await logAuditAction({
      action: 'EVENT_REGISTER',
      module: 'EVENT',
      performedBy: fullName,
      userEmail: email,
      details: `Registered for event "${event.title}" on ${event.eventDate}.`,
    });

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to process event registration' }, { status: 500 });
  }
}
