import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });

    return NextResponse.json({ settings, trust: settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'settings')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Fetch existing settings to preserve SMTP credentials if not provided
    const existing = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });

    // Build update object, preserving existing SMTP credentials if new ones aren't provided
    const updateData: any = {
      name: body.name || 'NIPANIA VIKASH SEVA TRUST',
      pan: body.pan || 'AAFTN4004N',
      tagline: body.tagline || 'SEVA | VIKASH | SAMARPAN',
      registrationNo: body.registrationNo || null,
      darpanId: body.darpanId || null,
      registrationAuthority: body.registrationAuthority || null,
      applicableAct: body.applicableAct || null,
      incorporationDate: body.incorporationDate || null,
      trustDeedDate: body.trustDeedDate || null,
      reg12aNo: body.reg12aNo || null,
      reg80gNo: body.reg80gNo || null,
      csrNo: body.csrNo || null,
      fcraNo: body.fcraNo || null,
      registeredAddress: body.registeredAddress || null,
      correspondenceAddress: body.correspondenceAddress || null,
      district: body.district || null,
      state: body.state || null,
      pinCode: body.pinCode || null,
      email: body.email || null,
      phone: body.phone || null,
      altPhone: body.altPhone || null,
      website: body.website || null,
      facebook: body.facebook || null,
      instagram: body.instagram || null,
      twitter: body.twitter || null,
      linkedin: body.linkedin || null,
      youtube: body.youtube || null,
      upiId: body.upiId !== undefined ? (body.upiId?.trim() || null) : (existing?.upiId || null),
      upiPayeeName: body.upiPayeeName !== undefined ? (body.upiPayeeName?.trim() || null) : (existing?.upiPayeeName || null),
      upiQrImage: body.upiQrImage !== undefined ? (body.upiQrImage?.trim() || null) : (existing?.upiQrImage || null),
      accountName: body.accountName !== undefined ? (body.accountName?.trim() || null) : (existing?.accountName || null),
      accountNumber: body.accountNumber !== undefined ? (body.accountNumber?.trim() || null) : (existing?.accountNumber || null),
      bankName: body.bankName !== undefined ? (body.bankName?.trim() || null) : (existing?.bankName || null),
      ifscCode: body.ifscCode !== undefined ? (body.ifscCode?.trim()?.toUpperCase() || null) : (existing?.ifscCode || null),
      branchName: body.branchName !== undefined ? (body.branchName?.trim() || null) : (existing?.branchName || null),
      isBankPublic: body.isBankPublic !== undefined ? Boolean(body.isBankPublic) : (existing?.isBankPublic ?? true),
      presidentName: body.presidentName !== undefined ? (body.presidentName?.trim() || null) : (existing?.presidentName || 'Managing Trustee'),
      presidentTitle: body.presidentTitle !== undefined ? (body.presidentTitle?.trim() || null) : (existing?.presidentTitle || 'President / Managing Trustee'),
      presidentSignature: body.presidentSignature !== undefined ? (body.presidentSignature?.trim() || null) : (existing?.presidentSignature || null),
      presidentStamp: body.presidentStamp !== undefined ? (body.presidentStamp?.trim() || null) : (existing?.presidentStamp || null),
      smtpHost: body.smtpHost || (existing?.smtpHost || 'smtp.gmail.com'),
      smtpPort: body.smtpPort ? parseInt(body.smtpPort) : (existing?.smtpPort || 587),
      smtpSecure: (() => {
        const port = body.smtpPort ? parseInt(body.smtpPort) : (existing?.smtpPort || 587);
        if (port === 465) return true;
        if (port === 587 || port === 25) return false;
        return body.smtpSecure === true;
      })(),
      // Preserve existing SMTP credentials if not provided in the update
      smtpUser: body.smtpUser || existing?.smtpUser || null,
      smtpPassword: body.smtpPassword || existing?.smtpPassword || null,
      smtpSenderName: body.smtpSenderName || (existing?.smtpSenderName || 'Nipania Vikash Seva Trust'),
      smtpSenderEmail: body.smtpSenderEmail || (existing?.smtpSenderEmail || 'info@nipaniatrust.org'),
      // Payment Gateway & Membership Fee Settings (INR Currency)
      paymentGatewayEnabled: body.paymentGatewayEnabled !== undefined ? Boolean(body.paymentGatewayEnabled) : (existing?.paymentGatewayEnabled ?? false),
      paymentGatewayProvider: body.paymentGatewayProvider || (existing?.paymentGatewayProvider || 'RAZORPAY'),
      paymentGatewayMode: body.paymentGatewayMode || (existing?.paymentGatewayMode || 'TEST'),
      paymentCurrency: 'INR',
      // Razorpay credentials
      razorpayKeyId: body.razorpayKeyId !== undefined ? (body.razorpayKeyId?.trim() || null) : (existing?.razorpayKeyId || null),
      razorpayKeySecret: body.razorpayKeySecret !== undefined ? (body.razorpayKeySecret?.trim() || null) : (existing?.razorpayKeySecret || null),
      razorpayWebhookSecret: body.razorpayWebhookSecret !== undefined ? (body.razorpayWebhookSecret?.trim() || null) : (existing?.razorpayWebhookSecret || null),
      // Cashfree credentials
      cashfreeAppId: body.cashfreeAppId !== undefined ? (body.cashfreeAppId?.trim() || null) : (existing?.cashfreeAppId || null),
      cashfreeSecretKey: body.cashfreeSecretKey !== undefined ? (body.cashfreeSecretKey?.trim() || null) : (existing?.cashfreeSecretKey || null),
      cashfreeApiVersion: body.cashfreeApiVersion || (existing?.cashfreeApiVersion || '2023-08-01'),
      // PhonePe credentials
      phonepeMerchantId: body.phonepeMerchantId !== undefined ? (body.phonepeMerchantId?.trim() || null) : (existing?.phonepeMerchantId || null),
      phonepeSaltKey: body.phonepeSaltKey !== undefined ? (body.phonepeSaltKey?.trim() || null) : (existing?.phonepeSaltKey || null),
      phonepeSaltIndex: body.phonepeSaltIndex || (existing?.phonepeSaltIndex || '1'),
      // Paytm credentials
      paytmMerchantId: body.paytmMerchantId !== undefined ? (body.paytmMerchantId?.trim() || null) : (existing?.paytmMerchantId || null),
      paytmMerchantKey: body.paytmMerchantKey !== undefined ? (body.paytmMerchantKey?.trim() || null) : (existing?.paytmMerchantKey || null),
      paytmWebsite: body.paytmWebsite || (existing?.paytmWebsite || 'DEFAULT'),
      // Instamojo credentials
      instamojoApiKey: body.instamojoApiKey !== undefined ? (body.instamojoApiKey?.trim() || null) : (existing?.instamojoApiKey || null),
      instamojoAuthToken: body.instamojoAuthToken !== undefined ? (body.instamojoAuthToken?.trim() || null) : (existing?.instamojoAuthToken || null),
      instamojoSalt: body.instamojoSalt !== undefined ? (body.instamojoSalt?.trim() || null) : (existing?.instamojoSalt || null),
      // CCAvenue credentials
      ccavenueMerchantId: body.ccavenueMerchantId !== undefined ? (body.ccavenueMerchantId?.trim() || null) : (existing?.ccavenueMerchantId || null),
      ccavenueAccessCode: body.ccavenueAccessCode !== undefined ? (body.ccavenueAccessCode?.trim() || null) : (existing?.ccavenueAccessCode || null),
      ccavenueWorkingKey: body.ccavenueWorkingKey !== undefined ? (body.ccavenueWorkingKey?.trim() || null) : (existing?.ccavenueWorkingKey || null),
      // Stripe credentials
      stripePublishableKey: body.stripePublishableKey !== undefined ? (body.stripePublishableKey?.trim() || null) : (existing?.stripePublishableKey || null),
      stripeSecretKey: body.stripeSecretKey !== undefined ? (body.stripeSecretKey?.trim() || null) : (existing?.stripeSecretKey || null),
      // Membership Fee Controls
      membershipFeeEnabled: body.membershipFeeEnabled !== undefined ? Boolean(body.membershipFeeEnabled) : (existing?.membershipFeeEnabled ?? true),
      generalMemberFee: body.generalMemberFee !== undefined ? parseFloat(body.generalMemberFee) : (existing?.generalMemberFee ?? 500),
      lifeMemberFee: body.lifeMemberFee !== undefined ? parseFloat(body.lifeMemberFee) : (existing?.lifeMemberFee ?? 5000),
      executiveMemberFee: body.executiveMemberFee !== undefined ? parseFloat(body.executiveMemberFee) : (existing?.executiveMemberFee ?? 2100),
      patronMemberFee: body.patronMemberFee !== undefined ? parseFloat(body.patronMemberFee) : (existing?.patronMemberFee ?? 11000),
    };

    const updated = await prisma.trustDetail.upsert({
      where: { id: 'trust-settings' },
      update: updateData,
      create: {
        id: 'trust-settings',
        name: body.name || 'NIPANIA VIKASH SEVA TRUST',
        pan: body.pan || 'AAFTN4004N',
        tagline: body.tagline || 'SEVA | VIKASH | SAMARPAN',
        email: body.email || 'info@nipaniatrust.org',
        presidentName: body.presidentName || 'Managing Trustee',
        presidentTitle: body.presidentTitle || 'President / Managing Trustee',
        presidentSignature: body.presidentSignature || null,
        presidentStamp: body.presidentStamp || null,
        smtpHost: body.smtpHost || 'smtp.gmail.com',
        smtpPort: body.smtpPort ? parseInt(body.smtpPort) : 587,
        smtpSecure: body.smtpPort ? parseInt(body.smtpPort) === 465 : false,
        smtpUser: body.smtpUser || null,
        smtpPassword: body.smtpPassword || null,
        smtpSenderName: body.smtpSenderName || 'Nipania Vikash Seva Trust',
        smtpSenderEmail: body.smtpSenderEmail || 'info@nipaniatrust.org',
      },
    });

    await logAuditAction({
      action: 'UPDATE_SETTINGS',
      module: 'SETTINGS',
      performedBy: session.name,
      userEmail: session.email,
      details: `Updated Trust configuration settings.`,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
