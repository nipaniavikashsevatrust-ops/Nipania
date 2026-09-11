import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { formatDate } from '@/lib/utils';

export interface RegistrationReceiptData {
  cardNumber: string; // Volunteer ID or Member ID
  fullName: string;
  role: string;
  personType: string; // VOLUNTEER, MEMBER, etc.
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  bloodGroup?: string | null;
  issueDate: string | Date;
  validUntil: string | Date;
  photoUrl?: string | null;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
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
    console.warn('Could not read local file for receipt:', err);
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
      console.warn('Could not fetch remote image for receipt PDF:', fetchErr);
    }
  }

  return null;
}

/**
 * Generates an official A4 Registration Receipt & Certificate PDF Buffer
 * Dimensions: 210mm x 297mm (Standard A4 Portrait)
 */
export async function generateRegistrationReceiptPdf(data: RegistrationReceiptData): Promise<Buffer> {
  // 1. Fetch Trust Settings for letterhead, stamp, signature & credentials
  let trustDetails = {
    name: 'NIPANIA VIKASH SEVA TRUST',
    regNumber: 'IV-120/2022',
    darpanId: 'NITI Aayog Darpan',
    presidentName: data.signatoryName || 'Managing Trustee',
    presidentTitle: data.signatoryTitle || 'President / Managing Trustee',
    phone: '+91 94311 23456',
    email: 'info@nipaniatrust.org',
    address: 'Nipania, P.O. Pargha, P.S. Baliapur, District Dhanbad, Jharkhand – 828201',
  };

  let dbTrust: any = null;
  try {
    dbTrust = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });
    if (dbTrust) {
      trustDetails = {
        name: dbTrust.name || trustDetails.name,
        regNumber: dbTrust.registrationNo || trustDetails.regNumber,
        darpanId: dbTrust.darpanId ? `Darpan: ${dbTrust.darpanId}` : trustDetails.darpanId,
        presidentName: data.signatoryName || dbTrust.presidentName || trustDetails.presidentName,
        presidentTitle: data.signatoryTitle || dbTrust.presidentTitle || trustDetails.presidentTitle,
        phone: dbTrust.phone || trustDetails.phone,
        email: dbTrust.email || trustDetails.email,
        address: dbTrust.registeredAddress || trustDetails.address,
      };
    }
  } catch (err) {
    console.warn('Could not fetch trust settings for receipt PDF, using defaults:', err);
  }

  // Automatic fallback to database-stored official stamp and signature
  const signatureUrlToResolve = data.signatureUrl || dbTrust?.presidentSignature || null;
  const stampUrlToResolve = data.stampUrl || dbTrust?.presidentStamp || null;

  // 2. Resolve Images in parallel
  const [logoBase64, signatureBase64, stampBase64] = await Promise.all([
    resolveImageToBase64('/logo.png'),
    resolveImageToBase64(signatureUrlToResolve),
    resolveImageToBase64(stampUrlToResolve),
  ]);

  // 3. Create A4 jsPDF instance (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = 210;
  const pageH = 297;
  const m = 14; // margin

  // Outer Border & Decorative Frame
  doc.setDrawColor(197, 155, 39); // Gold
  doc.setLineWidth(1.2);
  doc.rect(m, m, pageW - 2 * m, pageH - 2 * m);

  doc.setDrawColor(11, 25, 44); // Navy inner border
  doc.setLineWidth(0.4);
  doc.rect(m + 2, m + 2, pageW - 2 * m - 4, pageH - 2 * m - 4);

  // Background Security Watermark
  doc.setTextColor(245, 247, 250);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  try {
    doc.text('NIPANIA VIKASH SEVA TRUST', pageW / 2, 120, { align: 'center', angle: -30 });
    doc.text('OFFICIAL REGISTRATION RECEIPT', pageW / 2, 170, { align: 'center', angle: -30 });
  } catch {
    // Ignore angle failure if unsupported
  }

  // ==========================================
  // 1. TRUST OFFICIAL LETTERHEAD
  // ==========================================
  const headerTop = m + 6;

  // Logo
  if (logoBase64) {
    try {
      const format = logoBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(logoBase64, format, m + 6, headerTop, 22, 22);
    } catch {
      // ignore
    }
  }

  // Header Titles
  doc.setTextColor(11, 25, 44); // Midnight Navy
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(trustDetails.name, pageW / 2 + 10, headerTop + 6, { align: 'center' });

  doc.setTextColor(180, 83, 9); // Gold/Amber
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SEVA • VIKASH • SAMARPAN', pageW / 2 + 10, headerTop + 12, { align: 'center' });

  doc.setTextColor(71, 85, 105); // Slate
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Govt. Regd: ${trustDetails.regNumber}  •  ${trustDetails.darpanId}`,
    pageW / 2 + 10,
    headerTop + 17,
    { align: 'center' }
  );

  doc.text(
    `${trustDetails.address}  |  Phone: ${trustDetails.phone}  |  Email: ${trustDetails.email}`,
    pageW / 2 + 10,
    headerTop + 22,
    { align: 'center' }
  );

  // Horizontal Header Divider
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.8);
  doc.line(m + 4, headerTop + 26, pageW - m - 4, headerTop + 26);

  // ==========================================
  // 2. DOCUMENT TITLE RIBBON
  // ==========================================
  const ribbonY = headerTop + 30;
  doc.setFillColor(11, 25, 44);
  doc.roundedRect(m + 6, ribbonY, pageW - 2 * m - 12, 10, 2, 2, 'F');

  doc.setTextColor(253, 224, 71); // Gold 300
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const titleText = data.personType?.toUpperCase() === 'VOLUNTEER'
    ? 'OFFICIAL VOLUNTEER REGISTRATION RECEIPT & ACKNOWLEDGMENT'
    : 'OFFICIAL MEMBERSHIP REGISTRATION RECEIPT & CERTIFICATE';
  doc.text(titleText, pageW / 2, ribbonY + 6.8, { align: 'center' });

  // ==========================================
  // 3. RECEIPT METADATA BAR (NO OVERFLOW)
  // ==========================================
  const metaY = ribbonY + 14;
  const metaBoxW = pageW - 2 * m - 12; // 170mm
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(m + 6, metaY, metaBoxW, 14, 1.5, 1.5, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT NO:', m + 10, metaY + 5);
  doc.text('ISSUE DATE:', m + 56, metaY + 5);
  doc.text('VALIDITY PERIOD:', m + 96, metaY + 5);

  doc.setTextColor(11, 25, 44);
  doc.setFontSize(8.5);
  doc.setFont('courier', 'bold');
  doc.text(`REC-${data.cardNumber}`, m + 10, metaY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(data.issueDate), m + 56, metaY + 10.5);

  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`Till ${formatDate(data.validUntil)}`, m + 96, metaY + 10.5);

  // Status Pill - sized with plenty of padding so text NEVER overflows or overlaps
  const statusPillW = 34;
  const statusPillH = 7.5;
  const statusPillX = pageW - m - 6 - statusPillW - 3; // 153mm
  const statusPillY = metaY + 3.25;
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(statusPillX, statusPillY, statusPillW, statusPillH, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('APPROVED & ACTIVE', statusPillX + statusPillW / 2, statusPillY + 4.9, { align: 'center' });

  // ==========================================
  // 4. CANDIDATE REGISTRATION DETAILS TABLE (AUTO-WRAPPING)
  // ==========================================
  const detailsY = metaY + 18;

  doc.setTextColor(11, 25, 44);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. APPLICANT & REGISTRATION PARTICULARS', m + 6, detailsY);

  const tableY = detailsY + 3;
  const colW1 = 52;
  const colW2 = pageW - 2 * m - 12 - colW1; // 118mm

  const rows = [
    { label: 'Full Legal Name', value: data.fullName.toUpperCase() },
    { label: 'Assigned Registration ID', value: data.cardNumber },
    { label: 'Cadre / Role Category', value: data.role },
    { label: 'Affiliation Type', value: `${data.personType} (Non-Profit Seva Corps)` },
    { label: 'Mobile Contact', value: data.mobile || 'Registered on record' },
    { label: 'Email Address', value: data.email || 'Registered on record' },
    { label: 'Residential Address', value: data.address || 'Nipania, Chatra, Jharkhand' },
    { label: 'Blood Group / Emergency', value: data.bloodGroup || 'Recorded in Central Roster' },
    { label: 'Identity Verification Status', value: 'Digitally Authenticated & Approved' },
  ];

  let currentY = tableY;
  rows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    const isMonospace = row.label === 'Assigned Registration ID';

    // Set font to measure wrapped text accurately
    doc.setFontSize(isMonospace ? 9 : 8.5);
    doc.setFont(isMonospace ? 'courier' : 'helvetica', isMonospace ? 'bold' : 'normal');

    // Split text to avoid ANY overflow!
    const lines = doc.splitTextToSize(row.value, colW2 - 8);
    const rowH = Math.max(7.8, lines.length * 4.5 + 3.3);

    // Background
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(m + 6, currentY, pageW - 2 * m - 12, rowH, 'F');

    // Borders
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(m + 6, currentY, colW1, rowH, 'D');
    doc.rect(m + 6 + colW1, currentY, colW2, rowH, 'D');

    // Label
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(row.label, m + 9, currentY + 5.2);

    // Value
    if (isMonospace) {
      doc.setTextColor(180, 83, 9);
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
    } else {
      doc.setTextColor(11, 25, 44);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    if (lines.length === 1) {
      doc.text(lines[0], m + 9 + colW1, currentY + 5.2);
    } else {
      lines.forEach((line: string, lineIdx: number) => {
        doc.text(line, m + 9 + colW1, currentY + 4.5 + lineIdx * 4.5);
      });
    }

    currentY += rowH;
  });

  // ==========================================
  // 5. OFFICIAL TERMS & INSTRUCTIONS
  // ==========================================
  const notesY = currentY + 6;

  doc.setTextColor(11, 25, 44);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. TERMS, PRIVILEGES & IMPORTANT INSTRUCTIONS', m + 6, notesY);

  const notesBoxY = notesY + 3;
  const notesBoxH = 32;
  doc.setFillColor(254, 252, 232); // Amber 50
  doc.setDrawColor(253, 224, 71); // Gold 300
  doc.setLineWidth(0.4);
  doc.roundedRect(m + 6, notesBoxY, pageW - 2 * m - 12, notesBoxH, 1.5, 1.5, 'FD');

  const instructions = [
    '1. Official Registration Proof: This receipt serves as your official legal acknowledgment and proof of active registration with Nipania Vikash Seva Trust.',
    '2. Physical PVC ID Card Issuance: Your physical Single-Sided CR80 PVC Identity Card is being prepared by the Trust administrative desk and will be issued/dispatched to you.',
    '3. Community Welfare Participation: You are authorized to represent the Trust in community development, relief distribution, health camps, and educational programs.',
    '4. Real-Time Online Verification: Anyone can instantly verify the authenticity of your registration by scanning the QR code below or visiting the public verification portal.',
  ];

  doc.setTextColor(113, 63, 18); // Amber 900
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  instructions.forEach((inst, i) => {
    doc.text(inst, m + 9, notesBoxY + 5.5 + i * 6.8, { maxWidth: pageW - 2 * m - 18 });
  });

  // ==========================================
  // 6. VERIFICATION QR CODE + ORIGINAL SEAL + SIGNATURE
  // ==========================================
  const verifyY = notesBoxY + notesBoxH + 5;
  const verifyBoxH = 40;

  // Outer Verification Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(m + 6, verifyY, pageW - 2 * m - 12, verifyBoxH, 2, 2, 'D');

  // Column A: QR Code
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org'}/verify/${data.cardNumber}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#0B192C', light: '#FFFFFF' },
    });
    doc.addImage(qrDataUrl, 'PNG', m + 10, verifyY + 4, 24, 24);
  } catch (err) {
    console.warn('QR code generation error for receipt:', err);
  }

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN TO VERIFY', m + 22, verifyY + 32, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Live Govt. & Trust Portal', m + 22, verifyY + 35.5, { align: 'center' });

  // Column B: Official Trust Seal Stamp (Original Seal from database or fallback)
  const sealCenterX = pageW / 2;
  if (stampBase64) {
    try {
      const format = stampBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(stampBase64, format, sealCenterX - 14, verifyY + 3, 28, 28);
    } catch (err) {
      console.warn('Could not add image seal to PDF:', err);
    }
  } else {
    // Drawn Seal Fallback
    doc.setDrawColor(190, 18, 60); // Rose
    doc.setLineWidth(0.6);
    doc.circle(sealCenterX, verifyY + 16, 12, 'D');
    doc.setLineWidth(0.2);
    doc.circle(sealCenterX, verifyY + 16, 10.5, 'D');

    doc.setTextColor(159, 18, 57);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('NIPANIA VIKASH SEVA TRUST', sealCenterX, verifyY + 12, { align: 'center' });
    doc.setFontSize(7.5);
    doc.text('OFFICIAL SEAL', sealCenterX, verifyY + 16.5, { align: 'center' });
    doc.setFontSize(5.5);
    doc.text('REGD. IV-120/2022', sealCenterX, verifyY + 20, { align: 'center' });
  }
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Official Seal of the Trust', sealCenterX, verifyY + 35, { align: 'center' });

  // Column C: Authorized Signatory (Original Signature from database or fallback)
  const sigX = pageW - m - 45;
  if (signatureBase64) {
    try {
      const format = signatureBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(signatureBase64, format, sigX - 16, verifyY + 4, 32, 14);
    } catch {
      doc.setTextColor(11, 25, 44);
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.text(trustDetails.presidentName, sigX, verifyY + 14, { align: 'center' });
    }
  } else {
    doc.setTextColor(11, 25, 44);
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.text(trustDetails.presidentName, sigX, verifyY + 14, { align: 'center' });
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(sigX - 22, verifyY + 20, sigX + 22, verifyY + 20);

  doc.setTextColor(11, 25, 44);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED SIGNATORY', sigX, verifyY + 24, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(trustDetails.presidentTitle, sigX, verifyY + 28, { align: 'center' });
  doc.text('Nipania Vikash Seva Trust', sigX, verifyY + 31.5, { align: 'center' });

  // ==========================================
  // 7. LEGAL FOOTER
  // ==========================================
  const footerY = pageH - m - 6;
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.5);
  doc.line(m + 4, footerY - 3, pageW - m - 4, footerY - 3);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Nipania Vikash Seva Trust  •  Registered Public Charitable Trust under Indian Trusts Act  •  Reg. No: IV-120/2022',
    pageW / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    'This is a computer-generated official receipt and acknowledgment. For queries, contact info@nipaniatrust.org or +91 94311 23456.',
    pageW / 2,
    footerY + 3.5,
    { align: 'center' }
  );

  return Buffer.from(doc.output('arraybuffer'));
}
