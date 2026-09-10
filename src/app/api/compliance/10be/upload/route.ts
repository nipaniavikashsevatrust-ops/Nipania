import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (!hasPermission(session.role, 'compliance') && !hasPermission(session.role, 'donations'))) {
      return NextResponse.json({ error: 'Unauthorized: Uploading official Form 10BE requires admin access.' }, { status: 401 });
    }

    const formData = await req.formData();
    const donationId = formData.get('donationId') as string;
    const tenBeNumber = (formData.get('tenBeNumber') as string) || '';
    const tenBeIssueDateStr = formData.get('tenBeIssueDate') as string;
    const file = formData.get('file') as File | null;

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Form 10BE PDF file is required.' }, { status: 400 });
    }

    // 1. File Type & Extension Validation
    const originalName = file.name || 'form_10be.pdf';
    const ext = path.extname(originalName).toLowerCase();
    if (ext !== '.pdf' || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only official PDF documents are accepted.' }, { status: 400 });
    }

    // 2. File Size Validation (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit. Please upload a compressed PDF.' }, { status: 400 });
    }

    // 3. Magic Bytes Security Validation (%PDF)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const header = buffer.subarray(0, 4).toString('ascii');
    if (header !== '%PDF') {
      return NextResponse.json({ error: 'Security verification failed: File content does not match genuine PDF header.' }, { status: 400 });
    }

    // 4. Locate target donation
    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { donationId },
          { id: donationId },
        ],
      },
    });

    if (!donation) {
      return NextResponse.json({ error: `Donation record "${donationId}" not found.` }, { status: 404 });
    }

    // 5. Store File Securely
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', '10be');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sanitizedDonationId = donation.donationId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `10BE_${sanitizedDonationId}_${Date.now()}.pdf`;
    const targetFilePath = path.join(uploadDir, filename);

    fs.writeFileSync(targetFilePath, buffer);

    const pdfUrl = `/uploads/10be/${filename}`;
    const issueDate = tenBeIssueDateStr ? new Date(tenBeIssueDateStr) : new Date();

    const isReplacement = Boolean(donation.tenBePdfUrl);

    // 6. Update Donation Record
    const updated = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        tenBeStatus: 'UPLOADED',
        tenBeNumber: tenBeNumber.trim() || donation.tenBeNumber || `10BE-${donation.financialYear || 'FY'}-${donation.donationId}`,
        tenBeIssueDate: issueDate,
        tenBePdfUrl: pdfUrl,
        tenBeUploadedAt: new Date(),
        tenBeUploadedBy: session.email,
        // Reset email status if replacing to allow resending fresh document
        ...(isReplacement ? { tenBeEmailStatus: 'NOT_SENT', tenBeEmailError: null } : {}),
      },
    });

    // 7. Record Compliance Audit Trail
    await logAuditAction({
      action: isReplacement ? '10BE_REPLACED' : '10BE_UPLOADED',
      module: 'DONATION',
      performedBy: session.name || session.email,
      userEmail: session.email,
      details: `${isReplacement ? 'Replaced' : 'Uploaded'} official Form 10BE for donation ${donation.donationId}. Cert No: ${updated.tenBeNumber}, File: ${filename}.`,
    });

    return NextResponse.json({
      success: true,
      message: `Official Form 10BE successfully ${isReplacement ? 'updated' : 'uploaded'} for ${donation.donationId}.`,
      donation: updated,
    });
  } catch (error: any) {
    console.error('Error uploading 10BE PDF:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload Form 10BE.' }, { status: 500 });
  }
}
