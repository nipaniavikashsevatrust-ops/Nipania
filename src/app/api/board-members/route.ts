import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const members = await prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(
      { boardMembers: members },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching board members:', error);
    return NextResponse.json({ error: 'Failed to fetch board members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && !hasPermission(session.role, 'settings'))) {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin can manage Board Members.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, designation, category, image, quote, roleDetails, tenure, order } = body;

    if (!name || !designation) {
      return NextResponse.json({ error: 'Name and designation are required' }, { status: 400 });
    }

    const member = await prisma.boardMember.create({
      data: {
        name,
        designation,
        category: category || 'Executive Leadership',
        image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        quote: quote || '',
        roleDetails: roleDetails || '',
        tenure: tenure || 'Trustee',
        order: parseInt(order) || 0,
        isActive: true,
      },
    });

    await logAuditAction({
      action: 'CREATE_BOARD_MEMBER',
      module: 'SETTINGS',
      performedBy: session.name,
      userEmail: session.email,
      details: `Added Board Member "${name}" as ${designation}.`,
    });

    return NextResponse.json({ success: true, boardMember: member });
  } catch (error) {
    console.error('Error creating board member:', error);
    return NextResponse.json({ error: 'Failed to create board member' }, { status: 500 });
  }
}
