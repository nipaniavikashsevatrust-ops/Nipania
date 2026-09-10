import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateIdCardPdf } from '@/lib/idCardPdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = decodeURIComponent(params.id);

    // 1. Try finding in IdCard table by id or cardNumber
    let card = await prisma.idCard.findFirst({
      where: {
        OR: [
          { id: identifier },
          { cardNumber: identifier },
        ],
      },
    });

    // 2. If not found in IdCard, check Volunteer table
    let personData: any = null;
    if (!card) {
      const vol = await prisma.volunteer.findFirst({
        where: {
          OR: [
            { id: identifier },
            { volunteerId: identifier },
          ],
        },
      });
      if (vol) {
        const issueDate = new Date(vol.createdAt);
        const validUntil = new Date(vol.createdAt);
        validUntil.setFullYear(validUntil.getFullYear() + 1);
        personData = {
          cardNumber: vol.volunteerId,
          fullName: vol.fullName,
          role: vol.category || 'Volunteer',
          personType: 'VOLUNTEER',
          photoUrl: vol.photoUrl,
          issueDate,
          validUntil,
          status: vol.status,
        };
      } else {
        const mem = await prisma.member.findFirst({
          where: {
            OR: [
              { id: identifier },
              { memberId: identifier },
            ],
          },
        });
        if (mem) {
          const issueDate = new Date(mem.joiningDate || mem.createdAt);
          const validUntil = mem.validUntil || new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000);
          personData = {
            cardNumber: mem.memberId,
            fullName: mem.fullName,
            role: mem.category || 'Member',
            personType: 'MEMBER',
            photoUrl: mem.photoUrl,
            issueDate,
            validUntil,
            status: mem.status,
          };
        }
      }
    } else {
      personData = {
        cardNumber: card.cardNumber,
        fullName: card.fullName,
        role: card.role,
        personType: card.personType,
        photoUrl: card.photoUrl,
        issueDate: card.issueDate,
        validUntil: card.validUntil,
        status: card.status,
      };
    }

    if (!personData) {
      return NextResponse.json({ error: 'Identity card not found' }, { status: 404 });
    }

    // Generate PDF Buffer
    const pdfBuffer = await generateIdCardPdf(personData);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${personData.cardNumber}_Identity_Card.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error serving ID Card PDF:', error);
    return NextResponse.json({ error: 'Failed to generate ID card PDF' }, { status: 500 });
  }
}
