import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.boardMember.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
    }

    return NextResponse.json({ boardMember: member });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch board member' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && !hasPermission(session.role, 'settings'))) {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin can manage Board Members.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, designation, category, image, quote, roleDetails, tenure, order, isActive } = body;

    const existing = await prisma.boardMember.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
    }

    const updated = await prisma.boardMember.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        designation: designation !== undefined ? designation : existing.designation,
        category: category !== undefined ? category : existing.category,
        image: image !== undefined ? image : existing.image,
        quote: quote !== undefined ? quote : existing.quote,
        roleDetails: roleDetails !== undefined ? roleDetails : existing.roleDetails,
        tenure: tenure !== undefined ? tenure : existing.tenure,
        order: order !== undefined ? parseInt(order) : existing.order,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    await logAuditAction({
      action: 'UPDATE_BOARD_MEMBER',
      module: 'SETTINGS',
      performedBy: session.name,
      userEmail: session.email,
      details: `Updated Board Member "${updated.name}" (${updated.designation}).`,
    });

    return NextResponse.json({ success: true, boardMember: updated });
  } catch (error: any) {
    console.error('Error updating board member:', error);
    return NextResponse.json({ error: 'Failed to update board member' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && !hasPermission(session.role, 'settings'))) {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin can delete Board Members.' }, { status: 401 });
    }

    const existing = await prisma.boardMember.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
    }

    await prisma.boardMember.delete({
      where: { id: params.id },
    });

    await logAuditAction({
      action: 'DELETE_BOARD_MEMBER',
      module: 'SETTINGS',
      performedBy: session.name,
      userEmail: session.email,
      details: `Deleted Board Member "${existing.name}".`,
    });

    return NextResponse.json({ success: true, message: 'Board member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting board member:', error);
    return NextResponse.json({ error: 'Failed to delete board member' }, { status: 500 });
  }
}
