import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublicOnly = searchParams.get('publicOnly') === 'true';

    const where: any = {};
    if (isPublicOnly) where.isPublic = true;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'documents')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, year, fileUrl, fileSize, isPublic = true, description } = body;

    if (!title || !category || !fileUrl) {
      return NextResponse.json({ error: 'Title, category, and file URL are required' }, { status: 400 });
    }

    const doc = await prisma.document.create({
      data: {
        title,
        category,
        year: year || new Date().getFullYear().toString(),
        fileUrl,
        fileSize: fileSize || 'PDF Document',
        isPublic: isPublic !== undefined ? isPublic : true,
        description: description || '',
      },
    });

    await logAuditAction({
      action: 'DOCUMENT_UPLOAD',
      module: 'DOCUMENT',
      performedBy: session.name,
      userEmail: session.email,
      details: `Uploaded compliance document "${title}" (${category}).`,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
