import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, createRazorpaySubscription, getRazorpayClient } from '@/lib/razorpay';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { amount, donorName, donorEmail, donorPhone, projectId, purpose, projectTitle, frequency } = body;
    const isMonthlyMandate = frequency === 'MONTHLY';

    // Validate required fields
    if (!amount || !donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Donor name, email address, and donation amount are required.' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { error: 'Donation amount must be at least ₹1.' },
        { status: 400 }
      );
    }

    const trust = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });

    const designatedPurpose = projectTitle || purpose || 'General Social Welfare Fund';

    const receipt = `DON_${Date.now()}`;
    const notes: Record<string, any> = {
      donor_name: String(donorName).trim(),
      donor_email: String(donorEmail).trim(),
      donor_phone: donorPhone ? String(donorPhone).trim() : 'N/A',
      project_id: projectId || 'general',
      purpose: designatedPurpose,
      contribution_type: isMonthlyMandate ? 'MONTHLY_MANDATE' : 'ONE_TIME',
    };

    if (isMonthlyMandate) {
      notes.mandate_type = 'MONTHLY_E_MANDATE';
      notes.frequency = 'MONTHLY';
      notes.is_mandate = 'true';

      // 1. Official Razorpay Subscriptions / e-Mandate method
      const subResult = await createRazorpaySubscription({
        amount: numAmount,
        planName: `Monthly Seva - ${designatedPurpose.substring(0, 35)}`,
        currency: 'INR',
        totalCount: 60, // 60 months recurring mandate
        notes,
      });

      if (subResult.success && subResult.subscriptionId) {
        const client = await getRazorpayClient();
        return NextResponse.json({
          success: true,
          isSubscription: true,
          subscriptionId: subResult.subscriptionId,
          planId: subResult.planId,
          orderId: subResult.subscriptionId, // dual compatibility
          amount: subResult.amount,
          amountInRupees: numAmount,
          currency: 'INR',
          receipt,
          keyId: subResult.keyId || client.keyId,
          provider: (trust?.paymentGatewayProvider || 'RAZORPAY').toUpperCase(),
          mode: trust?.paymentGatewayMode || 'TEST',
          gatewayEnabled: trust?.paymentGatewayEnabled ?? false,
          isSimulated: subResult.isSimulated ?? false,
          isMandate: true,
          mandateFrequency: 'MONTHLY',
          frequency: 'MONTHLY',
          merchantName: trust?.name || 'Nipania Vikash Seva Trust',
          upiId: trust?.upiId || '',
          upiPayeeName: trust?.upiPayeeName || 'Nipania Vikash Seva Trust',
          upiQrImage: trust?.upiQrImage || '',
        });
      }
    }

    const result = await createRazorpayOrder({
      amount: numAmount,
      receipt,
      notes,
      isMandate: isMonthlyMandate,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initialize payment gateway order.' },
        { status: 500 }
      );
    }

    const client = await getRazorpayClient();

    return NextResponse.json({
      success: true,
      orderId: result.order!.id,
      order: result.order,
      amount: result.order!.amount,
      amountInRupees: numAmount,
      currency: 'INR',
      receipt: result.order!.receipt,
      keyId: result.keyId || client.keyId,
      provider: (trust?.paymentGatewayProvider || 'RAZORPAY').toUpperCase(),
      mode: trust?.paymentGatewayMode || 'TEST',
      gatewayEnabled: trust?.paymentGatewayEnabled ?? false,
      isSimulated: result.isSimulated ?? false,
      isMandate: isMonthlyMandate,
      mandateFrequency: isMonthlyMandate ? 'MONTHLY' : null,
      frequency: isMonthlyMandate ? 'MONTHLY' : 'ONE_TIME',
      merchantName: trust?.name || 'Nipania Vikash Seva Trust',
      upiId: trust?.upiId || '',
      upiPayeeName: trust?.upiPayeeName || 'Nipania Vikash Seva Trust',
      upiQrImage: trust?.upiQrImage || '',
    });
  } catch (error: any) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal payment server error.' },
      { status: 500 }
    );
  }
}
