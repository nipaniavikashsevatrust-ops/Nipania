import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCertificatePdf } from '@/lib/certificatePdf';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = decodeURIComponent(params.id).trim();
    const altNvst = rawId.replace(/^HRMEWT-CERT-/i, 'NVST-CERT-').replace(/^NVS-CERT-/i, 'NVST-CERT-');
    const altHrmewt = rawId.replace(/^NVST-CERT-/i, 'HRMEWT-CERT-');

    const [certificate, trustDetail] = await Promise.all([
      prisma.certificate.findFirst({
        where: {
          OR: [
            { id: rawId },
            { certificateNumber: rawId },
            { certificateNumber: altNvst },
            { certificateNumber: altHrmewt },
          ],
        },
        include: {
          event: { select: { title: true } },
          project: { select: { title: true } },
        },
      }),
      prisma.trustDetail.findFirst(),
    ]);

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const pdfBuffer = await generateCertificatePdf(
      {
        certificateNumber: certificate.certificateNumber,
        certificateType: certificate.certificateType,
        title: certificate.title,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        description: certificate.description,
        issueDate: certificate.issueDate,
        status: certificate.status,
        signatoryName: certificate.signatoryName || trustDetail?.presidentName || 'Managing Trustee',
        signatoryTitle: certificate.signatoryTitle || trustDetail?.presidentTitle || 'President / Managing Trustee',
        verificationCode: certificate.verificationCode,
        verificationUrl: certificate.verificationUrl,
        eventName: certificate.event?.title,
        projectName: certificate.project?.title,
      },
      {
        name: trustDetail?.name || 'NIPANIA VIKASH SEVA TRUST',
        tagline: trustDetail?.tagline || 'SEVA | VIKASH | SAMARPAN',
        pan: trustDetail?.pan || 'AAFTN4004N',
        darpanId: trustDetail?.darpanId || 'UP/2021/0295112',
        registrationNumber: trustDetail?.registrationNo || 'IV-120/2022',
        address: trustDetail?.registeredAddress || 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND – 828201',
        presidentName: trustDetail?.presidentName || 'Managing Trustee',
        presidentTitle: trustDetail?.presidentTitle || 'President / Managing Trustee',
        presidentSignature: trustDetail?.presidentSignature || null,
        presidentStamp: trustDetail?.presidentStamp || null,
      }
    );

    const isDownload = req.nextUrl.searchParams.get('download') === 'true';
    const disposition = isDownload ? 'attachment' : 'inline';

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${certificate.certificateNumber}_Certificate.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error streaming certificate PDF:', error);
    return NextResponse.json({ error: 'Failed to generate certificate PDF' }, { status: 500 });
  }
}
