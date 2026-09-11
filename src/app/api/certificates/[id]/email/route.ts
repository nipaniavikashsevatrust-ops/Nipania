import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateCertificatePdf } from '@/lib/certificatePdf';
import { sendCertificateEmail } from '@/lib/mailer';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id: params.id },
          { certificateNumber: params.id },
        ],
      },
      include: {
        event: { select: { title: true } },
        project: { select: { title: true } },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (certificate.status !== 'ISSUED') {
      return NextResponse.json(
        { error: 'Only officially ISSUED certificates can be emailed to recipients.' },
        { status: 400 }
      );
    }

    if (!certificate.recipientEmail) {
      return NextResponse.json(
        { error: 'No email address registered for this certificate recipient.' },
        { status: 400 }
      );
    }

    // Generate A4 PDF buffer
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateCertificatePdf({
        certificateNumber: certificate.certificateNumber,
        certificateType: certificate.certificateType,
        title: certificate.title,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        description: certificate.description,
        issueDate: certificate.issueDate,
        status: certificate.status,
        signatoryName: certificate.signatoryName,
        signatoryTitle: certificate.signatoryTitle,
        verificationCode: certificate.verificationCode,
        verificationUrl: certificate.verificationUrl,
        eventName: certificate.event?.title,
        projectName: certificate.project?.title,
      });
    } catch (pdfErr) {
      console.warn('PDF generation warning for certificate email:', pdfErr);
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';
    const verifyUrl = certificate.verificationUrl || `${origin}/verify/${certificate.certificateNumber}`;

    const mailRes = await sendCertificateEmail({
      recipientEmail: certificate.recipientEmail,
      recipientName: certificate.recipientName,
      certificateNumber: certificate.certificateNumber,
      certificateType: certificate.certificateType,
      title: certificate.title,
      issueDate: certificate.issueDate,
      verificationUrl: verifyUrl,
      pdfBuffer,
    });

    await logAuditAction({
      action: 'CERTIFICATE_EMAILED',
      module: 'CERTIFICATE',
      performedBy: session.name,
      userEmail: session.email,
      details: `Certificate ${certificate.certificateNumber} emailed to ${certificate.recipientEmail}. Result: ${mailRes.message}`,
    });

    return NextResponse.json({ success: mailRes.success, message: mailRes.message });
  } catch (error: any) {
    console.error('Error emailing certificate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch certificate email' },
      { status: 500 }
    );
  }
}
