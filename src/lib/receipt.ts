import nodemailer from 'nodemailer';
import prisma from './prisma';

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const settings = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });

    if (!settings?.smtpUser || !settings?.smtpPassword) {
      console.error('SMTP not configured');
      return { success: false, error: 'SMTP not configured' };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost || 'smtp.gmail.com',
      port: settings.smtpPort || 587,
      secure: settings.smtpSecure || false,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    await transporter.sendMail({
      from: `"${settings.smtpSenderName}" <${settings.smtpSenderEmail}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

interface DonationReceiptData {
  donationId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPan?: string;
  donorAddress?: string;
  amount: number;
  paymentMethod: string;
  paymentId?: string;
  projectTitle?: string;
  date: Date;
}

interface MembershipReceiptData {
  membershipId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  membershipType: string;
  amount: number;
  paymentMethod: string;
  paymentId?: string;
  validFrom: Date;
  validUntil: Date;
}

// Generate donation receipt HTML
export function generateDonationReceiptHTML(data: DonationReceiptData): string {
  const {
    donationId,
    donorName,
    donorEmail,
    donorPhone,
    donorPan,
    donorAddress,
    amount,
    paymentMethod,
    paymentId,
    projectTitle,
    date,
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt-container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .receipt-badge {
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      font-size: 12px;
      margin-top: 10px;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-weight: bold;
      color: #4F46E5;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666;
      font-size: 14px;
    }
    .info-value {
      font-weight: 600;
      color: #333;
      text-align: right;
      font-size: 14px;
    }
    .amount-highlight {
      background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
      border: 2px solid #10B981;
    }
    .amount-highlight .amount {
      font-size: 32px;
      font-weight: bold;
      color: #059669;
      margin: 10px 0;
    }
    .tax-note {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .tax-note strong {
      color: #D97706;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e5e5;
      font-size: 12px;
      color: #666;
    }
    .footer p {
      margin: 5px 0;
    }
    .thank-you {
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .thank-you h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>🙏 NIPANIA VIKASH SEVA TRUST</h1>
      <p>Registered Public Charitable Trust</p>
      <p>Village Nipania, Jharkhand, India</p>
      <span class="receipt-badge">OFFICIAL DONATION RECEIPT</span>
    </div>

    <div class="section">
      <div class="section-title">Receipt Details</div>
      <div class="info-row">
        <span class="info-label">Receipt Number:</span>
        <span class="info-value">${donationId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${new Date(date).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${paymentMethod}</span>
      </div>
      ${paymentId ? `
      <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value">${paymentId}</span>
      </div>
      ` : ''}
    </div>

    <div class="amount-highlight">
      <div style="font-size: 14px; color: #059669; font-weight: 600;">Total Donation Amount</div>
      <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
      <div style="font-size: 12px; color: #666;">Indian Rupees</div>
    </div>

    <div class="section">
      <div class="section-title">Donor Information</div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${donorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${donorEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${donorPhone}</span>
      </div>
      ${donorPan ? `
      <div class="info-row">
        <span class="info-label">PAN Number:</span>
        <span class="info-value">${donorPan}</span>
      </div>
      ` : ''}
      ${donorAddress ? `
      <div class="info-row">
        <span class="info-label">Address:</span>
        <span class="info-value">${donorAddress}</span>
      </div>
      ` : ''}
    </div>

    ${projectTitle ? `
    <div class="section">
      <div class="section-title">Donation Purpose</div>
      <div class="info-row">
        <span class="info-label">Project:</span>
        <span class="info-value">${projectTitle}</span>
      </div>
    </div>
    ` : ''}

    <div class="tax-note">
      <strong>80G Tax Exemption:</strong> This donation is eligible for tax deduction under Section 80G of the Income Tax Act. 
      Please retain this receipt for your tax filing. Our 80G Registration No: [REG80G-XXXXXX]
    </div>

    <div class="thank-you">
      <h2>🙏 Thank You for Your Generous Support!</h2>
      <p>Your contribution will make a meaningful difference in the lives of those we serve.</p>
    </div>

    <div class="footer">
      <p><strong>Nipania Vikash Seva Trust</strong></p>
      <p>Email: info@nipaniatrust.org | Phone: +91 98765 43210</p>
      <p>Website: www.nipaniatrust.org</p>
      <p style="margin-top: 15px; font-size: 11px; color: #999;">
        This is a computer-generated receipt and does not require a signature.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Generate membership receipt HTML
export function generateMembershipReceiptHTML(data: MembershipReceiptData): string {
  const {
    membershipId,
    memberName,
    memberEmail,
    memberPhone,
    membershipType,
    amount,
    paymentMethod,
    paymentId,
    validFrom,
    validUntil,
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership Receipt</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt-container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #7C3AED;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #7C3AED;
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .receipt-badge {
      background: linear-gradient(135deg, #7C3AED, #A855F7);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      font-size: 12px;
      margin-top: 10px;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-weight: bold;
      color: #7C3AED;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666;
      font-size: 14px;
    }
    .info-value {
      font-weight: 600;
      color: #333;
      text-align: right;
      font-size: 14px;
    }
    .membership-highlight {
      background: linear-gradient(135deg, #F3E8FF, #E9D5FF);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
      border: 2px solid #A855F7;
    }
    .membership-type {
      font-size: 24px;
      font-weight: bold;
      color: #7C3AED;
      margin: 10px 0;
      text-transform: uppercase;
    }
    .amount {
      font-size: 28px;
      font-weight: bold;
      color: #059669;
      margin: 10px 0;
    }
    .validity-box {
      background: #DBEAFE;
      border-left: 4px solid #3B82F6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e5e5;
      font-size: 12px;
      color: #666;
    }
    .footer p {
      margin: 5px 0;
    }
    .welcome {
      background: linear-gradient(135deg, #7C3AED, #A855F7);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .welcome h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>🏛️ NIPANIA VIKASH SEVA TRUST</h1>
      <p>Registered Public Charitable Trust</p>
      <p>Village Nipania, Jharkhand, India</p>
      <span class="receipt-badge">MEMBERSHIP RECEIPT</span>
    </div>

    <div class="membership-highlight">
      <div style="font-size: 14px; color: #7C3AED; font-weight: 600;">Membership Type</div>
      <div class="membership-type">${membershipType}</div>
      <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
    </div>

    <div class="section">
      <div class="section-title">Receipt Details</div>
      <div class="info-row">
        <span class="info-label">Membership ID:</span>
        <span class="info-value">${membershipId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${paymentMethod}</span>
      </div>
      ${paymentId ? `
      <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value">${paymentId}</span>
      </div>
      ` : ''}
    </div>

    <div class="validity-box">
      <strong>Membership Validity:</strong><br>
      From: ${new Date(validFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
      Until: ${new Date(validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>

    <div class="section">
      <div class="section-title">Member Information</div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${memberName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${memberEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${memberPhone}</span>
      </div>
    </div>

    <div class="welcome">
      <h2>🎉 Welcome to Nipania Vikash Seva Trust!</h2>
      <p>Thank you for becoming a valued member of our community.</p>
    </div>

    <div class="footer">
      <p><strong>Nipania Vikash Seva Trust</strong></p>
      <p>Email: info@nipaniatrust.org | Phone: +91 98765 43210</p>
      <p>Website: www.nipaniatrust.org</p>
      <p style="margin-top: 15px; font-size: 11px; color: #999;">
        This is a computer-generated receipt and does not require a signature.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Send donation receipt email
export async function sendDonationReceipt(data: DonationReceiptData) {
  try {
    const html = generateDonationReceiptHTML(data);
    
    const result = await sendEmail({
      to: data.donorEmail,
      subject: `Donation Receipt - ${data.donationId} | Nipania Vikash Seva Trust`,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Failed to send donation receipt:', error);
    return { success: false, error: error.message };
  }
}

// Send membership receipt email
export async function sendMembershipReceipt(data: MembershipReceiptData) {
  try {
    const html = generateMembershipReceiptHTML(data);
    
    const result = await sendEmail({
      to: data.memberEmail,
      subject: `Membership Receipt - ${data.membershipId} | Nipania Vikash Seva Trust`,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Failed to send membership receipt:', error);
    return { success: false, error: error.message };
  }
}
