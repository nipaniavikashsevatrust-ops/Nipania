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

    // Fetch trust settings for PDF generation
    const trustSettings = await prisma.trustDetail.findFirst();

    const trustConfig = {
      name: trustSettings?.name || 'NIPANIA VIKASH SEVA TRUST',
      tagline: trustSettings?.tagline || 'SEVA | VIKASH | SAMARPAN',
      pan: trustSettings?.pan || 'AAFTN4004N',
      darpanId: trustSettings?.darpanId || 'UP/2021/0295112',
      registrationNumber: trustSettings?.registrationNo || 'IV-120/2022',
      address: trustSettings?.registeredAddress || 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND – 828201',
      presidentName: trustSettings?.presidentName || 'Managing Trustee',
      presidentTitle: trustSettings?.presidentTitle || 'President / Managing Trustee',
      presidentSignature: trustSettings?.presidentSignature || '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png',
      presidentStamp: trustSettings?.presidentStamp || '/uploads/1788718898264-ChatGPT_Image_Jul_16__2026__12_22_33_PM__1_.png',
    };

    // Generate A4 PDF buffer with trust settings
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateCertificatePdf(
        {
          certificateNumber: certificate.certificateNumber,
          certificateType: certificate.certificateType,
          title: certificate.title,
          recipientName: certificate.recipientName,
          recipientEmail: certificate.recipientEmail,
          description: certificate.description,
          issueDate: certificate.issueDate,
          status: certificate.status,
          signatoryName: certificate.signatoryName || trustConfig.presidentName,
          signatoryTitle: certificate.signatoryTitle || trustConfig.presidentTitle,
          verificationCode: certificate.verificationCode,
          verificationUrl: certificate.verificationUrl,
          eventName: certificate.event?.title,
          projectName: certificate.project?.title,
        },
        trustConfig
      );
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
