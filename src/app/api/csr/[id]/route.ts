import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'messages')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: 'CSR Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error fetching CSR inquiry details:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiry details' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'messages')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, adminNotes } = body;

    const existing = await prisma.contactMessage.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'CSR Enquiry not found' }, { status: 404 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    await logAuditAction({
      action: 'CSR_STATUS_UPDATE',
      module: 'MESSAGES',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Updated CSR enquiry (${existing.subject}) status to "${status || existing.status}".`,
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('Error updating CSR enquiry:', error);
    return NextResponse.json({ error: 'Failed to update CSR enquiry' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'messages')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.contactMessage.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'CSR Enquiry not found' }, { status: 404 });
    }

    await prisma.contactMessage.delete({
      where: { id: params.id },
    });

    await logAuditAction({
      action: 'CSR_ENQUIRY_DELETE',
      module: 'MESSAGES',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Deleted CSR enquiry from "${existing.name}" (${existing.subject}).`,
    });

    return NextResponse.json({ success: true, message: 'CSR enquiry deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting CSR enquiry:', error);
    return NextResponse.json({ error: 'Failed to delete CSR enquiry' }, { status: 500 });
  }
}
