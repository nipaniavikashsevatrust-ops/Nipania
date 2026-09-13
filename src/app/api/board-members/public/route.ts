import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all active board members (public endpoint)
export async function GET() {
  try {
    const members = await prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        designation: true,
        category: true,
        image: true,
        quote: true,
        roleDetails: true,
        tenure: true,
        order: true,
      },
    });
    
    return NextResponse.json(members, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
