import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateCertificateNumber } from '@/lib/utils';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const certificateType = searchParams.get('type');
    const volunteerId = searchParams.get('volunteerId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (certificateType && certificateType !== 'ALL') where.certificateType = certificateType;
    if (volunteerId) where.volunteerId = volunteerId;
    if (search) {
      where.OR = [
        { certificateNumber: { contains: search } },
        { recipientName: { contains: search } },
        { recipientEmail: { contains: search } },
        { verificationCode: { contains: search } },
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        volunteer: {
          select: { id: true, volunteerId: true, fullName: true, mobile: true, email: true },
        },
        event: {
          select: { id: true, title: true, slug: true },
        },
        project: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      volunteerIds,
      certificateType = 'VOLUNTEER_SERVICE',
      title,
      recipientName,
      recipientEmail,
      recipientPhone,
      volunteerId,
      eventId,
      projectId,
      description,
      status = 'DRAFT',
      signatoryName = 'Raj Kumar Mahato',
      signatoryTitle = 'President & Managing Trustee',
      issueDate,
    } = body;

    // BATCH ISSUANCE MODE: If volunteerIds array is provided
    if (Array.isArray(volunteerIds) && volunteerIds.length > 0) {
      const volunteers = await prisma.volunteer.findMany({
        where: { id: { in: volunteerIds } },
      });

      if (volunteers.length === 0) {
        return NextResponse.json({ error: 'No volunteers found for the provided IDs.' }, { status: 404 });
      }

      const certTitle = title || `Certificate of ${certificateType.replace(/_/g, ' ')}`;
      const certDate = issueDate ? new Date(issueDate) : new Date();
      const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';
      let counter = await prisma.certificate.count();
      const createdCertificates = [];

      for (let i = 0; i < volunteers.length; i++) {
        const vol = volunteers[i];
        const certificateNumber = generateCertificateNumber(counter + i);
        const verificationCode = `VER-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const verificationUrl = `${origin}/verify/${certificateNumber}`;

        const created = await prisma.certificate.create({
          data: {
            certificateNumber,
            certificateType,
            title: certTitle,
            recipientName: vol.fullName,
            recipientEmail: vol.email || null,
            recipientPhone: vol.mobile || null,
            volunteerId: vol.id,
            eventId: eventId || null,
            projectId: projectId || null,
            description: description || null,
            status: status || 'DRAFT',
            issuedBy: session.name || 'Board of Trustees',
            approvedBy: status === 'ISSUED' ? session.name : null,
            signatoryName: signatoryName || 'Managing Trustee',
            signatoryTitle: signatoryTitle || 'President / Managing Trustee',
            verificationCode,
            verificationUrl,
            issueDate: certDate,
          },
        });
        createdCertificates.push(created);
      }

      await logAuditAction({
        action: status === 'ISSUED' ? 'CERTIFICATES_BATCH_ISSUED' : 'CERTIFICATES_BATCH_CREATED',
        module: 'CERTIFICATE',
        performedBy: session.name,
        userEmail: session.email,
        details: `Batch created ${createdCertificates.length} certificates for volunteers with status ${status}.`,
      });

      return NextResponse.json({
        success: true,
        count: createdCertificates.length,
        certificates: createdCertificates,
      }, { status: 201 });
    }

    // SINGLE ISSUANCE MODE
    if (!recipientName || !recipientName.trim()) {
      return NextResponse.json({ error: 'Recipient name is required.' }, { status: 400 });
    }

    // Generate concurrency-safe unique certificate number
    let certificateNumber = '';
    let counter = await prisma.certificate.count();
    let attempts = 0;
    while (!certificateNumber && attempts < 10) {
      const candidateNumber = generateCertificateNumber(counter + attempts);
      const exists = await prisma.certificate.findUnique({
        where: { certificateNumber: candidateNumber },
      });
      if (!exists) {
        certificateNumber = candidateNumber;
      } else {
        attempts++;
      }
    }
    if (!certificateNumber) {
      certificateNumber = `NVST-CERT-${Date.now().toString().slice(-6)}`;
    }

    const verificationCode = `VER-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';
    const verificationUrl = `${origin}/verify/${certificateNumber}`;

    const certTitle = title || `Certificate of ${certificateType.replace(/_/g, ' ')}`;

    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        certificateType,
        title: certTitle,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail ? recipientEmail.trim() : null,
        recipientPhone: recipientPhone ? recipientPhone.trim() : null,
        volunteerId: volunteerId || null,
        eventId: eventId || null,
        projectId: projectId || null,
        description: description || null,
        status: status || 'DRAFT',
        issuedBy: session.name || 'Board of Trustees',
        approvedBy: status === 'ISSUED' ? session.name : null,
        signatoryName: signatoryName || 'Managing Trustee',
        signatoryTitle: signatoryTitle || 'President / Managing Trustee',
        verificationCode,
        verificationUrl,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
      },
    });

    await logAuditAction({
      action: status === 'ISSUED' ? 'CERTIFICATE_ISSUED' : 'CERTIFICATE_CREATED',
      module: 'CERTIFICATE',
      performedBy: session.name,
      userEmail: session.email,
      details: `Certificate ${certificateNumber} (${certTitle}) created for ${recipientName} with status ${status}.`,
    });

    return NextResponse.json({ success: true, certificate }, { status: 201 });
  } catch (error: any) {
    console.error('Certificate creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create certificate' },
      { status: 500 }
    );
  }
}
