import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'documents')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const doc = await prisma.document.update({
      where: { id: params.id },
      data: {
        isPublic: body.isPublic !== undefined ? body.isPublic : undefined,
        title: body.title || undefined,
        category: body.category || undefined,
      },
    });

    await logAuditAction({
      action: 'UPDATE',
      module: 'DOCUMENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Updated document "${doc.title}".`,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'documents')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.document.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    await prisma.document.delete({ where: { id: params.id } });

    await logAuditAction({
      action: 'DELETE',
      module: 'DOCUMENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Deleted document "${existing.title}".`,
    });

    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
