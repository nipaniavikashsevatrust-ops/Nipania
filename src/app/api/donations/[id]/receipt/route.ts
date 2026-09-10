import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDonationReceiptPdf } from '@/lib/donationReceiptPdf';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    if (!rawId) {
      return NextResponse.json({ error: 'Donation ID is required.' }, { status: 400 });
    }

    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { donationId: rawId },
          { id: rawId },
          { paymentId: rawId },
        ],
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found.' }, { status: 404 });
    }

    const isPrint = req.nextUrl.searchParams.get('print') === 'true';
    const isInline = isPrint || req.nextUrl.searchParams.get('inline') === 'true' || req.nextUrl.searchParams.get('view') === 'true';

    const pdfBuffer = await generateDonationReceiptPdf({
      donationId: donation.donationId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      donorPan: donation.donorPan,
      donorAddress: donation.donorAddress,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod,
      paymentId: donation.paymentId,
      orderId: donation.orderId,
      projectTitle: donation.projectTitle,
      date: donation.createdAt,
      autoPrint: isPrint,
    });

    const contentDisposition = isInline
      ? 'inline'
      : `attachment; filename="80G_Receipt_${donation.donationId}.pdf"`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Failed to stream donation receipt PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate donation receipt PDF.' },
      { status: 500 }
    );
  }
}
