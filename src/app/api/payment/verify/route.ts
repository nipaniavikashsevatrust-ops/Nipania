import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature, fetchPaymentDetails } from '@/lib/razorpay';
import { sendDonationReceiptEmail } from '@/lib/mailer';
import { generateDonationReceiptPdf } from '@/lib/donationReceiptPdf';
import { generateDonationId } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';
import { getFinancialYear } from '@/lib/financialYear';
import { generateSecureAccessToken } from '@/lib/tenBd';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      donorName,
      donorEmail,
      donorPhone,
      donorPan,
      donorAddress,
      amount,
      projectId,
      purpose,
      projectTitle: rawProjectTitle,
      isAnonymous,
      paymentMethod = 'ONLINE',
      mandateRail,
    } = body;

    if (!donorName || !donorEmail || !donorPhone) {
      return NextResponse.json(
        { error: 'Donor name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    const paymentId = razorpay_payment_id || `PAY_${Date.now()}`;
    const subscriptionId = razorpay_subscription_id || (body.subscriptionId ? String(body.subscriptionId) : null);
    const orderId = subscriptionId || razorpay_order_id || `ORD_${Date.now()}`;

    // Verify payment signature for online gateways if signature is provided
    if (razorpay_signature) {
      const isValid = await verifyRazorpaySignature({
        razorpay_order_id: razorpay_order_id || undefined,
        razorpay_subscription_id: subscriptionId || undefined,
        razorpay_payment_id: paymentId,
        razorpay_signature,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Payment signature verification failed. Please contact support.' },
          { status: 400 }
        );
      }
    }

    // Determine donation amount in INR (convert if paise passed from payment provider)
    let donationAmount = parseFloat(String(amount || '0').replace(/[^0-9.]/g, ''));
    if (body.isPaise === true && donationAmount > 0) {
      donationAmount = donationAmount / 100;
    }

    // Generate collision-safe unique donation ID
    const count = await prisma.donation.count();
    let donationId = '';
    let counter = count;
    while (true) {
      donationId = generateDonationId(counter);
      const exists = await prisma.donation.findUnique({ where: { donationId } });
      if (!exists) break;
      counter++;
    }

    const actualDonorName = isAnonymous ? 'Anonymous Well-Wisher' : String(donorName).trim();
    const cleanEmail = String(donorEmail).trim().toLowerCase();
    const cleanPhone = String(donorPhone).trim();
    const cleanPan = donorPan ? String(donorPan).trim().toUpperCase() : null;
    const cleanAddress = donorAddress ? String(donorAddress).trim() : null;
    const projectTitle = rawProjectTitle || purpose || 'General Social Welfare Fund';
    const donationType = (body.type || body.frequency || (body.isMandate ? 'MONTHLY' : 'ONE_TIME')).toUpperCase();
    const isMandate = donationType === 'MONTHLY';
    const actualPaymentMethod = isMandate 
      ? `ONLINE (E-MANDATE / ${mandateRail || 'AUTOPAY'})` 
      : (paymentMethod || 'ONLINE').toUpperCase();
    const mandateNotes = isMandate
      ? `Monthly recurring e-Mandate authorized via Razorpay ${mandateRail || 'Autopay'}. Mandate/Sub ID: ${subscriptionId || orderId}. Initial installment of ₹${donationAmount} processed.`
      : null;

    // Save donation to database
    const fy = getFinancialYear(new Date());
    const secureAccessToken = generateSecureAccessToken(donationId);

    const donation = await prisma.donation.create({
      data: {
        donationId,
        donorName: actualDonorName,
        donorEmail: cleanEmail,
        donorPhone: cleanPhone,
        donorPan: cleanPan,
        donorAddress: cleanAddress,
        amount: donationAmount,
        type: donationType,
        paymentMethod: actualPaymentMethod,
        paymentId: String(paymentId),
        orderId: String(orderId),
        status: 'SUCCESS',
        projectId: projectId || null,
        projectTitle,
        isReceiptIssued: true,
        notes: mandateNotes,
        financialYear: fy,
        donationEligible80G: true,
        tenBdStatus: 'PENDING',
        tenBeStatus: 'PENDING',
        tenBeEmailStatus: 'NOT_SENT',
        secureAccessToken,
      },
    });

    // If tied to a project, increment raised amount
    if (projectId) {
      try {
        await prisma.project.update({
          where: { id: projectId },
          data: {
            raisedAmount: {
              increment: donationAmount,
            },
          },
        });
      } catch (err) {
        console.warn('Project increment warning:', err);
      }
    }

    // Generate official A4 Section 80G Tax Exemption Receipt PDF Buffer
    let receiptPdfBuffer: Buffer | undefined;
    try {
      receiptPdfBuffer = await generateDonationReceiptPdf({
        donationId,
        donorName: actualDonorName,
        donorEmail: cleanEmail,
        donorPhone: cleanPhone,
        donorPan: cleanPan,
        donorAddress: cleanAddress,
        amount: donationAmount,
        paymentMethod: actualPaymentMethod,
        paymentId: String(paymentId),
        orderId: String(orderId),
        projectTitle,
        date: new Date(),
      });
    } catch (pdfErr) {
      console.error('Failed to generate 80G donation receipt PDF:', pdfErr);
    }

    // Dispatch official 80G Donation Receipt Email with PDF Attachment
    let emailResult = { success: false, message: '' };
    if (!isAnonymous && cleanEmail) {
      try {
        emailResult = await sendDonationReceiptEmail({
          recipientEmail: cleanEmail,
          recipientName: actualDonorName,
          donationId,
          amount: donationAmount,
          paymentMethod: actualPaymentMethod,
          paymentId: String(paymentId),
          projectTitle,
          donorPan: cleanPan,
          pdfBuffer: receiptPdfBuffer,
        });
      } catch (mailErr) {
        console.error('Failed to dispatch 80G donation receipt email:', mailErr);
      }
    }

    await logAuditAction({
      action: 'DONATION_RECEIVED',
      module: 'DONATION',
      performedBy: actualDonorName,
      userEmail: cleanEmail,
      details: `New donation of ₹${donationAmount} processed successfully with ID ${donationId} (${actualPaymentMethod}). 80G receipt dispatched.`,
    });

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        donationId: donation.donationId,
        amount: donation.amount,
        type: donation.type,
        paymentMethod: donation.paymentMethod,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        receiptSent: emailResult.success,
        paymentId: donation.paymentId,
        notes: donation.notes,
        isMandate: donation.type === 'MONTHLY',
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify and finalize donation.' },
      { status: 500 }
    );
  }
}
