import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { formatDate } from '@/lib/utils';

export interface DonationReceiptPdfData {
  donationId: string; // e.g. NVS-DON-2026-00001
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPan?: string | null;
  donorAddress?: string | null;
  amount: number;
  paymentMethod: string;
  paymentId?: string | null;
  orderId?: string | null;
  projectTitle?: string | null;
  date: string | Date;
  autoPrint?: boolean;
}

/**
 * Number to Words converter for Indian Rupees (INR)
 */
function numberToWordsINR(amount: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred) res += ones[hundred] + ' Hundred';
    if (rest) res += (res ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const parts: string[] = [];
  if (crore) parts.push(convertTwoDigits(crore) + ' Crore');
  if (lakh) parts.push(convertTwoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(convertTwoDigits(thousand) + ' Thousand');
  if (remainder) parts.push(convertThreeDigits(remainder));

  return parts.join(' ') + ' Rupees Only';
}

/**
 * Resolves an image URL or local path to a base64 Data URL for jsPDF
 */
async function resolveImageToBase64(urlOrPath?: string | null): Promise<string | null> {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith('data:image/')) return urlOrPath;

  try {
    const cleanPath = urlOrPath.replace(/^\//, '').split('?')[0];
    const localFilePath = path.join(process.cwd(), 'public', cleanPath);
    if (fs.existsSync(localFilePath)) {
      const ext = path.extname(localFilePath).toLowerCase().replace('.', '');
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const fileBuffer = fs.readFileSync(localFilePath);
      return `data:${mime};base64,${fileBuffer.toString('base64')}`;
    }
  } catch (err) {
    console.warn('Could not read local file for donation receipt:', err);
  }

  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(urlOrPath, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
      }
    } catch (fetchErr) {
      console.warn('Could not fetch remote image for donation receipt PDF:', fetchErr);
    }
  }

  return null;
}

/**
 * Generates an official A4 Section 80G Tax Exemption Donation Receipt PDF Buffer
 * Dimensions: 210mm x 297mm (Standard A4 Portrait)
 * Formal, dignified certificate layout strictly without ink seal/stamp, with enlarged logo and balanced vertical distribution.
 */
