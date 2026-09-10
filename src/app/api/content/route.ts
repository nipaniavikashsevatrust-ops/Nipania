import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const blocks = await prisma.contentBlock.findMany();
    return NextResponse.json({ blocks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content blocks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'content')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, title, subtitle, content, jsonContent } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const block = await prisma.contentBlock.upsert({
      where: { key },
      update: {
        title: title !== undefined ? title : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        content: content !== undefined ? content : undefined,
        jsonContent: jsonContent !== undefined ? jsonContent : undefined,
      },
      create: {
        key,
        title: title || null,
        subtitle: subtitle || null,
        content: content || null,
        jsonContent: jsonContent || null,
      },
    });

    await logAuditAction({
      action: 'UPDATE_CONTENT',
      module: 'CONTENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Updated CMS block "${key}".`,
    });

    return NextResponse.json({ success: true, block });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content block' }, { status: 500 });
  }
}
