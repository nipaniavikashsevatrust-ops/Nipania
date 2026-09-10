import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
      include: {
        registrations: true,
      },
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'events')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      description,
      location,
      eventDate,
      eventTime,
      organizer,
      maxSeats,
      bannerImage,
      status,
    } = body;

    if (!title || !category || !location || !eventDate) {
      return NextResponse.json({ error: 'Title, category, location, and date are required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const event = await prisma.event.create({
      data: {
        slug,
        title,
        category,
        description: description || '',
        location,
        eventDate,
        eventTime: eventTime || null,
        organizer: organizer || 'Nipania Vikash Seva Trust',
        maxSeats: parseInt(maxSeats) || 100,
        bannerImage: bannerImage || null,
        status: status || 'UPCOMING',
      },
    });

    await logAuditAction({
      action: 'CREATE',
      module: 'EVENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Created new event "${title}" on ${eventDate}.`,
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
