import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'messages')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawMessages = await prisma.contactMessage.findMany({
      where: {
        OR: [
          { subject: { startsWith: '[CSR Enquiry]' } },
          { subject: { contains: 'CSR' } },
          { message: { contains: 'Organization / Corporate:' } },
          { adminNotes: { contains: 'CSR Inquiry' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const parseCsrMessage = (m: any) => {
      const lines = (m.message || '').split('\n');
      const getLineVal = (prefix: string) => {
        const line = lines.find((l: string) => l.toLowerCase().includes(prefix.toLowerCase()));
        if (!line) return '';
        const colonIdx = line.indexOf(':');
        return colonIdx !== -1 ? line.substring(colonIdx + 1).trim() : '';
      };

      const companyName = getLineVal('Organization / Corporate') || m.name?.replace(/\(.*?\)/, '').trim() || 'Corporate Partner';
      const contactPerson = getLineVal('Contact Person') || m.name || '';
      const focusArea = getLineVal('Preferred Focus Area') || m.subject?.replace(/^\[CSR Enquiry\]\s*[^-\n]*-\s*/i, '').trim() || 'General CSR';
      const budgetRange = getLineVal('Budget Allocation') || 'To be discussed';
      const locationPreference = getLineVal('Preferred Location') || 'Jharkhand / Flexible';

      const reqIdx = m.message.indexOf('Partnership Scope & Requirements:');
      const requirements = reqIdx !== -1 
        ? m.message.substring(reqIdx + 'Partnership Scope & Requirements:'.length).trim() 
        : m.message;

      return {
        id: m.id,
        companyName,
        contactPerson,
        email: m.email,
        phone: m.phone || '',
        subject: m.subject,
        focusArea,
        budgetRange,
        locationPreference,
        requirements,
        fullMessage: m.message,
        status: m.status || 'NEW',
        adminNotes: m.adminNotes || '',
        createdAt: m.createdAt,
      };
    };

    const inquiries = rawMessages.map(parseCsrMessage);

    // Compute metrics
    const stats = {
      total: inquiries.length,
      newCount: inquiries.filter((i) => i.status === 'NEW').length,
      inReviewCount: inquiries.filter((i) => i.status === 'IN_REVIEW').length,
      proposalSentCount: inquiries.filter((i) => i.status === 'PROPOSAL_SENT').length,
      moaSignedCount: inquiries.filter((i) => i.status === 'MOA_SIGNED').length,
      closedCount: inquiries.filter((i) => i.status === 'CLOSED').length,
    };

    return NextResponse.json({
      success: true,
      inquiries,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching CSR inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch CSR inquiries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactPerson,
      email,
      phone,
      focusArea,
      budgetRange,
      locationPreference,
      message,
    } = body;

    if (!companyName || !contactPerson || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Company Name, Contact Person, Official Email, Phone, and Message are required.' },
        { status: 400 }
      );
    }

    // Format structured enquiry details
    const formattedSubject = `[CSR Enquiry] ${companyName} - ${focusArea || 'General CSR'}`;
    const formattedMessage = [
      `🏢 Organization / Corporate: ${companyName}`,
      `👤 Contact Person: ${contactPerson}`,
      `📧 Email: ${email}`,
      `📞 Phone: ${phone}`,
      `🎯 Preferred Focus Area: ${focusArea || 'Flexible / Multiple'}`,
      `💰 Budget Allocation: ${budgetRange || 'To be discussed'}`,
      `📍 Preferred Location: ${locationPreference || 'Jharkhand / Flexible'}`,
      `\n📝 Partnership Scope & Requirements:\n${message}`,
    ].join('\n');

    const msg = await prisma.contactMessage.create({
      data: {
        name: `${contactPerson} (${companyName})`,
        email,
        phone,
        subject: formattedSubject,
        message: formattedMessage,
        status: 'NEW',
        adminNotes: `CSR Inquiry received via /csr portal. Organization: ${companyName}. Budget Range: ${budgetRange || 'N/A'}.`,
      },
    });

    // Log in AuditLog
    await logAuditAction({
      action: 'CSR_ENQUIRY_SUBMIT',
      module: 'MESSAGES',
      performedBy: `${contactPerson} (${companyName})`,
      userEmail: email,
      details: `New Corporate CSR enquiry submitted by ${companyName} for ${focusArea || 'General CSR'}.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out for CSR partnership. Our corporate relations desk will review your requirements and connect with you shortly.',
      enquiryId: msg.id,
    });
  } catch (error: any) {
    console.error('Error submitting CSR enquiry:', error);
    return NextResponse.json(
      { error: 'Unable to submit CSR enquiry at this moment. Please try again or email us directly at info@nipaniatrust.org.' },
      { status: 500 }
    );
  }
}
