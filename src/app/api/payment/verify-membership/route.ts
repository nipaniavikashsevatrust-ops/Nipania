import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendMembershipFeeReceiptEmail } from '@/lib/mailer';
import { generateRegistrationReceiptPdf } from '@/lib/registrationReceiptPdf';
import { generateMemberId } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';

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
      razorpay_payment_id,
      razorpay_signature,
      membershipData,
    } = body;

    const paymentId = razorpay_payment_id || `PAY_MEM_${Date.now()}`;
    const orderId = razorpay_order_id || `ORD_MEM_${Date.now()}`;

    // Verify payment signature if signature was provided
    if (razorpay_signature) {
      const isValid = await verifyRazorpaySignature({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Payment signature verification failed.' },
          { status: 400 }
        );
      }
    }

    const {
      fullName,
      email,
      phone,
      mobile,
      membershipType,
      category,
      amount,
      feeAmount,
      address,
      district,
      state,
      pincode,
      occupation,
      dateOfBirth,
      dob,
      gender,
      guardianName,
      photoUrl,
    } = membershipData || body;

    const applicantName = String(fullName || '').trim();
    const applicantEmail = String(email || '').trim().toLowerCase();
    const applicantMobile = String(phone || mobile || '').trim();
    const selectedCategory = category || membershipType || 'General Member';

    if (!applicantName || !applicantEmail || !applicantMobile) {
      return NextResponse.json(
        { error: 'Full name, email address, and mobile number are required.' },
        { status: 400 }
      );
    }

    let parsedFee = parseFloat(String(feeAmount || amount || '0').replace(/[^0-9.]/g, ''));
    if (body.isPaise === true && parsedFee > 0) {
      parsedFee = parsedFee / 100;
    }

    // Generate collision-safe unique member ID
    const count = await prisma.member.count();
    let memberId = '';
    let counter = count;
    while (true) {
      memberId = generateMemberId(counter);
      const exists = await prisma.member.findUnique({ where: { memberId } });
      if (!exists) break;
      counter++;
    }

    // Calculate validity period
    const validFrom = new Date();
    const validUntil = new Date();
    if (selectedCategory === 'Life Member' || selectedCategory === 'Patron Member') {
      validUntil.setFullYear(validUntil.getFullYear() + 5);
    } else {
      validUntil.setFullYear(validUntil.getFullYear() + 1);
    }

    // Create membership record
    const membership = await prisma.member.create({
      data: {
        memberId,
        fullName: applicantName,
        guardianName: guardianName ? String(guardianName).trim() : null,
        dob: dob || dateOfBirth ? String(dob || dateOfBirth).trim() : null,
        gender: gender || 'Male',
        mobile: applicantMobile,
        email: applicantEmail,
        address: address ? String(address).trim() : null,
        district: district ? String(district).trim() : null,
        state: state || 'Jharkhand',
        pincode: pincode ? String(pincode).trim() : null,
        occupation: occupation ? String(occupation).trim() : null,
        category: selectedCategory,
        photoUrl: photoUrl || null,
        feeAmount: parsedFee,
        paymentStatus: parsedFee > 0 ? 'PAID' : 'FREE',
        paymentId: String(paymentId),
        paymentMethod: body.paymentMethod || (parsedFee > 0 ? 'ONLINE_GATEWAY' : 'FREE'),
        status: 'PENDING',
        joiningDate: validFrom,
        validUntil,
      },
    });

    // Generate Registration Receipt PDF Buffer
    let receiptPdfBuffer: Buffer | undefined;
    try {
      receiptPdfBuffer = await generateRegistrationReceiptPdf({
        cardNumber: memberId,
        fullName: applicantName,
        role: selectedCategory,
        personType: 'MEMBER',
        email: applicantEmail,
        mobile: applicantMobile,
        address: address ? String(address).trim() : null,
        issueDate: validFrom,
        validUntil,
        photoUrl: photoUrl || null,
      });
    } catch (pdfErr) {
      console.warn('Membership registration receipt PDF generation warning:', pdfErr);
    }

    // Dispatch membership fee receipt email with PDF attachment
    try {
      await sendMembershipFeeReceiptEmail({
        recipientEmail: applicantEmail,
        recipientName: applicantName,
        memberId,
        category: selectedCategory,
        feeAmount: parsedFee,
        paymentMethod: body.paymentMethod || (parsedFee > 0 ? 'ONLINE_GATEWAY' : 'FREE'),
        paymentId: String(paymentId),
        pdfBuffer: receiptPdfBuffer,
      });
    } catch (mailErr) {
      console.error('Failed to dispatch membership fee receipt email:', mailErr);
    }

    await logAuditAction({
      action: 'MEMBER_REGISTERED_ONLINE',
      module: 'MEMBER',
      performedBy: applicantName,
      userEmail: applicantEmail,
      details: `Online membership registration completed for ${applicantName} with ID ${memberId} (Fee: ₹${parsedFee}).`,
    });

    return NextResponse.json({
      success: true,
      membership: {
        id: membership.id,
        memberId: membership.memberId,
        fullName: membership.fullName,
        category: membership.category,
        feeAmount: membership.feeAmount,
        paymentStatus: membership.paymentStatus,
        validFrom,
        validUntil,
      },
    });
  } catch (error: any) {
    console.error('Membership payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while confirming membership.' },
      { status: 500 }
    );
  }
}
