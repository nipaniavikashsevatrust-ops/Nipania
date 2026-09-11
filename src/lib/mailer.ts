import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
  senderEmail: string;
}

/**
 * Clean & sanitize SMTP passwords (e.g., Google App Passwords like "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
 */
export function sanitizeSmtpPassword(password: string): string {
  if (!password) return '';
  return password.replace(/\s+/g, '').trim();
}

/**
 * Retrieve active SMTP configuration from database or env fallbacks
 */
export async function getActiveSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const trust = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });

    if (trust && trust.smtpUser && trust.smtpPassword) {
      return {
        host: trust.smtpHost || 'smtp.gmail.com',
        port: trust.smtpPort || 587,
        secure: trust.smtpSecure ?? false,
        user: trust.smtpUser.trim(),
        pass: sanitizeSmtpPassword(trust.smtpPassword),
        senderName: trust.smtpSenderName || trust.name || 'Nipania Vikash Seva Trust',
        senderEmail: trust.smtpSenderEmail || trust.smtpUser.trim(),
      };
    }

    // Fallback to environment variables
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      return {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER.trim(),
        pass: sanitizeSmtpPassword(process.env.SMTP_PASS),
        senderName: process.env.SMTP_SENDER_NAME || 'Nipania Vikash Seva Trust',
        senderEmail: process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USER.trim(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error loading SMTP config:', error);
    return null;
  }
}

/**
 * Create a Nodemailer Transporter instance with given config
 */
export function createTransporter(config: SmtpConfig) {
  const port = Number(config.port) || 587;

  // RFC SMTP Standard:
  // - Port 465 uses direct SSL/TLS connection (secure: true).
  // - Port 587 (submission) & port 25 use plain-text greeting upgraded with STARTTLS (secure: false).
  // Setting secure: true on port 587 causes OpenSSL to throw "wrong version number" (ESOCKET).
  const isSecure = port === 465 ? true : port === 587 || port === 25 ? false : Boolean(config.secure);

  return nodemailer.createTransport({
    host: config.host || 'smtp.gmail.com',
    port,
    secure: isSecure,
    auth: {
      user: config.user,
      pass: sanitizeSmtpPassword(config.pass),
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
}

/**
 * Test SMTP connection and dispatch an authentic test email
 */
export async function testSmtpConnection(
  config: SmtpConfig,
  testToEmail: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const transporter = createTransporter(config);

    // 1. Verify credentials with server
    await transporter.verify();

    // 2. Send actual test email
    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: testToEmail,
      subject: `[Verified] SMTP Test Email - ${config.senderName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 2px solid #C59B27; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="background-color: #0B192C; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0 0 4px; font-size: 18px; color: #C59B27; text-transform: uppercase; letter-spacing: 1px;">Nipania Vikash Seva Trust</h2>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1;">SEVA | VIKASH | SAMARPAN</p>
          </div>
          <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
            <h3 style="color: #0B192C; margin-top: 0;">SMTP Connection Verified Successfully! 🎉</h3>
            <p>Your SMTP email configuration has been tested and verified in real-time. Automated credentials, volunteer ID cards, donation receipts, and communications will now be delivered through this channel.</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 12px;">
              <p style="margin: 4px 0;"><strong>SMTP Server:</strong> ${config.host}:${config.port}</p>
              <p style="margin: 4px 0;"><strong>Authorized User:</strong> ${config.user}</p>
              <p style="margin: 4px 0;"><strong>Sender Name:</strong> ${config.senderName}</p>
              <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This is an automated system test message from Nipania Vikash Seva Trust Admin Portal.</p>
          </div>
          <div style="background-color: #0B192C; padding: 12px 24px; text-align: center; color: #94a3b8; font-size: 11px;">
            Nipania Vikash Seva Trust • Official Public Charitable Trust
          </div>
        </div>
      `,
      text: `SMTP Test Successful for ${config.senderName}. Server: ${config.host}:${config.port}, User: ${config.user}.`,
    });

    return {
      success: true,
      message: `SMTP verified successfully! Test email delivered to ${testToEmail}. (Message ID: ${info.messageId})`,
      details: info,
    };
  } catch (error: any) {
    console.error('SMTP test error:', error);
    let errorMessage = error.message || 'SMTP Authentication failed';

    if (error.code === 'EAUTH' || errorMessage.includes('535') || errorMessage.includes('Username and Password not accepted')) {
      errorMessage = 'Invalid username or password. For Gmail, make sure you are using a 16-character App Password (not your regular password) with 2-Step Verification enabled.';
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      errorMessage = `Could not connect to SMTP server at ${config.host}:${config.port}. Check host, port, and firewall rules.`;
    }

    return {
      success: false,
      message: errorMessage,
      details: error,
    };
  }
}

/**
 * Dispatch Official Registration Receipt & Acknowledgment Email to Volunteer or Member
 */
