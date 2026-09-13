import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateCertificatePdf } from '@/lib/certificatePdf';
import { sendCertificateEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one certificate to email.' },
        { status: 400 }
      );
    }

    // Fetch certificates
    const certificates = await prisma.certificate.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        event: { select: { title: true } },
        project: { select: { title: true } },
      },
    });

    if (certificates.length === 0) {
      return NextResponse.json({ error: 'No matching certificates found.' }, { status: 404 });
    }

    // Query active TrustDetail for real credentials and signature/stamp assets
    const trust = await prisma.trustDetail.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    const trustConfig = {
      name: trust?.name || 'Nipania Vikash Seva Trust',
      tagline: trust?.tagline || 'SEVA • VIKASH • SAMARPAN',
      address: trust?.registeredAddress || 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND – 828201',
      registrationNumber: trust?.registrationNo || 'IV-120/2022',
      pan: trust?.pan || 'AAFTN4004N',
      darpanId: trust?.darpanId || 'UP/2021/0295112',
      presidentName: trust?.presidentName || 'Raj Kumar Mahato',
      presidentTitle: trust?.presidentTitle || 'President & Managing Trustee',
      presidentSignature: trust?.presidentSignature || '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png',
      presidentStamp: trust?.presidentStamp || '/uploads/1788718898264-ChatGPT_Image_Jul_16__2026__12_22_33_PM__1_.png',
    };

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const results: Array<{
      id: string;
      certificateNumber: string;
      recipientName: string;
      email?: string;
      status: 'SENT' | 'FAILED' | 'SKIPPED';
      reason?: string;
    }> = [];

    for (const cert of certificates) {
      // Check recipient email
      if (!cert.recipientEmail || !cert.recipientEmail.trim()) {
        skippedCount++;
        results.push({
          id: cert.id,
          certificateNumber: cert.certificateNumber,
          recipientName: cert.recipientName,
          status: 'SKIPPED',
          reason: 'No email address registered for recipient',
        });
        continue;
      }

      // If draft, promote to ISSUED
      let activeStatus = cert.status;
      if (cert.status === 'DRAFT') {
        try {
          await prisma.certificate.update({
            where: { id: cert.id },
            data: { status: 'ISSUED' },
          });
          activeStatus = 'ISSUED';
        } catch (updateErr) {
          console.warn(`Failed to promote draft certificate ${cert.certificateNumber} to ISSUED:`, updateErr);
        }
      }

      // Generate A4 PDF
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateCertificatePdf(
          {
            certificateNumber: cert.certificateNumber,
            certificateType: cert.certificateType,
            title: cert.title,
            recipientName: cert.recipientName,
            recipientEmail: cert.recipientEmail,
            description: cert.description,
            issueDate: cert.issueDate,
            status: activeStatus,
            signatoryName: cert.signatoryName || trustConfig.presidentName,
            signatoryTitle: cert.signatoryTitle || trustConfig.presidentTitle,
            verificationCode: cert.verificationCode,
            verificationUrl: cert.verificationUrl,
            eventName: cert.event?.title,
            projectName: cert.project?.title,
          },
          trustConfig
        );
      } catch (pdfErr) {
        console.warn(`PDF generation error for ${cert.certificateNumber}:`, pdfErr);
      }

      const verifyUrl = cert.verificationUrl || `${origin}/verify/${cert.certificateNumber}`;

      // Send official email with PDF attachment
      try {
        const mailRes = await sendCertificateEmail({
          recipientEmail: cert.recipientEmail,
          recipientName: cert.recipientName,
          certificateNumber: cert.certificateNumber,
          certificateType: cert.certificateType,
          title: cert.title,
          issueDate: cert.issueDate,
          verificationUrl: verifyUrl,
          pdfBuffer,
        });

        if (mailRes.success) {
          sentCount++;
          results.push({
            id: cert.id,
            certificateNumber: cert.certificateNumber,
            recipientName: cert.recipientName,
            email: cert.recipientEmail,
            status: 'SENT',
          });
        } else {
          failedCount++;
          results.push({
            id: cert.id,
            certificateNumber: cert.certificateNumber,
            recipientName: cert.recipientName,
            email: cert.recipientEmail,
            status: 'FAILED',
            reason: mailRes.message || 'SMTP dispatch failed',
          });
        }
      } catch (mailErr: any) {
        failedCount++;
        results.push({
          id: cert.id,
          certificateNumber: cert.certificateNumber,
          recipientName: cert.recipientName,
          email: cert.recipientEmail,
          status: 'FAILED',
          reason: mailErr.message || 'Mail delivery exception',
        });
      }
    }

    await logAuditAction({
      action: 'CERTIFICATES_BULK_EMAILED',
      module: 'CERTIFICATE',
      performedBy: session.name,
      userEmail: session.email,
      details: `Bulk certificate email dispatched: ${sentCount} sent, ${failedCount} failed, ${skippedCount} skipped out of ${certificates.length} total.`,
    });

    return NextResponse.json({
      success: true,
      total: certificates.length,
      sentCount,
      failedCount,
      skippedCount,
      results,
    });
  } catch (error: any) {
    console.error('Error in bulk emailing certificates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process bulk certificate emails' },
      { status: 500 }
    );
  }
}
