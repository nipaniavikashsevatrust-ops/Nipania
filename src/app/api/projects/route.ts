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

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { updates: true },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'projects')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      summary,
      description,
      location,
      targetAmount,
      raisedAmount,
      beneficiariesCount,
      status,
      bannerImage,
      startDate,
      endDate,
    } = body;

    if (!title || !category || !summary || !description) {
      return NextResponse.json({ error: 'Title, category, summary, and description are required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const project = await prisma.project.create({
      data: {
        slug,
        title,
        category,
        summary,
        description,
        location: location || null,
        targetAmount: parseFloat(targetAmount) || 0,
        raisedAmount: parseFloat(raisedAmount) || 0,
        beneficiariesCount: parseInt(beneficiariesCount) || 0,
        status: status || 'ACTIVE',
        bannerImage: bannerImage || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });

    await logAuditAction({
      action: 'CREATE',
      module: 'PROJECT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Created new project "${title}" in category ${category}.`,
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
