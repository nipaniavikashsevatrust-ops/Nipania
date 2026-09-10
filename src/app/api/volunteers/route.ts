import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVolunteerId } from '@/lib/utils';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'volunteers')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (search) {
      where.OR = [
        { volunteerId: { contains: search } },
        { fullName: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { district: { contains: search } },
      ];
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ volunteers });
  } catch (error: any) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    if (!fullName || !mobile || !email) {
      return NextResponse.json({ error: 'Full name, mobile number, and email are required.' }, { status: 400 });
    }

    const count = await prisma.volunteer.count();
    const volunteerId = generateVolunteerId(count);

    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerId,
        fullName,
        guardianName: guardianName || null,
        dob: dob || null,
        gender: gender || null,
        mobile,
        email,
        address: address || null,
        district: district || null,
        state: state || 'Jharkhand',
        pincode: pincode || null,
        education: education || null,
        occupation: occupation || null,
        category: category || 'Community Volunteer',
        skills: skills || null,
        areasOfInterest: areasOfInterest || null,
        availability: availability || 'Weekends Only',
        preferredLocation: preferredLocation || null,
        emergencyContact: emergencyContact || null,
        photoUrl: photoUrl || null,
        idProofUrl: idProofUrl || null,
        status: 'PENDING',
      },
    });

    await logAuditAction({
      action: 'VOLUNTEER_APPLY',
      module: 'VOLUNTEER',
      performedBy: fullName,
      userEmail: email,
      details: `New volunteer registration submitted with ID ${volunteerId}.`,
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (error: any) {
    console.error('Volunteer registration error:', error);
    return NextResponse.json({ error: 'Failed to submit volunteer registration' }, { status: 500 });
  }
}
