import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { generateIdCardPdf } from '@/lib/idCardPdf';
import { generateRegistrationReceiptPdf } from '@/lib/registrationReceiptPdf';
import { sendIdCardApprovalEmail, sendCorrectionNoticeEmail, sendRegistrationReceiptEmail } from '@/lib/mailer';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: params.id },
      include: {
        certificates: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    return NextResponse.json({ volunteer });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch volunteer' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'volunteers')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.volunteer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    const {
      status,
      rejectionReason,
      adminRemarks,
      fullName,
      guardianName,
      dob,
      gender,
      mobile,
      email,
      address,
      district,
      state,
      pincode,
      education,
      occupation,
      category,
      skills,
      areasOfInterest,
      availability,
      preferredLocation,
      emergencyContact,
      photoUrl,
      idProofUrl,
    } = body;

    const newStatus = status || existing.status;
    const newRemarks = adminRemarks !== undefined ? adminRemarks : (existing as any).adminRemarks;
    const newFullName = fullName || existing.fullName;
    const newCategory = category || existing.category;
    const newPhotoUrl = photoUrl !== undefined ? photoUrl : existing.photoUrl;

    const updated = await (prisma.volunteer as any).update({
      where: { id: params.id },
      data: {
        status: newStatus,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : existing.rejectionReason,
        adminRemarks: newRemarks,
        fullName: newFullName,
        guardianName: guardianName !== undefined ? guardianName : existing.guardianName,
        dob: dob !== undefined ? dob : existing.dob,
        gender: gender !== undefined ? gender : existing.gender,
        mobile: mobile || existing.mobile,
        email: email || existing.email,
        address: address !== undefined ? address : existing.address,
        district: district !== undefined ? district : existing.district,
        state: state !== undefined ? state : existing.state,
        pincode: pincode !== undefined ? pincode : existing.pincode,
        education: education !== undefined ? education : existing.education,
        occupation: occupation !== undefined ? occupation : existing.occupation,
        category: newCategory,
        skills: skills !== undefined ? skills : existing.skills,
        areasOfInterest: areasOfInterest !== undefined ? areasOfInterest : existing.areasOfInterest,
        availability: availability !== undefined ? availability : existing.availability,
        preferredLocation: preferredLocation !== undefined ? preferredLocation : existing.preferredLocation,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : existing.emergencyContact,
        photoUrl: newPhotoUrl,
        idProofUrl: idProofUrl !== undefined ? idProofUrl : existing.idProofUrl,
      },
    });

    // 1. If status is NEEDS_CORRECTION: dispatch correction email to applicant
    if (newStatus === 'NEEDS_CORRECTION' && newRemarks && updated.email) {
      try {
        await sendCorrectionNoticeEmail({
          recipientEmail: updated.email,
          recipientName: updated.fullName,
          referenceId: existing.volunteerId,
          personType: 'Volunteer',
          remarks: newRemarks,
        });
      } catch (err) {
        console.error('Error dispatching volunteer correction email:', err);
      }
    }

    // 2. If status is APPROVED: generate ID card and dispatch email with PDF attachment!
    if (newStatus === 'APPROVED') {
      const issueDate = new Date();
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org'}/verify/${existing.volunteerId}`;

      await prisma.idCard.upsert({
        where: { cardNumber: existing.volunteerId },
        update: {
          status: 'ACTIVE',
          fullName: updated.fullName,
          role: updated.category,
          photoUrl: updated.photoUrl,
        },
        create: {
          cardNumber: existing.volunteerId,
          personType: 'VOLUNTEER',
          personId: existing.id,
          fullName: updated.fullName,
          role: updated.category,
          photoUrl: updated.photoUrl,
          issueDate,
          validUntil,
          qrCodeData: verificationUrl,
          status: 'ACTIVE',
          remarks: 'Volunteer credential issued upon administrative approval.',
        },
      });

      await prisma.volunteer.update({
        where: { id: params.id },
        data: { idCardIssued: true },
      });

      // Generate Official A4 Registration Receipt & Certificate PDF
      let receiptPdfBuffer: Buffer | undefined;
      try {
        receiptPdfBuffer = await generateRegistrationReceiptPdf({
          cardNumber: existing.volunteerId,
          fullName: updated.fullName,
          role: updated.category || 'Volunteer',
          personType: 'VOLUNTEER',
          email: updated.email,
          mobile: updated.mobile,
          address: updated.address ? `${updated.address}${updated.district ? `, ${updated.district}` : ''}${updated.pincode ? ` - ${updated.pincode}` : ''}` : 'Nipania, Chatra, Jharkhand',
          issueDate,
          validUntil,
          photoUrl: updated.photoUrl,
        });
      } catch (pdfErr) {
        console.error('Failed to generate volunteer Registration Receipt PDF:', pdfErr);
      }

      // Dispatch official registration receipt email with receipt PDF attachment
      if (updated.email) {
        try {
          await sendRegistrationReceiptEmail({
            recipientEmail: updated.email,
            recipientName: updated.fullName,
            cardNumber: existing.volunteerId,
            role: updated.category || 'Volunteer',
            personType: 'Volunteer',
            verificationUrl,
            validityDate: validUntil,
            mobile: updated.mobile,
            address: updated.address,
            bloodGroup: updated.bloodGroup,
            pdfBuffer: receiptPdfBuffer,
          });
        } catch (mailErr) {
          console.error('Failed to dispatch volunteer registration receipt email with PDF:', mailErr);
        }
      }
    } else if (existing.idCardIssued) {
      // Keep existing ID Card in sync if volunteer name/role/photo changed
      await prisma.idCard.updateMany({
        where: { cardNumber: existing.volunteerId },
        data: {
          fullName: updated.fullName,
          role: updated.category,
          photoUrl: updated.photoUrl,
        },
      });
    }

    await logAuditAction({
      action: 'UPDATE_VOLUNTEER',
      module: 'VOLUNTEER',
      performedBy: session.name,
      userEmail: session.email,
      details: `Volunteer ${existing.volunteerId} (${updated.fullName}) updated. Status: ${newStatus}.`,
    });

    return NextResponse.json({ success: true, volunteer: updated });
  } catch (error: any) {
    console.error('Error updating volunteer:', error);
    return NextResponse.json({ error: 'Failed to update volunteer' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'volunteers')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.volunteer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    // Delete associated ID card if present
    await prisma.idCard.deleteMany({
      where: {
        OR: [
          { cardNumber: existing.volunteerId },
          { personId: existing.id },
        ],
      },
    });

    // Delete volunteer record
    await prisma.volunteer.delete({
      where: { id: params.id },
    });

    await logAuditAction({
      action: 'DELETE_VOLUNTEER',
      module: 'VOLUNTEER',
      performedBy: session.name,
      userEmail: session.email,
      details: `Permanently deleted volunteer ${existing.volunteerId} (${existing.fullName}) and revoked any associated identity cards.`,
    });

    return NextResponse.json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting volunteer:', error);
    return NextResponse.json({ error: 'Failed to delete volunteer' }, { status: 500 });
  }
}
