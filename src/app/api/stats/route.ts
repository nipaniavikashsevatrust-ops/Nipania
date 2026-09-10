import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const stats = await prisma.impactStat.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch impact stats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'content')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stats } = body; // Array of { id, label, value, prefix, suffix, isActive, order }

    if (Array.isArray(stats)) {
      for (const st of stats) {
        if (st.id) {
          await prisma.impactStat.update({
            where: { id: st.id },
            data: {
              label: st.label,
              value: st.value,
              prefix: st.prefix || '',
              suffix: st.suffix || '',
              isActive: st.isActive !== undefined ? st.isActive : true,
              order: st.order || 0,
            },
          });
        } else {
          await prisma.impactStat.create({
            data: {
              label: st.label,
              value: st.value || '0',
              prefix: st.prefix || '',
              suffix: st.suffix || '+',
              isActive: true,
              order: st.order || 0,
            },
          });
        }
      }
    }

    await logAuditAction({
      action: 'UPDATE_STATS',
      module: 'CONTENT',
      performedBy: session.name,
      userEmail: session.email,
      details: 'Updated official impact statistics metrics.',
    });

    const updated = await prisma.impactStat.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ success: true, stats: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}
