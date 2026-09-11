import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBulkCertificatePdf, CertificatePdfData } from '@/lib/certificatePdf';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');
    let ids: string[] = [];

    if (idsParam) {
      ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No certificate IDs provided.' }, { status: 400 });
    }

    return await handleGenerateBulk(ids);
  } catch (error: any) {
    console.error('Error generating bulk certificate PDF:', error);
    return NextResponse.json({ error: 'Failed to generate bulk PDF.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No certificate IDs provided.' }, { status: 400 });
    }

    return await handleGenerateBulk(ids);
  } catch (error: any) {
    console.error('Error in bulk certificate PDF POST:', error);
    return NextResponse.json({ error: 'Failed to generate bulk PDF.' }, { status: 500 });
  }
}

async function handleGenerateBulk(ids: string[]) {
  const [certificates, trustDetail] = await Promise.all([
    prisma.certificate.findMany({
      where: {
        OR: [
          { id: { in: ids } },
          { certificateNumber: { in: ids } },
        ],
      },
      include: {
        event: { select: { title: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trustDetail.findFirst(),
  ]);

  if (certificates.length === 0) {
    return NextResponse.json({ error: 'No matching certificates found.' }, { status: 404 });
  }

  // Preserve requested order if possible
  const idMap = new Map(certificates.map((c) => [c.id, c]));
  const numberMap = new Map(certificates.map((c) => [c.certificateNumber, c]));

  const orderedCerts: typeof certificates = [];
  for (const reqId of ids) {
    const cert = idMap.get(reqId) || numberMap.get(reqId);
    if (cert && !orderedCerts.some((item) => item.id === cert.id)) {
      orderedCerts.push(cert);
    }
  }

  const finalCerts = orderedCerts.length > 0 ? orderedCerts : certificates;

  const pdfDataList: CertificatePdfData[] = finalCerts.map((cert) => ({
    certificateNumber: cert.certificateNumber,
    certificateType: cert.certificateType,
    title: cert.title,
    recipientName: cert.recipientName,
    recipientEmail: cert.recipientEmail,
    description: cert.description,
    issueDate: cert.issueDate,
    status: cert.status,
    signatoryName: cert.signatoryName || trustDetail?.presidentName || 'Managing Trustee',
    signatoryTitle: cert.signatoryTitle || trustDetail?.presidentTitle || 'President / Managing Trustee',
    verificationCode: cert.verificationCode,
    verificationUrl: cert.verificationUrl,
    eventName: cert.event?.title,
    projectName: cert.project?.title,
  }));

  const pdfBuffer = await generateBulkCertificatePdf(pdfDataList, {
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
  });

  return new NextResponse(pdfBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Nipania_Trust_Certificates_${finalCerts.length}_Pages.pdf"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
