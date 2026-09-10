import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getActiveSmtpConfig, createTransporter } from '@/lib/mailer';
import { logAuditAction } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // If user does not exist or is inactive, return standard message to prevent email harvesting
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'If an active administrative account is registered with this email, password reset instructions have been dispatched.',
      });
    }

    // Generate secure random reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity

    // Store token on user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/admin/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    console.log(`[PASSWORD_RESET] Generated reset link for ${user.email}: ${resetUrl}`);

    // Attempt to dispatch email via Trust SMTP if available
    let emailDispatched = false;
    try {
      const smtpConfig = await getActiveSmtpConfig();
      if (smtpConfig && smtpConfig.user && smtpConfig.pass) {
        const transporter = createTransporter(smtpConfig);
        await transporter.sendMail({
          from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`,
          to: user.email,
          subject: 'Admin Password Reset Request - Nipania Vikash Seva Trust',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0F172A; margin-bottom: 4px; text-transform: uppercase;">Nipania Vikash Seva Trust</h2>
                <p style="color: #D97706; font-size: 12px; font-weight: bold; margin: 0; letter-spacing: 1px;">ADMINISTRATION SECURITY PORTAL</p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="font-size: 14px; color: #334155; margin-top: 0;">Hello <strong>${user.name}</strong>,</p>
                <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                  A password reset request was initiated for your administrator account. To set a new password, click the button below within the next <strong>30 minutes</strong>.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: #0F172A; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                    Reset My Password &rarr;
                  </a>
                </div>
                <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
                  If the button does not work, copy and paste this link into your browser:<br/>
                  <a href="${resetUrl}" style="color: #D97706; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>

              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                If you did not request this password reset, please disregard this email. Your account remains completely secure.<br/>
                &copy; ${new Date().getFullYear()} Nipania Vikash Seva Trust. All rights reserved.
              </p>
            </div>
          `,
        });
        emailDispatched = true;
      }
    } catch (mailError) {
      console.warn('Failed to send password reset email via SMTP:', mailError);
    }

    await logAuditAction({
      action: 'FORGOT_PASSWORD_REQUEST',
      module: 'AUTH',
      performedBy: user.name,
      userEmail: user.email,
      details: `Password reset link generated for ${user.email}. SMTP Dispatched: ${emailDispatched}`,
    });

    return NextResponse.json({
      success: true,
      message: 'If an active administrative account is registered with this email, password reset instructions have been dispatched.',
      // Provided for seamless testing if SMTP is unconfigured locally
      demoLink: process.env.NODE_ENV !== 'production' || !emailDispatched ? resetUrl : undefined,
    });
  } catch (error: any) {
    console.error('Error in forgot-password API:', error);
    return NextResponse.json({ 
      error: 'Server error processing password reset request',
      details: process.env.NODE_ENV !== 'production' ? error?.message : undefined,
    }, { status: 500 });
  }
}