export async function generateDonationReceiptPdf(data: DonationReceiptPdfData): Promise<Buffer> {
  // 1. Fetch trust legal metadata from database
  let trust: any = null;
  try {
    trust = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });
  } catch (e) {
    console.warn('Could not fetch trust details from DB for donation receipt:', e);
  }

  const trustName = (trust?.name || 'NIPANIA VIKASH SEVA TRUST').toUpperCase();
  const panNumber = trust?.pan || 'AAFTN4004N';
  const reg80gNo = trust?.reg80gNo || 'AAFTN4004NF20214';
  const reg12aNo = trust?.reg12aNo || 'AAFTN4004NE20203';
  const darpanId = trust?.darpanId || 'UP/2021/0295112';
  const trustAddress = trust?.registeredAddress || 'Nipania, P.O. Pargha, P.S. Baliapur, District Dhanbad, Jharkhand – 828201';
  const trustEmail = trust?.email || 'info@nipaniatrust.org';
  const trustPhone = trust?.phone || '+91 98765 43210';
  const website = trust?.website || 'https://nipaniatrust.org';

  const signatoryName = trust?.presidentName || 'Managing Trustee';
  const signatoryTitle = trust?.presidentTitle || 'President / Managing Trustee';

  // Signature image resolution with robust fallback
  let signatureUrl = trust?.presidentSignature || null;
  if (!signatureUrl) {
    const fallbackSig = path.join(process.cwd(), 'public', 'uploads', '1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png');
    if (fs.existsSync(fallbackSig)) {
      signatureUrl = '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png';
    }
  }

  // 2. Initialize jsPDF (A4 portrait: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = 210;
  const pageH = 297;
  const margin = 10; // Clean 10mm margin from page edge for A4 single-page fit
  const contentW = pageW - margin * 2; // 190mm

  // 3. Double Outer Border (Navy + Inner Gold Accent)
  doc.setDrawColor(11, 25, 44); // Midnight Navy #0B192C
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, contentW, pageH - margin * 2);

  doc.setDrawColor(197, 155, 39); // Sacred Gold #C59B27
  doc.setLineWidth(0.35);
  doc.rect(margin + 1.5, margin + 1.5, contentW - 3, pageH - margin * 2 - 3);

  // 4. Official Trust Letterhead (Clean Formal White Background)
  const headerCenter = pageW / 2;

  // Enlarged Official Trust Logo (Centered, 36mm x 36mm, strict 1:1 aspect ratio - no snapping/distortion)
  const logoSize = 36; // Increased size
  try {
    const logoBase64 = await resolveImageToBase64('/logo.png');
    if (logoBase64) {
      doc.addImage(
        logoBase64,
        'PNG',
        headerCenter - logoSize / 2,
        margin + 3.5,
        logoSize,
        logoSize
      );
    }
  } catch (logoErr) {
    console.warn('Logo embedding warning:', logoErr);
  }

  // Trust Name (Positioned gracefully below enlarged logo)
  doc.setTextColor(11, 25, 44); // Navy 950
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(trustName, headerCenter, margin + 44.5, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text(
    'A REGISTERED PUBLIC CHARITABLE TRUST UNDER THE INDIAN TRUSTS ACT, 1882',
    headerCenter,
    margin + 49.5,
    { align: 'center' }
  );

  // Legal Filings Row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(
    `PAN: ${panNumber}    |    80G REG NO: ${reg80gNo}    |    12A REG NO: ${reg12aNo}    |    DARPAN ID: ${darpanId}`,
    headerCenter,
    margin + 54.5,
    { align: 'center' }
  );

  // Registered Office & Contact Details
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(
    `Registered Office: ${trustAddress}    |    Email: ${trustEmail}    |    Helpline: ${trustPhone}`,
    headerCenter,
    margin + 58.5,
    { align: 'center' }
  );

  // Decorative Letterhead Separator Line (Dual Navy + Gold rule)
  doc.setDrawColor(11, 25, 44);
  doc.setLineWidth(0.4);
  doc.line(margin + 5, margin + 61.5, pageW - margin - 5, margin + 61.5);

  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.25);
  doc.line(margin + 5, margin + 62.5, pageW - margin - 5, margin + 62.5);

  // 5. Formal Certificate Title Banner
  let currY = margin + 65.5;
  const tableX = margin + 4;
  const tableW = contentW - 8; // 182mm

  doc.setFillColor(11, 25, 44); // Midnight Navy
  doc.roundedRect(tableX, currY, tableW, 11.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.setTextColor(253, 224, 71); // Gold 300
  doc.text('DONATION RECEIPT & SECTION 80G TAX EXEMPTION CERTIFICATE', pageW / 2, currY + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240); // Slate 200
  doc.text(
    'Issued under Section 80G(5)(vi) of the Income Tax Act, 1961 • Eligible for 50% Tax Deduction • Digital Audit Record',
    pageW / 2,
    currY + 9,
    { align: 'center' }
  );

  currY += 14;

  // 6. Structured Formal Voucher Table (Ledger Grid)
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.25);

  // Row 1: Receipt Number, Date of Issue, Payment Mode
  const row1H = 12.5;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(tableX, currY, tableW, row1H, 'FD');

  const col1W = 60;
  const col2W = 60;
  const col3W = tableW - col1W - col2W; // 62mm

  // Vertical column dividers
  doc.line(tableX + col1W, currY, tableX + col1W, currY + row1H);
  doc.line(tableX + col1W + col2W, currY, tableX + col1W + col2W, currY + row1H);

  // Col 1: Receipt Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT NUMBER:', tableX + 3, currY + 4.2);
  doc.setFontSize(9.5);
  doc.setTextColor(11, 25, 44);
  doc.text(data.donationId, tableX + 3, currY + 9.2);

  // Col 2: Date of Issue
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE OF ISSUE:', tableX + col1W + 3, currY + 4.2);
  doc.setFontSize(9);
  doc.setTextColor(11, 25, 44);
  doc.text(formatDate(data.date), tableX + col1W + 3, currY + 9.2);

  // Col 3: Payment Mode
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT MODE:', tableX + col1W + col2W + 3, currY + 4.2);
  doc.setFontSize(9);
  doc.setTextColor(11, 25, 44);
  doc.text(data.paymentMethod || 'ONLINE', tableX + col1W + col2W + 3, currY + 9.2);

  currY += row1H;

  // Row 2: Received with thanks from & Donor PAN (Form 10BE)
  const row2H = 14;
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, currY, tableW, row2H, 'FD');

  const donorColW = 120;
  doc.line(tableX + donorColW, currY, tableX + donorColW, currY + row2H);

  // Left: Donor Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIVED WITH THANKS FROM:', tableX + 3, currY + 4.2);
  doc.setFontSize(10.5);
  doc.setTextColor(11, 25, 44);
  const donorNameUpper = data.donorName.toUpperCase();
  doc.text(donorNameUpper, tableX + 3, currY + 9.8);

  // Right: Donor PAN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('DONOR PAN (FORM 10BE):', tableX + donorColW + 3, currY + 4.2);

  // Highlight pill for PAN
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.setLineWidth(0.2);
  doc.roundedRect(tableX + donorColW + 3, currY + 5.5, 52, 6.2, 1, 1, 'FD');
  doc.setFontSize(8.8);
  doc.setTextColor(120, 53, 15); // Amber 900
  doc.text(data.donorPan ? data.donorPan.toUpperCase() : 'Not Provided / Form 60', tableX + donorColW + 6, currY + 10);

  // Reset border color
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);

  currY += row2H;

  // Row 3: Donor Contact & Address
  const row3H = 13;
  doc.setFillColor(248, 250, 252);
  doc.rect(tableX, currY, tableW, row3H, 'FD');

  const halfW = tableW / 2;
  doc.line(tableX + halfW, currY, tableX + halfW, currY + row3H);

  // Contact
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('DONOR CONTACT:', tableX + 3, currY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`${data.donorPhone}    •    ${data.donorEmail}`, tableX + 3, currY + 9);

  // Address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('POSTAL ADDRESS:', tableX + halfW + 3, currY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const addrText = data.donorAddress || 'Nipania, Balrampur, Uttar Pradesh';
  const splitAddr = doc.splitTextToSize(addrText, halfW - 6);
  doc.text(splitAddr[0], tableX + halfW + 3, currY + 9);

  currY += row3H;

  // Row 4: Sum of Rupees (Contribution Amount & Words)
  const row4H = 15.5;
  doc.setFillColor(240, 253, 244); // Light Emerald 50
  doc.rect(tableX, currY, tableW, row4H, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('THE SUM OF RUPEES:', tableX + 3, currY + 4.8);

  doc.setFontSize(12.5);
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text(
    `INR ${data.amount.toLocaleString('en-IN')}/- (Rs. ${data.amount.toLocaleString('en-IN')})`,
    tableX + 48,
    currY + 5.2
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42); // Navy 950
  doc.text(`(${numberToWordsINR(data.amount)})`, tableX + 3, currY + 11.2);

  currY += row4H;

  // Row 5: Towards Fund & Reference / UTR ID
  const row5H = 13;
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, currY, tableW, row5H, 'FD');

  doc.line(tableX + halfW, currY, tableX + halfW, currY + row5H);

  // Fund / Purpose
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOWARDS DESIGNATED PURPOSE:', tableX + 3, currY + 4);
  doc.setFontSize(8.2);
  doc.setTextColor(11, 25, 44);
  const purposeText = data.projectTitle || 'General Trust Social Welfare Fund';
  const splitPurpose = doc.splitTextToSize(purposeText, halfW - 6);
  doc.text(splitPurpose[0], tableX + 3, currY + 9);

  // Transaction Ref / UTR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSACTION REF / UTR ID:', tableX + halfW + 3, currY + 4);
  doc.setFontSize(8.2);
  doc.setTextColor(11, 25, 44);
  doc.text(data.paymentId || data.orderId || 'N/A', tableX + halfW + 3, currY + 9);

  currY += row5H + 5;

  // 7. Important Guidelines & Tax Benefit Information Box
  currY += 1;
  const infoBoxH = 15.5;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.25);
  doc.roundedRect(tableX, currY, tableW, infoBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('TAX DEDUCTION ELIGIBILITY & FORM 10BE COMPLIANCE NOTICE:', tableX + 3.5, currY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(71, 85, 105);
  const infoText =
    `• Section 80G Deduction: Donations to Nipania Vikash Seva Trust qualify for 50% income tax deduction under Section 80G(5)(vi).\n` +
    `• Annual Form 10BE Filing: The Trust files annual donor returns with the Income Tax Department. Retain this certificate for tax filing.\n` +
    `• Transparency Commitment: 100% of community contributions are deployed strictly towards verified humanitarian and educational programs.`;
  const infoLines = doc.splitTextToSize(infoText, tableW - 7);
  doc.text(infoLines, tableX + 3.5, currY + 7.8);

  currY += infoBoxH + 4.5;

  // 8. Statutory 80G Declaration Box
  const decBoxH = 24;
  doc.setFillColor(254, 252, 232); // Light Warm Amber/Gold tint
  doc.setDrawColor(245, 158, 11); // Amber 500 border
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, currY, tableW, decBoxH, 1.5, 1.5, 'FD');

  // Thick accent on left edge
  doc.setFillColor(245, 158, 11);
  doc.rect(tableX, currY, 1.8, decBoxH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('STATUTORY DECLARATION UNDER SECTION 80G OF THE INCOME TAX ACT, 1961:', tableX + 4.5, currY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 53, 15); // Amber 900
  const decText =
    `1. Certified that this voluntary contribution has been gratefully received towards the charitable objects of Nipania Vikash Seva Trust.\n` +
    `2. Nipania Vikash Seva Trust is registered under Section 12A (Reg No: ${reg12aNo}) and approved under Section 80G ` +
    `(Reg No: ${reg80gNo}) of the Income Tax Act, 1961. This contribution qualifies for 50% deduction from taxable income.\n` +
    `3. No commercial consideration, material benefits, goods, or services were provided to the donor in whole or partial exchange for this contribution.`;

  const decLines = doc.splitTextToSize(decText, tableW - 9);
  doc.text(decLines, tableX + 4.5, currY + 8.8);

  currY += decBoxH + 5;

  // 9. Verification QR Code & Authorized Signatory Area (STRICTLY NO INK SEAL)
  // Left: Verification QR Code
  const qrVerificationUrl = `${website}/verify?type=donation&id=${data.donationId}`;
  try {
    const qrBase64 = await QRCode.toDataURL(qrVerificationUrl, {
      margin: 1,
      width: 140,
      color: { dark: '#0B192C', light: '#FFFFFF' },
    });
    // QR Code Frame
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.rect(tableX + 2, currY, 26, 26);
    doc.addImage(qrBase64, 'PNG', tableX + 2.5, currY + 0.5, 25, 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(11, 25, 44);
    doc.text('SCAN TO VERIFY', tableX + 15, currY + 29.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Scan with any smartphone camera', tableX + 32, currY + 10);
    doc.text('to verify this official 80G receipt on trust portal.', tableX + 32, currY + 14.5);
    doc.text(`ID: ${data.donationId}`, tableX + 32, currY + 19);
  } catch (qrErr) {
    console.warn('QR Code generation warning:', qrErr);
  }

  // Right: Authorized Signatory Signature (Right-Aligned, Strictly NO INK SEAL)
  const sigBoxW = 60;
  const sigRightEdge = tableX + tableW - 3;
  const sigLeftEdge = sigRightEdge - sigBoxW;
  const sigCenter = (sigLeftEdge + sigRightEdge) / 2;

  try {
    const sigBase64 = await resolveImageToBase64(signatureUrl);
    if (sigBase64) {
      doc.addImage(sigBase64, 'PNG', sigCenter - 20, currY, 40, 14);
    }
  } catch (sigErr) {
    console.warn('Signature image embedding warning:', sigErr);
  }

  // Signatory Line
  doc.setDrawColor(197, 155, 39); // Sacred Gold
  doc.setLineWidth(0.4);
  doc.line(sigLeftEdge, currY + 16, sigRightEdge, currY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(11, 25, 44);
  doc.text(signatoryName, sigCenter, currY + 20.2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(signatoryTitle, sigCenter, currY + 24, { align: 'center' });

  doc.setFontSize(7);
  doc.text('Nipania Vikash Seva Trust', sigCenter, currY + 27.8, { align: 'center' });

  // 10. Certified Digital Footer (Occupies space gracefully down to 280mm)
  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(tableX, footerY, tableX + tableW, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `This is a computer-generated digital Section 80G Tax Exemption Certificate issued by Nipania Vikash Seva Trust on ${new Date().toLocaleString('en-IN')}.`,
    pageW / 2,
    footerY + 3.5,
    { align: 'center' }
  );

  doc.setFontSize(6);
  doc.text(
    `Portal: https://nipaniatrust.org    |    Verification: https://nipaniatrust.org/verify    |    Support: info@nipaniatrust.org`,
    pageW / 2,
    footerY + 6.5,
    { align: 'center' }
  );

  // 11. Auto-Print Trigger
  if (data.autoPrint) {
    doc.autoPrint({ variant: 'non-conform' });
  }

  // Return Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
