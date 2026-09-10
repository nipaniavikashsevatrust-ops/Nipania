import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { testSmtpConnection, sanitizeSmtpPassword } from '@/lib/mailer';
import { logAuditAction } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'settings')) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      host,
      port,
      secure,
      user,
      password,
      senderName,
      senderEmail,
      testEmail,
    } = body;

    if (!host || !user || !password) {
      return NextResponse.json(
        { error: 'SMTP Host, Username, and Password are required to test the connection.' },
        { status: 400 }
      );
    }

    const recipientEmail = testEmail || user;

    const result = await testSmtpConnection(
      {
        host: host.trim(),
        port: parseInt(port) || 587,
        secure: secure === true,
        user: user.trim(),
        pass: sanitizeSmtpPassword(password),
        senderName: senderName || 'Nipania Vikash Seva Trust',
        senderEmail: senderEmail || user.trim(),
      },
      recipientEmail
    );

    if (result.success) {
      await logAuditAction({
        action: 'TEST_SMTP_SUCCESS',
        module: 'SETTINGS',
        performedBy: session.name,
        userEmail: session.email,
        details: `Successfully tested SMTP connection to ${host} using account ${user}. Test email sent to ${recipientEmail}.`,
      });

      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('SMTP testing endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to complete SMTP test.',
      },
      { status: 500 }
    );
  }
}
