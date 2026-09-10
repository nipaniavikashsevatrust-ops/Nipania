import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { updates: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'projects')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        category: body.category !== undefined ? body.category : existing.category,
        summary: body.summary !== undefined ? body.summary : existing.summary,
        description: body.description !== undefined ? body.description : existing.description,
        location: body.location !== undefined ? body.location : existing.location,
        targetAmount: body.targetAmount !== undefined ? parseFloat(body.targetAmount) : existing.targetAmount,
        raisedAmount: body.raisedAmount !== undefined ? parseFloat(body.raisedAmount) : existing.raisedAmount,
        beneficiariesCount: body.beneficiariesCount !== undefined ? parseInt(body.beneficiariesCount) : existing.beneficiariesCount,
        status: body.status !== undefined ? body.status : existing.status,
        bannerImage: body.bannerImage !== undefined ? body.bannerImage : existing.bannerImage,
      },
    });

    await logAuditAction({
      action: 'UPDATE',
      module: 'PROJECT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Updated project "${updated.title}".`,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'projects')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    await prisma.project.delete({ where: { id: params.id } });

    await logAuditAction({
      action: 'DELETE',
      module: 'PROJECT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Deleted project "${existing.title}".`,
    });

    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