export async function sendRegistrationReceiptEmail({
  recipientEmail,
  recipientName,
  cardNumber,
  role,
  personType,
  verificationUrl,
  validityDate,
  mobile,
  address,
  bloodGroup,
  pdfBuffer,
}: {
  recipientEmail: string;
  recipientName: string;
  cardNumber: string;
  role: string;
  personType: string;
  verificationUrl: string;
  validityDate?: string | Date;
  mobile?: string | null;
  address?: string | null;
  bloodGroup?: string | null;
  pdfBuffer?: Buffer;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getActiveSmtpConfig();
    if (!config) {
      console.warn('No active SMTP config found. Simulated email dispatch.');
      return {
        success: true,
        message: `Simulated: Registration receipt email with PDF queued for ${recipientEmail}.`,
      };
    }

    const transporter = createTransporter(config);

    const validFormatted = validityDate
      ? new Date(validityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Active';

    const attachments = pdfBuffer
      ? [
          {
            filename: `${cardNumber}_Registration_Receipt.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    const isVolunteer = personType.toUpperCase() === 'VOLUNTEER';

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `Official Registration Receipt & ${isVolunteer ? 'Volunteer' : 'Member'} Confirmation (${cardNumber}) | Nipania Vikash Seva Trust`,
      attachments,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 2px solid #C59B27; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.1);">
          <div style="background-color: #0B192C; padding: 26px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0 0 6px; font-size: 20px; color: #C59B27; text-transform: uppercase; letter-spacing: 1.5px;">Nipania Vikash Seva Trust</h2>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-weight: bold;">SEVA • VIKASH • SAMARPAN</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">Govt. Regd: IV-120/2022 • NITI Aayog Darpan</p>
          </div>
          
          <div style="padding: 30px 26px; color: #334155; line-height: 1.6;">
            <!-- Email Header Title & Status Badge (Table Layout for Universal Email Client Compatibility) -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #f1f5f9; margin-bottom: 18px;">
              <tr>
                <td align="left" valign="top" style="padding-bottom: 12px;">
                  <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Official Registration Acknowledgment</span>
                  <h3 style="color: #0B192C; margin: 4px 0 0; font-size: 18px; line-height: 1.3;">Welcome to Nipania Trust, ${recipientName}! 📜</h3>
                </td>
                <td align="right" valign="top" style="padding-bottom: 12px; width: 140px;">
                  <div style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-align: center; white-space: nowrap; display: inline-block;">
                    ACTIVE &amp; APPROVED
                  </div>
                </td>
              </tr>
            </table>

            <p style="font-size: 13.5px; line-height: 1.6; margin: 0 0 16px;">Your application for registration as an official <strong>${personType}</strong> has been successfully reviewed, verified, and approved by the Board of Trustees. Below is your official registration receipt and membership acknowledgment summary:</p>
            
            <!-- Structured Receipt Details Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 9px 0; color: #64748b; width: 38%; font-weight: bold;">Receipt / Ref Number:</td>
                  <td style="padding: 9px 0; color: #0B192C; font-family: monospace; font-weight: bold; word-break: break-word;">REC-${cardNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: bold;">Registration ID:</td>
                  <td style="padding: 9px 0; color: #b45309; font-family: monospace; font-weight: bold; font-size: 14px;">${cardNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: bold;">Full Legal Name:</td>
                  <td style="padding: 9px 0; color: #0B192C; font-weight: bold;">${recipientName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: bold;">Category / Role:</td>
                  <td style="padding: 9px 0; color: #0B192C;">${role}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: bold;">Membership Period:</td>
                  <td style="padding: 9px 0; color: #047857; font-weight: bold;">Till ${validFormatted}</td>
                </tr>
                ${mobile ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 9px 0; color: #64748b; font-weight: bold;">Registered Contact:</td>
                  <td style="padding: 9px 0; color: #0B192C; font-family: monospace;">${mobile}</td>
                </tr>
                ` : ''}
                ${bloodGroup ? `
                <tr>
                  <td style="padding: 9px 0; color: #64748b; font-weight: bold;">Blood Group:</td>
                  <td style="padding: 9px 0; color: #0B192C;">${bloodGroup}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${pdfBuffer ? `
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-weight: bold; font-size: 13px;">
                📎 Attached: ${cardNumber}_Registration_Receipt.pdf
              </p>
              <p style="margin: 4px 0 0; color: #1d4ed8; font-size: 11.5px;">
                Your official printable A4 Registration Receipt & Certificate is attached to this email for your records.
              </p>
            </div>
            ` : ''}

            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 12px; color: #92400e;">
              <p style="margin: 0; font-weight: bold;">ℹ️ Physical PVC ID Card Notice:</p>
              <p style="margin: 4px 0 0;">This document confirms your registration. Your physical Single-Sided CR80 PVC Identity Card is being produced by the administration desk and will be distributed to you for field activities.</p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(90deg, #C59B27 0%, #eab308 100%); color: #0B192C; text-decoration: none; padding: 13px 26px; border-radius: 50px; font-size: 13px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(197, 155, 39, 0.35);">
                View Online Verified Credentials & Details →
              </a>
            </div>

            <p style="font-size: 11.5px; color: #64748b; margin-bottom: 0;">
              For any support, address update, or program participation, quote your registration reference <strong>REC-${cardNumber}</strong>.
            </p>
          </div>

          <div style="background-color: #0B192C; padding: 14px 26px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Baliapur, Dhanbad, Jharkhand - 828201 • Helpline: +91 94311 23456
          </div>
        </div>
      `,
      text: `Welcome ${recipientName}! Your registration with Nipania Vikash Seva Trust as ${personType} (${cardNumber}) has been approved. Your official Registration Receipt (REC-${cardNumber}) is attached as a PDF. Verify credentials online: ${verificationUrl}`,
    });

    return {
      success: true,
      message: `Registration receipt successfully delivered to ${recipientEmail}. (Message ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error sending registration receipt email:', error);
    return {
      success: false,
      message: `Failed to deliver registration receipt email: ${error.message}`,
    };
  }
}

/**
 * Dispatch Official ID Card Approval & Credentials Email to Volunteer or Member
 */
export async function sendIdCardApprovalEmail({
  recipientEmail,
  recipientName,
  cardNumber,
  role,
  personType,
  verificationUrl,
  validityDate,
  pdfBuffer,
}: {
  recipientEmail: string;
  recipientName: string;
  cardNumber: string;
  role: string;
  personType: string;
  verificationUrl: string;
  validityDate?: string | Date;
  pdfBuffer?: Buffer;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getActiveSmtpConfig();
    if (!config) {
      console.warn('No active SMTP config found. Simulated email dispatch.');
      return {
        success: true,
        message: `Simulated: ID card email with PDF queued for ${recipientEmail}. (Configure SMTP in Admin Settings for live delivery)`,
      };
    }

    const transporter = createTransporter(config);

    const validFormatted = validityDate
      ? new Date(validityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Active';

    // Prepare attachments array if PDF buffer provided
    const attachments = pdfBuffer
      ? [
          {
            filename: `${cardNumber}_Official_ID_Card.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `Official Credential & PDF ID Card Approved - ${cardNumber} | Nipania Vikash Seva Trust`,
      attachments,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #C59B27; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
          <div style="background-color: #0B192C; padding: 28px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0 0 6px; font-size: 20px; color: #C59B27; text-transform: uppercase; letter-spacing: 1.5px;">Nipania Vikash Seva Trust</h2>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-weight: bold;">SEVA | VIKASH | SAMARPAN</p>
          </div>
          
          <div style="padding: 32px 28px; color: #334155; line-height: 1.6;">
            <h3 style="color: #0B192C; margin-top: 0; font-size: 20px;">Congratulations, ${recipientName}! 🎖️</h3>
            <p style="font-size: 14px;">Your registration application for <strong>Nipania Vikash Seva Trust</strong> has been verified and approved by the Board of Trustees. Your official Single-Sided CR80 PVC ID Card credential is now active.</p>
            
            <div style="background: linear-gradient(135deg, #0B192C 0%, #1a2a44 100%); border: 2px solid #C59B27; border-radius: 16px; padding: 20px; color: #ffffff; margin: 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid rgba(197, 155, 39, 0.4); margin-bottom: 14px;">
                <tr>
                  <td align="left" valign="middle" style="padding-bottom: 10px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #C59B27; font-weight: bold; letter-spacing: 0.5px;">Official ${personType} Identity Pass</span>
                  </td>
                  <td align="right" valign="middle" style="padding-bottom: 10px; width: 70px;">
                    <span style="font-size: 10px; background-color: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">ACTIVE</span>
                  </td>
                </tr>
              </table>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> ${recipientName}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Assigned ID Number:</strong> <span style="font-family: monospace; color: #fde047; font-size: 16px; font-weight: bold;">${cardNumber}</span></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Designation / Category:</strong> ${role}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Validity Till:</strong> ${validFormatted}</p>
            </div>

            ${pdfBuffer ? `
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #065f46; font-weight: bold; font-size: 13px;">
                📎 Attached: ${cardNumber}_Official_ID_Card.pdf
              </p>
              <p style="margin: 4px 0 0; color: #047857; font-size: 11px;">
                Your official printable Single-Sided CR80 PVC ID Card is attached to this email. You can download and print it immediately.
              </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 26px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(90deg, #C59B27 0%, #eab308 100%); color: #0B192C; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 13px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(197, 155, 39, 0.4);">
                View & Verify Official ID Card Online →
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b;">You can present this verifiable credential at any official trust welfare initiative, medical camp, or community meeting. Anyone can verify your credentials in real-time by scanning the QR code on your card.</p>
          </div>

          <div style="background-color: #0B192C; padding: 16px 28px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Regd. Public Charitable Trust • Helpline: +91 94311 23456
          </div>
        </div>
      `,
      text: `Congratulations ${recipientName}! Your Nipania Vikash Seva Trust ${personType} ID Card (${cardNumber}) has been approved. Your official PDF ID card is attached to this email. Verify online at: ${verificationUrl}`,
    });

    return {
      success: true,
      message: `Official ID Card confirmation with PDF delivered to ${recipientEmail}. (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error sending ID card email:', error);
    return {
      success: false,
      message: `Failed to deliver email: ${error.message}`,
    };
  }
}

/**
 * Dispatch Correction Required Notice Email to Volunteer or Member
 */
export async function sendCorrectionNoticeEmail({
  recipientEmail,
  recipientName,
  referenceId,
  personType,
  remarks,
  correctionUrl,
}: {
  recipientEmail: string;
  recipientName: string;
  referenceId: string;
  personType: string;
  remarks: string;
  correctionUrl?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getActiveSmtpConfig();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const actionUrl = correctionUrl || `${appUrl}/correction/${encodeURIComponent(referenceId)}`;

    if (!config) {
      console.warn('No active SMTP config found. Simulated correction email.');
      return {
        success: true,
        message: `Simulated: Correction notice queued for ${recipientEmail}. Direct link: ${actionUrl}`,
      };
    }

    const transporter = createTransporter(config);

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `Action Required: Application Correction Request (${referenceId}) | Nipania Vikash Seva Trust`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #ea580c; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
          <div style="background-color: #0B192C; padding: 26px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0 0 6px; font-size: 20px; color: #C59B27; text-transform: uppercase; letter-spacing: 1.5px;">Nipania Vikash Seva Trust</h2>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-weight: bold;">APPLICATION CORRECTION REQUEST</p>
          </div>
          
          <div style="padding: 30px 26px; color: #334155; line-height: 1.6;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #fed7aa; margin-bottom: 18px;">
              <tr>
                <td align="left" valign="top" style="padding-bottom: 12px;">
                  <span style="font-size: 11px; font-weight: bold; color: #c2410c; text-transform: uppercase;">Application Reference: ${referenceId}</span>
                  <h3 style="color: #0B192C; margin: 4px 0 0; font-size: 18px; line-height: 1.3;">Action Required: Please Update Details 📝</h3>
                </td>
                <td align="right" valign="top" style="padding-bottom: 12px; width: 140px;">
                  <div style="background-color: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-size: 10.5px; font-weight: bold; padding: 4px 10px; border-radius: 20px; white-space: nowrap; display: inline-block;">
                    NEEDS CORRECTION
                  </div>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px;">Dear <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px;">The Board of Trustees has reviewed your application for <strong>${personType}</strong> (Reference: <span style="font-family: monospace; font-weight: bold; color: #b45309;">${referenceId}</span>). Before your official identity credentials can be finalized, please review the administrator instructions below and make the necessary corrections:</p>
            
            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; padding: 18px; margin: 22px 0;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #9a3412; letter-spacing: 0.5px;">
                Administrator Remarks & Required Changes:
              </p>
              <p style="margin: 0; font-size: 14px; color: #7c2d12; font-weight: 600; white-space: pre-wrap; line-height: 1.5;">
                "${remarks}"
              </p>
            </div>

            <!-- Direct One-Click Online Correction Button -->
            <div style="text-align: center; margin: 28px 0; background: #fff8f5; border: 1px dashed #f97316; border-radius: 14px; padding: 20px;">
              <p style="margin: 0 0 12px; font-size: 13px; font-weight: bold; color: #0B192C;">
                You can correct your details & re-upload documents online instantly:
              </p>
              <a href="${actionUrl}" style="background: linear-gradient(90deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);">
                Click Here to Correct Your Details Online →
              </a>
              <p style="margin: 10px 0 0; font-size: 11px; color: #64748b;">
                Or open this link in your browser: <br/>
                <a href="${actionUrl}" style="color: #c2410c; text-decoration: underline; word-break: break-all;">${actionUrl}</a>
              </p>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; color: #475569;">
              <p style="margin: 0 0 6px; font-weight: bold; color: #0B192C;">What to do next:</p>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Click the link above to open your application correction form.</li>
                <li>Edit any incorrect name, address, contact details, or upload a clear passport photograph.</li>
                <li>Submit your updates. Our team will review the corrected details immediately and issue your official ID card.</li>
              </ul>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">For questions or telephone assistance, you can also reach the Trust Office at <strong>+91 94311 23456</strong> or <strong>info@nipaniatrust.org</strong> quoting reference <strong>${referenceId}</strong>.</p>
          </div>

          <div style="background-color: #0B192C; padding: 16px 26px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Official Helpdesk • Baliapur, Dhanbad, Jharkhand - 828201
          </div>
        </div>
      `,
      text: `Dear ${recipientName}, your ${personType} registration application (${referenceId}) requires correction. Remarks: ${remarks}. Please correct your application online at: ${actionUrl}`,
    });

    return {
      success: true,
      message: `Correction notice successfully delivered to ${recipientEmail}. (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error sending correction notice email:', error);
    return {
      success: false,
      message: `Failed to deliver correction notice: ${error.message}`,
    };
  }
}

/**
 * Dispatch Official Section 80G Donation Receipt Email with PDF Attachment
 */
export async function sendDonationReceiptEmail({
  recipientEmail,
  recipientName,
  donationId,
  amount,
  paymentMethod,
  paymentId,
  projectTitle,
  donorPan,
  pdfBuffer,
}: {
  recipientEmail: string;
  recipientName: string;
  donationId: string;
  amount: number;
  paymentMethod?: string;
  paymentId?: string | null;
  projectTitle?: string | null;
  donorPan?: string | null;
  pdfBuffer?: Buffer;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getActiveSmtpConfig();
    if (!config) {
      console.warn('No active SMTP config found. Simulated email dispatch.');
      return {
        success: true,
        message: `Simulated: 80G Donation receipt email queued for ${recipientEmail}.`,
      };
    }

    const transporter = createTransporter(config);

    const attachments = pdfBuffer
      ? [
          {
            filename: `Donation_Receipt_80G_${donationId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `🙏 Official 80G Donation Receipt [${donationId}] - Nipania Vikash Seva Trust`,
      attachments,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #C59B27; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.08);">
          <!-- Header Banner -->
          <div style="background-color: #0B192C; padding: 26px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0 0 4px; font-size: 20px; color: #C59B27; text-transform: uppercase; letter-spacing: 1px;">
              Nipania Vikash Seva Trust
            </h1>
            <p style="margin: 0; font-size: 11px; color: #cbd5e1; letter-spacing: 0.5px;">
              A REGISTERED PUBLIC CHARITABLE TRUST UNDER INDIAN TRUSTS ACT
            </p>
            <div style="margin-top: 10px; display: inline-block; background-color: rgba(197, 155, 39, 0.2); border: 1px solid #C59B27; border-radius: 20px; padding: 3px 12px; font-size: 10.5px; color: #fef08a; font-weight: bold;">
              OFFICIAL 80G TAX EXEMPTION RECEIPT
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px;">
              We gratefully acknowledge receipt of your generous contribution of <strong style="color: #059669; font-size: 16px;">${formattedAmount}</strong> towards <strong>${projectTitle || 'General Social Welfare & Community Outreach'}</strong>.
            </p>
            <p style="font-size: 13px; color: #64748b;">
              Your support enables life-changing education kits, community healthcare camps, and rural welfare initiatives. Your official <strong>Section 80G Tax Exemption Receipt</strong> has been issued and is attached as a PDF to this email.
            </p>

            <!-- Donation Receipt Details Card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; overflow: hidden;">
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Receipt Number:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${donationId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Date of Contribution:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Donation Amount:</td>
                <td style="padding: 10px 14px; font-size: 14px; font-weight: bold; color: #059669; border-bottom: 1px solid #e2e8f0;">${formattedAmount} (INR)</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Payment Method:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${paymentMethod || 'ONLINE'}</td>
              </tr>
              ${paymentId ? `
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Transaction Reference:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-family: monospace; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${paymentId}</td>
              </tr>
              ` : ''}
              ${donorPan ? `
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Donor PAN:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${donorPan.toUpperCase()}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b;">Designated Purpose:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C;">${projectTitle || 'General Welfare Fund'}</td>
              </tr>
            </table>

            <!-- Section 80G Tax Exemption Callout -->
            <div style="background-color: #fefce8; border-left: 4px solid #eab308; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: bold; color: #854d0e;">
                Tax Exemption under Section 80G:
              </p>
              <p style="margin: 0; font-size: 11.5px; color: #713f12; line-height: 1.5;">
                Donations made to Nipania Vikash Seva Trust (PAN: AAFTN4004N) are 50% tax-deductible under Section 80G of the Income Tax Act, 1961. Please retain the attached PDF certificate for your annual tax returns.
              </p>
            </div>

            <p style="font-size: 13px; color: #475569;">
              📎 <strong>PDF Receipt Attached:</strong> We have attached the complete, signed, and stamped A4 receipt (<strong>Donation_Receipt_80G_${donationId}.pdf</strong>) with this email. You can download and print it at any time.
            </p>

            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              Thank you once again for standing with us to empower rural communities.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #0B192C; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Village Nipania, Chatra, Jharkhand • <a href="https://nipaniatrust.org" style="color: #C59B27; text-decoration: none;">nipaniatrust.org</a>
          </div>
        </div>
      `,
      text: `Dear ${recipientName}, thank you for your donation of ${formattedAmount} to Nipania Vikash Seva Trust (Receipt No: ${donationId}). Your official 80G tax exemption receipt is attached to this email.`,
    });

    return {
      success: true,
      message: `Donation receipt email successfully sent to ${recipientEmail}. (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error sending donation receipt email:', error);
    return {
      success: false,
      message: `Failed to deliver donation receipt email: ${error.message}`,
    };
  }
}

/**
 * Dispatch Membership Registration & Fee Receipt Email with PDF Attachment
 */
export async function sendMembershipFeeReceiptEmail({
  recipientEmail,
  recipientName,
  memberId,
  category,
  feeAmount,
  paymentMethod,
  paymentId,
  pdfBuffer,
}: {
  recipientEmail: string;
  recipientName: string;
  memberId: string;
  category: string;
  feeAmount: number;
  paymentMethod?: string;
  paymentId?: string | null;
  pdfBuffer?: Buffer;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getActiveSmtpConfig();
    if (!config) {
      console.warn('No active SMTP config found. Simulated email dispatch.');
      return {
        success: true,
        message: `Simulated: Membership receipt email queued for ${recipientEmail}.`,
      };
    }

    const transporter = createTransporter(config);

    const attachments = pdfBuffer
      ? [
          {
            filename: `Membership_Registration_Receipt_${memberId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    const formattedFee = feeAmount > 0 ? `₹${feeAmount.toLocaleString('en-IN')}` : 'Free / Honorary';

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `🏛️ Membership Application & Fee Receipt [${memberId}] - Nipania Vikash Seva Trust`,
      attachments,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #C59B27; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.08);">
          <div style="background-color: #0B192C; padding: 26px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0 0 4px; font-size: 20px; color: #C59B27; text-transform: uppercase; letter-spacing: 1px;">
              Nipania Vikash Seva Trust
            </h1>
            <p style="margin: 0; font-size: 11px; color: #cbd5e1;">SEVA | VIKASH | SAMARPAN</p>
            <div style="margin-top: 10px; display: inline-block; background-color: rgba(197, 155, 39, 0.2); border: 1px solid #C59B27; border-radius: 20px; padding: 3px 12px; font-size: 10.5px; color: #fef08a; font-weight: bold;">
              MEMBERSHIP REGISTRATION CONFIRMATION
            </div>
          </div>

          <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px;">
              Welcome to the <strong>Nipania Vikash Seva Trust</strong> community! Your membership application has been successfully submitted and logged under Membership ID: <strong style="color: #0B192C;">${memberId}</strong>.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; overflow: hidden;">
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Membership ID:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${memberId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Category / Tier:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Fee Amount Paid:</td>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: bold; color: #059669; border-bottom: 1px solid #e2e8f0;">${formattedFee}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Payment Method:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${paymentMethod || 'ONLINE'}</td>
              </tr>
              ${paymentId ? `
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Transaction Reference:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-family: monospace; color: #0B192C; border-bottom: 1px solid #e2e8f0;">${paymentId}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b;">Registration Status:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #0284c7;">PENDING BOARD APPROVAL</td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #475569;">
              Our administrative team is reviewing your profile. Once approved, your official Trust Identity Card will be generated and issued. You can verify your status online anytime.
            </p>

            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              For any questions, reach us at <strong>info@nipaniatrust.org</strong> quoting reference <strong>${memberId}</strong>.
            </p>
          </div>

          <div style="background-color: #0B192C; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Official Membership Registry • <a href="https://nipaniatrust.org" style="color: #C59B27; text-decoration: none;">nipaniatrust.org</a>
          </div>
        </div>
      `,
      text: `Dear ${recipientName}, your membership registration for ${category} has been received (ID: ${memberId}). Fee: ${formattedFee}. Thank you for joining Nipania Vikash Seva Trust.`,
    });

    return {
      success: true,
      message: `Membership receipt email delivered to ${recipientEmail}. (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error sending membership receipt email:', error);
    return {
      success: false,
      message: `Failed to deliver membership receipt email: ${error.message}`,
    };
  }
}

/**
 * Dispatch Official Form 10BE Section 80G Tax Exemption Certificate to Donor
 * 
 * IMPORTANT COMPLIANCE RULE:
 * Attaches the authentic, uploaded official Form 10BE PDF issued pursuant to Form 10BD filing.
 * Never substitutes an internal receipt for the government Form 10BE.
 */
export async function sendTenBEEmail({
  recipientEmail,
  recipientName,
  donationId,
  amount,
  financialYear,
  tenBeNumber,
  tenBeIssueDate,
  pdfBuffer,
  pdfUrl,
  secureVerificationUrl,
}: {
  recipientEmail: string;
  recipientName: string;
  donationId: string;
  amount: number;
  financialYear?: string | null;
  tenBeNumber?: string | null;
  tenBeIssueDate?: Date | string | null;
  pdfBuffer?: Buffer;
  pdfUrl?: string | null;
  secureVerificationUrl?: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const config = await getActiveSmtpConfig();
    if (!config) {
      console.warn('No active SMTP config found. Simulated Form 10BE email dispatch.');
      return {
        success: true,
        message: `Simulated: Form 10BE certificate email queued for ${recipientEmail}.`,
      };
    }

    // Resolve PDF attachment buffer if not passed directly
    let attachmentBuffer = pdfBuffer;
    if (!attachmentBuffer && pdfUrl) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const cleanPath = pdfUrl.replace(/^\//, '').split('?')[0];
        const localPath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(localPath)) {
          attachmentBuffer = fs.readFileSync(localPath);
        }
      } catch (fsErr) {
        console.warn('Could not read local 10BE file for email:', fsErr);
      }
    }

    if (!attachmentBuffer) {
      return {
        success: false,
        message: 'Official Form 10BE PDF attachment could not be located. Upload the certificate PDF first before emailing.',
        error: 'Missing 10BE PDF attachment',
      };
    }

    const transporter = createTransporter(config);
    const formattedAmount = `₹${Number(amount).toLocaleString('en-IN')}/-`;
    const formattedDate = tenBeIssueDate
      ? new Date(tenBeIssueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN');
    const fyLabel = financialYear ? (financialYear.startsWith('FY') ? financialYear : `FY ${financialYear}`) : 'Current FY';
    const certNumber = tenBeNumber || '10BE-FILED';

    const attachments = [
      {
        filename: `Form_10BE_${donationId}.pdf`,
        content: attachmentBuffer,
        contentType: 'application/pdf',
      },
    ];

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `Form 10BE Donation Certificate – Nipania Vikash Seva Trust (${fyLabel})`,
      attachments,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 2px solid #0B192C; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12);">
          <div style="background-color: #0B192C; padding: 28px 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0 0 6px; font-size: 20px; color: #F59E0B; text-transform: uppercase; letter-spacing: 1.5px;">Nipania Vikash Seva Trust</h2>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-weight: bold;">SEVA • VIKASH • SAMARPAN</p>
            <p style="margin: 6px 0 0; font-size: 11px; color: #94a3b8;">Registered Public Charitable Trust • PAN: AAFTN4004N • Section 80G Reg: AAFTN4004NF20214</p>
          </div>
          
          <div style="padding: 32px 28px; color: #334155; line-height: 1.6;">
            <!-- Badge & Header -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; padding-bottom: 12px;">
              <tr>
                <td align="left" valign="top">
                  <span style="font-size: 11px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">Official Statutory Document</span>
                  <h3 style="color: #0B192C; margin: 4px 0 0; font-size: 19px; line-height: 1.3;">Your Official Form 10BE Certificate is Attached 🏛️</h3>
                </td>
                <td align="right" valign="top" style="width: 140px;">
                  <div style="background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 10.5px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-align: center; white-space: nowrap;">
                    ${fyLabel}
                  </div>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px; margin: 0 0 16px;">
              Dear <strong>${recipientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
              We express our sincere gratitude for your noble contribution of <strong>${formattedAmount}</strong> to <strong>Nipania Vikash Seva Trust</strong>.
            </p>
            <p style="font-size: 13.5px; line-height: 1.6; margin: 0 0 18px; color: #475569;">
              Following our annual electronic filing of Form 10BD with the Income Tax Department of India for <strong>${fyLabel}</strong>, your official <strong>Form 10BE Certificate of Donation</strong> has been verified and issued. Please find your official certificate attached to this email.
            </p>
            
            <!-- Certificate Metadata Card -->
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 18px; margin: 22px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; width: 40%; font-weight: bold;">Form 10BE Number:</td>
                  <td style="padding: 8px 0; color: #0B192C; font-weight: bold; font-family: monospace;">${certNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Financial Year:</td>
                  <td style="padding: 8px 0; color: #0B192C; font-weight: bold;">${fyLabel}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Donation Reference ID:</td>
                  <td style="padding: 8px 0; color: #0B192C; font-family: monospace;">${donationId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Contribution Amount:</td>
                  <td style="padding: 8px 0; color: #047857; font-weight: bold; font-size: 14px;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Date of Issue:</td>
                  <td style="padding: 8px 0; color: #334155;">${formattedDate}</td>
                </tr>
              </table>
            </div>

            <!-- Tax Filing Notice -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
              <strong>Income Tax Filing Note:</strong> Under Section 80G(5)(vi) of the Income Tax Act, this Form 10BE certificate serves as proof of deduction for your ITR filing. The contribution details have also been directly submitted to the Income Tax portal in Form 10BD.
            </div>

            ${
              secureVerificationUrl
                ? `
            <div style="text-align: center; margin: 26px 0;">
              <a href="${secureVerificationUrl}" style="background-color: #0B192C; color: #F59E0B; text-decoration: none; padding: 13px 28px; border-radius: 50px; font-size: 13px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(11, 25, 44, 0.2);">
                View &amp; Verify Certificate Online →
              </a>
            </div>
            `
                : ''
            }

            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
              For queries or assistance regarding your tax exemption certificate, contact the Trust Treasury at <strong>info@nipaniatrust.org</strong> or <strong>+91 94311 23456</strong>.
            </p>
          </div>

          <div style="background-color: #0B192C; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Official Public Charitable Trust • Baliapur, Dhanbad, Jharkhand - 828201
          </div>
        </div>
      `,
      text: `Dear ${recipientName}, your official Form 10BE Donation Certificate for ${fyLabel} has been issued by Nipania Vikash Seva Trust for contribution ${donationId} (${formattedAmount}). Certificate Number: ${certNumber}. Please find the official PDF attached. Contact: info@nipaniatrust.org.`,
    });

    return {
      success: true,
      message: `Form 10BE certificate successfully delivered to ${recipientEmail}. (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error dispatching Form 10BE email:', error);
    return {
      success: false,
      message: `Failed to deliver Form 10BE email: ${error.message || 'SMTP Error'}`,
      error: error.message || 'Failed to dispatch email',
    };
  }
}

/**
 * Dispatch Official Recognition Certificate Email to Recipient with PDF Attachment
 */
export async function sendCertificateEmail({
  recipientEmail,
  recipientName,
  certificateNumber,
  certificateType,
  title,
  issueDate,
  verificationUrl,
  pdfBuffer,
}: {
  recipientEmail: string;
  recipientName: string;
  certificateNumber: string;
  certificateType: string;
  title?: string;
  issueDate: Date | string;
  verificationUrl: string;
  pdfBuffer?: Buffer;
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const config = await getActiveSmtpConfig();
    if (!config) {
      console.warn('No active SMTP config found. Simulated certificate email dispatch.');
      return {
        success: true,
        message: `Simulated: Official Certificate email queued for ${recipientEmail}.`,
      };
    }

    const transporter = createTransporter(config);
    const formattedDate = new Date(issueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const certTitle = title || `Certificate of ${certificateType.replace(/_/g, ' ')}`;

    const attachments = pdfBuffer
      ? [
          {
            filename: `${certificateNumber}_Certificate.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: recipientEmail,
      subject: `Your Certificate from Nipania Vikash Seva Trust (${certificateNumber})`,
      attachments,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 2px solid #0C234C; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(12, 35, 76, 0.12);">
          <div style="background-color: #0C234C; padding: 28px 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0 0 4px; font-size: 19px; color: #F59E0B; text-transform: uppercase; letter-spacing: 1.2px;">
              NIPANIA VIKASH SEVA TRUST
            </h2>
            <p style="margin: 0; font-size: 11px; color: #cbd5e1; font-weight: bold;">
              SEVA • VIKASH • SAMARPAN
            </p>
            <p style="margin: 6px 0 0; font-size: 10px; color: #94a3b8;">
              Registered Public Charitable Trust • Official Certificate of Recognition
            </p>
          </div>
          
          <div style="padding: 32px 28px; color: #334155; line-height: 1.6;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; padding-bottom: 12px;">
              <tr>
                <td align="left" valign="top">
                  <span style="font-size: 11px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">Official Document</span>
                  <h3 style="color: #0C234C; margin: 4px 0 0; font-size: 18px; line-height: 1.3;">${certTitle} 📜</h3>
                </td>
                <td align="right" valign="top" style="width: 130px;">
                  <div style="background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 10.5px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-align: center; white-space: nowrap;">
                    OFFICIAL &amp; ISSUED
                  </div>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px; margin: 0 0 16px;">
              Dear <strong>${recipientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
              Your <strong>${certTitle}</strong> has been officially issued by <strong>Nipania Vikash Seva Trust</strong> in recognition of your valuable service, participation, and contribution towards the activities and objectives of the Trust.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 18px; margin: 22px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; width: 40%; font-weight: bold;">Certificate Number:</td>
                  <td style="padding: 8px 0; color: #0C234C; font-weight: bold; font-family: monospace; font-size: 14px;">${certificateNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Recipient Name:</td>
                  <td style="padding: 8px 0; color: #0C234C; font-weight: bold;">${recipientName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Category:</td>
                  <td style="padding: 8px 0; color: #334155;">${certTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Date of Issue:</td>
                  <td style="padding: 8px 0; color: #047857; font-weight: bold;">${formattedDate}</td>
                </tr>
              </table>
            </div>

            ${pdfBuffer ? `
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-weight: bold; font-size: 13px;">
                📎 Attached: ${certificateNumber}_Certificate.pdf
              </p>
              <p style="margin: 4px 0 0; color: #1d4ed8; font-size: 11.5px;">
                Your official printable high-resolution A4 certificate has been attached to this email.
              </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 26px 0;">
              <a href="${verificationUrl}" style="background-color: #0C234C; color: #F59E0B; text-decoration: none; padding: 13px 28px; border-radius: 50px; font-size: 13px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(12, 35, 76, 0.2);">
                Verify Authenticity Online →
              </a>
            </div>

            <p style="font-size: 11.5px; color: #64748b; margin-top: 24px; line-height: 1.5;">
              Notice: This certificate represents honorary recognition by the Trust. It does not confer trusteeship, ownership, office-bearer status, or voting rights.
            </p>
          </div>

          <div style="background-color: #0C234C; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
            Nipania Vikash Seva Trust • Official Registry • Helpline: +91 9876543210
          </div>
        </div>
      `,
      text: `Dear ${recipientName},\n\nYour ${certTitle} has been officially issued by Nipania Vikash Seva Trust.\n\nCertificate Number: ${certificateNumber}\nIssue Date: ${formattedDate}\nVerification: ${verificationUrl}\n\nYour official certificate PDF is attached to this email.`,
    });

    return {
      success: true,
      message: `Certificate successfully delivered to ${recipientEmail}. (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error('Error dispatching certificate email:', error);
    return {
      success: false,
      message: `Failed to deliver certificate email: ${error.message || 'SMTP Error'}`,
      error: error.message || 'Failed to dispatch email',
    };
  }
}



