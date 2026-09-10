import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { registrations: true },
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'events')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.event.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        category: body.category !== undefined ? body.category : existing.category,
        description: body.description !== undefined ? body.description : existing.description,
        location: body.location !== undefined ? body.location : existing.location,
        eventDate: body.eventDate !== undefined ? body.eventDate : existing.eventDate,
        eventTime: body.eventTime !== undefined ? body.eventTime : existing.eventTime,
        status: body.status !== undefined ? body.status : existing.status,
        bannerImage: body.bannerImage !== undefined ? body.bannerImage : existing.bannerImage,
      },
    });

    await logAuditAction({
      action: 'UPDATE',
      module: 'EVENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Updated event "${updated.title}".`,
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'events')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.event.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    await prisma.event.delete({ where: { id: params.id } });

    await logAuditAction({
      action: 'DELETE',
      module: 'EVENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Deleted event "${existing.title}".`,
    });

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
