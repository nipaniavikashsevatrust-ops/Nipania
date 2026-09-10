import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id?.trim();
    if (!rawId) {
      return NextResponse.json({ error: 'Invalid reference ID.' }, { status: 400 });
    }

    const cleanId = rawId.toUpperCase();

    // 1. Try to find Volunteer by UUID or volunteerId
    const volunteer = await prisma.volunteer.findFirst({
      where: {
        OR: [
          { id: rawId },
          { volunteerId: cleanId },
          { volunteerId: rawId },
        ],
      },
    });

    if (volunteer) {
      return NextResponse.json({
        found: true,
        type: 'VOLUNTEER',
        application: {
          id: volunteer.id,
          referenceId: volunteer.volunteerId,
          type: 'VOLUNTEER',
          status: volunteer.status,
          adminRemarks: volunteer.adminRemarks,
          rejectionReason: volunteer.rejectionReason,
          fullName: volunteer.fullName,
          guardianName: volunteer.guardianName || '',
          dob: volunteer.dob || '',
          gender: volunteer.gender || 'Male',
          mobile: volunteer.mobile,
          email: volunteer.email,
          address: volunteer.address || '',
          district: volunteer.district || '',
          state: volunteer.state || 'Jharkhand',
          pincode: volunteer.pincode || '',
          education: volunteer.education || '',
          occupation: volunteer.occupation || '',
          category: volunteer.category || 'Community Volunteer',
          skills: volunteer.skills || '',
          areasOfInterest: volunteer.areasOfInterest || '',
          availability: volunteer.availability || 'Weekends Only',
          preferredLocation: volunteer.preferredLocation || '',
          emergencyContact: volunteer.emergencyContact || '',
          photoUrl: volunteer.photoUrl || '',
          createdAt: volunteer.createdAt,
          updatedAt: volunteer.updatedAt,
        },
      });
    }

    // 2. Try to find Member by UUID or memberId
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: rawId },
          { memberId: cleanId },
          { memberId: rawId },
        ],
      },
    });

    if (member) {
      return NextResponse.json({
        found: true,
        type: 'MEMBER',
        application: {
          id: member.id,
          referenceId: member.memberId,
          type: 'MEMBER',
          status: member.status,
          adminRemarks: member.adminRemarks,
          rejectionReason: member.rejectionReason,
          fullName: member.fullName,
          guardianName: member.guardianName || '',
          dob: member.dob || '',
          gender: member.gender || 'Male',
          mobile: member.mobile,
          email: member.email,
          address: member.address || '',
          district: member.district || '',
          state: member.state || 'Jharkhand',
          pincode: member.pincode || '',
          occupation: member.occupation || '',
          category: member.category || 'General Member',
          photoUrl: member.photoUrl || '',
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        },
      });
    }

    return NextResponse.json(
      { error: `No application found matching reference "${rawId}". Please verify your reference number from your email/SMS.` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error fetching application for correction:', error);
    return NextResponse.json({ error: 'Internal server error while searching application.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleCorrectionSubmission(request, params.id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleCorrectionSubmission(request, params.id);
}

async function handleCorrectionSubmission(request: NextRequest, rawId: string) {
  try {
    const cleanId = rawId?.trim();
    if (!cleanId) {
      return NextResponse.json({ error: 'Invalid reference ID.' }, { status: 400 });
    }

    const body = await request.json();
    const {
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
      occupation,
      category,
      skills,
      areasOfInterest,
      availability,
      preferredLocation,
      emergencyContact,
      photoUrl,
    } = body;

    if (!fullName?.trim() || !mobile?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Full Legal Name, Mobile Number, and Email Address are mandatory.' },
        { status: 400 }
      );
    }

    const upperId = cleanId.toUpperCase();
    const formattedNow = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Check if Volunteer
    const volunteer = await prisma.volunteer.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { volunteerId: upperId },
          { volunteerId: cleanId },
        ],
      },
    });

    if (volunteer) {
      const stamp = `[Applicant corrected details & resubmitted on ${formattedNow}]`;
      const updatedRemarks = volunteer.adminRemarks
        ? `${volunteer.adminRemarks}\n\n${stamp}`
        : stamp;

      const updatedVolunteer = await prisma.volunteer.update({
        where: { id: volunteer.id },
        data: {
          fullName: fullName.trim(),
          guardianName: guardianName !== undefined ? guardianName.trim() : volunteer.guardianName,
          dob: dob || volunteer.dob,
          gender: gender || volunteer.gender,
          mobile: mobile.trim(),
          email: email.trim().toLowerCase(),
          address: address !== undefined ? address.trim() : volunteer.address,
          district: district !== undefined ? district.trim() : volunteer.district,
          state: state || volunteer.state,
          pincode: pincode !== undefined ? pincode.trim() : volunteer.pincode,
          occupation: occupation !== undefined ? occupation.trim() : volunteer.occupation,
          category: category || volunteer.category,
          skills: skills !== undefined ? skills.trim() : volunteer.skills,
          areasOfInterest: areasOfInterest !== undefined ? areasOfInterest.trim() : volunteer.areasOfInterest,
          availability: availability || volunteer.availability,
          preferredLocation: preferredLocation !== undefined ? preferredLocation.trim() : volunteer.preferredLocation,
          emergencyContact: emergencyContact !== undefined ? emergencyContact.trim() : volunteer.emergencyContact,
          photoUrl: photoUrl || volunteer.photoUrl,
          status: 'PENDING', // Reset back to PENDING for admin review
          adminRemarks: updatedRemarks,
        },
      });

      // Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            module: 'VOLUNTEER',
            performedBy: 'APPLICANT',
            userEmail: updatedVolunteer.email,
            details: `Volunteer application ${volunteer.volunteerId} corrected & resubmitted by applicant.`,
          },
        });
      } catch (logErr) {
        console.warn('Could not record audit log:', logErr);
      }

      return NextResponse.json({
        success: true,
        type: 'VOLUNTEER',
        referenceId: volunteer.volunteerId,
        message: 'Your volunteer application corrections have been submitted successfully! The Trust team will re-review and issue your credential shortly.',
      });
    }

    // 2. Check if Member
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { memberId: upperId },
          { memberId: cleanId },
        ],
      },
    });

    if (member) {
      const stamp = `[Applicant corrected details & resubmitted on ${formattedNow}]`;
      const updatedRemarks = member.adminRemarks
        ? `${member.adminRemarks}\n\n${stamp}`
        : stamp;

      const updatedMember = await prisma.member.update({
        where: { id: member.id },
        data: {
          fullName: fullName.trim(),
          guardianName: guardianName !== undefined ? guardianName.trim() : member.guardianName,
          dob: dob || member.dob,
          gender: gender || member.gender,
          mobile: mobile.trim(),
          email: email.trim().toLowerCase(),
          address: address !== undefined ? address.trim() : member.address,
          district: district !== undefined ? district.trim() : member.district,
          state: state || member.state,
          pincode: pincode !== undefined ? pincode.trim() : member.pincode,
          occupation: occupation !== undefined ? occupation.trim() : member.occupation,
          category: category || member.category,
          photoUrl: photoUrl || member.photoUrl,
          status: 'PENDING', // Reset back to PENDING for admin review
          adminRemarks: updatedRemarks,
        },
      });

      // Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            module: 'MEMBER',
            performedBy: 'APPLICANT',
            userEmail: updatedMember.email,
            details: `Member application ${member.memberId} corrected & resubmitted by applicant.`,
          },
        });
      } catch (logErr) {
        console.warn('Could not record audit log:', logErr);
      }

      return NextResponse.json({
        success: true,
        type: 'MEMBER',
        referenceId: member.memberId,
        message: 'Your membership application corrections have been submitted successfully! The Trust team will re-review and issue your credential shortly.',
      });
    }

    return NextResponse.json(
      { error: 'Application not found with the provided reference ID.' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error handling application correction submission:', error);
    return NextResponse.json(
      { error: 'Failed to process application corrections. Please try again or contact trust office.' },
      { status: 500 }
    );
  }
}
