import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isAdmin = searchParams.get('admin') === 'true';

    const where: any = {};
    if (!isAdmin) {
      where.isActive = true;
    }
    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }

    const items = await (prisma as any).sponsorshipTier.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    const parsedItems = items.map((item: any) => {
      let metrics: string[] = [];
      try {
        metrics = JSON.parse(item.impactMetrics || '[]');
      } catch {
        metrics = item.impactMetrics ? [item.impactMetrics] : [];
      }
      return {
        ...item,
        impactMetrics: metrics,
      };
    });

    if (isAdmin) {
      const allCount = await (prisma as any).sponsorshipTier.count();
      const activeCount = await (prisma as any).sponsorshipTier.count({ where: { isActive: true } });
      const featuredCount = await (prisma as any).sponsorshipTier.count({ where: { isFeatured: true } });

      return NextResponse.json({
        sponsors: parsedItems,
        stats: {
          total: allCount,
          active: activeCount,
          featured: featuredCount,
        },
      });
    }

    return NextResponse.json({ sponsors: parsedItems });
  } catch (error: any) {
    console.error('Error fetching sponsorship tiers:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsorship causes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'projects')) {
      return NextResponse.json({ error: 'Unauthorized: Admin permission required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category = 'MEALS',
      amount,
      monthlyAmount,
      icon = '🤝',
      unitLabel = 'people supported',
      description,
      impactMetrics = [],
      isFeatured = false,
      isActive = true,
      order = 0,
    } = body;

    if (!title || !amount || !description) {
      return NextResponse.json(
        { error: 'Title, amount, and description are required.' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(String(amount));
    const parsedMonthly = monthlyAmount ? parseFloat(String(monthlyAmount)) : parsedAmount;

    const metricsString = Array.isArray(impactMetrics)
      ? JSON.stringify(impactMetrics)
      : typeof impactMetrics === 'string'
      ? JSON.stringify(impactMetrics.split('\n').filter(Boolean))
      : '[]';

    const created = await (prisma as any).sponsorshipTier.create({
      data: {
        title: String(title).trim(),
        category: String(category).trim().toUpperCase(),
        amount: parsedAmount,
        monthlyAmount: parsedMonthly,
        icon: String(icon).trim() || '🤝',
        unitLabel: String(unitLabel).trim(),
        description: String(description).trim(),
        impactMetrics: metricsString,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        order: Number(order) || 0,
      },
    });

    await logAuditAction({
      action: 'SPONSORSHIP_CREATED',
      module: 'PROJECT',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Created sponsorship tier: ${created.title} (₹${created.amount})`,
    });

    return NextResponse.json({ success: true, sponsor: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sponsorship tier:', error);
    return NextResponse.json({ error: error.message || 'Failed to create sponsorship tier.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'projects')) {
      return NextResponse.json({ error: 'Unauthorized: Admin permission required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, category, amount, monthlyAmount, icon, unitLabel, description, impactMetrics, isFeatured, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sponsorship ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (category !== undefined) updateData.category = String(category).trim().toUpperCase();
    if (amount !== undefined) updateData.amount = parseFloat(String(amount));
    if (monthlyAmount !== undefined) updateData.monthlyAmount = parseFloat(String(monthlyAmount));
    if (icon !== undefined) updateData.icon = String(icon).trim();
    if (unitLabel !== undefined) updateData.unitLabel = String(unitLabel).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (impactMetrics !== undefined) {
      updateData.impactMetrics = Array.isArray(impactMetrics)
        ? JSON.stringify(impactMetrics)
        : typeof impactMetrics === 'string'
        ? JSON.stringify(impactMetrics.split('\n').filter(Boolean))
        : '[]';
    }
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (order !== undefined) updateData.order = Number(order) || 0;

    const updated = await (prisma as any).sponsorshipTier.update({
      where: { id },
      data: updateData,
    });

    await logAuditAction({
      action: 'SPONSORSHIP_UPDATED',
      module: 'PROJECT',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Updated sponsorship tier: ${updated.title}`,
    });

    return NextResponse.json({ success: true, sponsor: updated });
  } catch (error: any) {
    console.error('Error updating sponsorship tier:', error);
    return NextResponse.json({ error: error.message || 'Failed to update sponsorship tier.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'projects')) {
      return NextResponse.json({ error: 'Unauthorized: Admin permission required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Sponsorship ID is required for deletion.' }, { status: 400 });
    }

    const existing = await (prisma as any).sponsorshipTier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sponsorship tier not found.' }, { status: 404 });
    }

    await (prisma as any).sponsorshipTier.delete({ where: { id } });

    await logAuditAction({
      action: 'SPONSORSHIP_DELETED',
      module: 'PROJECT',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `Deleted sponsorship tier: ${existing.title}`,
    });

    return NextResponse.json({ success: true, message: 'Sponsorship tier deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting sponsorship tier:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete sponsorship tier.' }, { status: 500 });
  }
}
