import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rawId = params.id;
    if (!rawId) {
      return NextResponse.json({ error: 'Donation ID is required.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const isDownload = searchParams.get('download') === 'true';

    const donation = await prisma.donation.findFirst({
      where: {
        OR: [{ donationId: rawId }, { id: rawId }],
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found.' }, { status: 404 });
    }

    if (!donation.tenBePdfUrl) {
      return NextResponse.json(
        {
          error: 'Official Form 10BE certificate has not been uploaded yet for this contribution. Form 10BE is issued annually following 10BD filing with the Income Tax Department.',
        },
        { status: 404 }
      );
    }

    // Security Verification:
    // User must either provide the valid donor secureAccessToken OR be an authenticated admin
    const adminSession = getSessionFromRequest(req);
    const isTokenAuthorized = Boolean(token && donation.secureAccessToken && token === donation.secureAccessToken);
    const isAdminAuthorized = Boolean(adminSession && (adminSession.role === 'ADMIN' || adminSession.role === 'SUPER_ADMIN' || adminSession.role === 'FINANCE_MANAGER'));

    if (!isTokenAuthorized && !isAdminAuthorized) {
      return NextResponse.json(
        {
          error: 'Unauthorized document access: A valid donor security token or administrator session is required to access official tax certificates.',
        },
        { status: 403 }
      );
    }

    // Locate local file
    const cleanPath = donation.tenBePdfUrl.replace(/^\//, '').split('?')[0];
    const localFilePath = path.join(process.cwd(), 'public', cleanPath);

    if (!fs.existsSync(localFilePath)) {
      return NextResponse.json({ error: 'Certificate document file was not found on the server.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    const filename = `Form_10BE_${donation.donationId}.pdf`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error serving Form 10BE document:', error);
    return NextResponse.json({ error: 'Failed to retrieve Form 10BE certificate.' }, { status: 500 });
  }
}
