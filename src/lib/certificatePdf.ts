import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatDate } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export interface CertificatePdfData {
  certificateNumber: string;
  certificateType: string;
  title: string;
  recipientName: string;
  recipientEmail?: string | null;
  description?: string | null;
  issueDate: string | Date;
  status: string;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
  verificationCode: string;
  verificationUrl?: string | null;
  eventName?: string | null;
  projectName?: string | null;
}

export interface TrustPdfDetails {
  name?: string | null;
  tagline?: string | null;
  pan?: string | null;
  darpanId?: string | null;
  registrationNumber?: string | null;
  address?: string | null;
  presidentName?: string | null;
  presidentTitle?: string | null;
  presidentSignature?: string | null;
  presidentStamp?: string | null;
}

const DEFAULT_TRUST_DETAILS: TrustPdfDetails = {
  name: 'NIPANIA VIKASH SEVA TRUST',
  tagline: 'SEVA | VIKASH | SAMARPAN',
  pan: 'AAFTN4004N',
  darpanId: 'UP/2021/0295112',
  registrationNumber: 'IV-120/2022',
  address: 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND – 828201',
  presidentName: 'Managing Trustee',
  presidentTitle: 'President / Managing Trustee',
  presidentSignature: '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png',
  presidentStamp: '/uploads/1788718898264-ChatGPT_Image_Jul_16__2026__12_22_33_PM__1_.png',
};

/**
 * Resolves an image URL or local path to base64 Data URL
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
    console.warn('Could not read local file for certificate PDF:', err);
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
      console.warn('Could not fetch remote image for certificate PDF:', fetchErr);
    }
  }
  return null;
}

/**
 * Draws a single A4 Landscape Certificate onto a jsPDF document page
 */
export async function drawCertificatePage(
  doc: jsPDF,
  cert: CertificatePdfData,
  customTrust?: TrustPdfDetails
): Promise<void> {
  const trust = { ...DEFAULT_TRUST_DETAILS, ...customTrust };
  const pageWidth = 297;
  const pageHeight = 210;

  // Background Canvas: Warm Pearl Ivory
  doc.setFillColor(254, 254, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Decorative Navy Border
  doc.setDrawColor(12, 35, 76); // Deep Royal Sapphire #0C234C
  doc.setLineWidth(2.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner Gold Accent Border
  doc.setDrawColor(197, 155, 39); // Amber Gold #C59B27
  doc.setLineWidth(0.8);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Corner Ornaments
  const cornerSize = 12;
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.6);
  // Top-left
  doc.line(11, 11 + cornerSize, 11, 11);
  doc.line(11, 11, 11 + cornerSize, 11);
  // Top-right
  doc.line(pageWidth - 11 - cornerSize, 11, pageWidth - 11, 11);
  doc.line(pageWidth - 11, 11, pageWidth - 11, 11 + cornerSize);
  // Bottom-left
  doc.line(11, pageHeight - 11 - cornerSize, 11, pageHeight - 11);
  doc.line(11, pageHeight - 11, 11 + cornerSize, pageHeight - 11);
  // Bottom-right
  doc.line(pageWidth - 11 - cornerSize, pageHeight - 11, pageWidth - 11, pageHeight - 11);
  doc.line(pageWidth - 11, pageHeight - 11 - cornerSize, pageWidth - 11, pageHeight - 11);

  // 1. Trust Logo & Grand Centered Header
  const logoData = await resolveImageToBase64('/logo.png');
  if (logoData) {
    try {
      doc.setDrawColor(197, 155, 39);
      doc.setLineWidth(0.5);
      doc.circle(pageWidth / 2, 23, 9.5, 'S');
      doc.addImage(logoData, 'PNG', pageWidth / 2 - 8.5, 14.5, 17, 17);
    } catch (e) {
      console.warn('Could not render logo in certificate:', e);
    }
  }

  // 2. Organization Header: Prominent Trust Title
  const trustName = (trust.name || 'NIPANIA VIKASH SEVA TRUST').toUpperCase();
  doc.setTextColor(12, 35, 76); // Deep Royal Sapphire #0C234C
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(trustName, pageWidth / 2, 38, { align: 'center' });

  // Subtitle / Legal Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber 800
  const tagline = trust.tagline ? ` • ${trust.tagline}` : ' • SEVA | VIKASH | SAMARPAN';
  doc.text(`REGISTERED PUBLIC CHARITABLE TRUST${tagline}`.toUpperCase(), pageWidth / 2, 43, { align: 'center' });

  // Statutory Credentials
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const regNo = trust.registrationNumber || 'IV-120/2022';
  const pan = trust.pan || 'AAFTN4004N';
  const darpan = trust.darpanId || 'UP/2021/0295112';
  doc.text(`Govt. Reg. No: ${regNo}  •  PAN: ${pan}  •  NGO Darpan ID: ${darpan}`, pageWidth / 2, 47, { align: 'center' });

  // Registered Address Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(trust.address || 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND – 828201', pageWidth / 2, 50.5, { align: 'center' });

  // Majestic Ornate Divider Ribbon with Diamond Accent
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.6);
  doc.line(35, 53.5, 138, 53.5);
  doc.line(159, 53.5, 262, 53.5);
  doc.setTextColor(197, 155, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('♦ ❖ ♦', pageWidth / 2, 54.5, { align: 'center' });

  // 3. Certificate Category Badge (Rounded Gold Pill matching preview)
  const certTypeHeading = cert.title || `CERTIFICATE OF ${cert.certificateType.replace(/_/g, ' ')}`;
  const badgeText = `★  ${certTypeHeading.toUpperCase()}  ★`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const textWidth = doc.getTextWidth(badgeText);
  const badgeW = Math.max(textWidth + 18, 105);
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(197, 155, 39); // Amber 500 / Gold
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - badgeW / 2, 57.5, badgeW, 8, 4, 4, 'FD');
  doc.setTextColor(12, 35, 76);
  doc.text(badgeText, pageWidth / 2, 63, { align: 'center' });

  // 4. Presentation line
  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.text('This certificate of honour is proudly presented to', pageWidth / 2, 71.5, { align: 'center' });

  // 5. Recipient Name Spotlight
  doc.setTextColor(12, 35, 76);
  doc.setFont('times', 'bold');
  doc.setFontSize(25);
  doc.text(cert.recipientName.toUpperCase(), pageWidth / 2, 82.5, { align: 'center' });

  // Recipient Flourish Underline with center diamond
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 32, 85.5, pageWidth / 2 - 4, 85.5);
  doc.line(pageWidth / 2 + 4, 85.5, pageWidth / 2 + 32, 85.5);
  doc.setTextColor(197, 155, 39);
  doc.setFontSize(7.5);
  doc.text('❖', pageWidth / 2, 86.5, { align: 'center' });

  // 6. Citation / Description Body
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const defaultCitation =
    'In recognition of valuable voluntary service, sincere dedication, and active participation towards the community development, social welfare, and humanitarian initiatives of the Trust.';
  const citationText = cert.description || defaultCitation;
  const wrappedCitation = doc.splitTextToSize(citationText, 215);
  doc.text(wrappedCitation, pageWidth / 2, 93.5, { align: 'center', lineHeightFactor: 1.35 });

  // Event / Project reference if provided
  let currentY = 93.5 + wrappedCitation.length * 5.2 + 2;
  if (cert.eventName || cert.projectName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`✦ Program / Initiative: ${cert.eventName || cert.projectName}`, pageWidth / 2, currentY, { align: 'center' });
  }

  // Divider above footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(22, 118, 275, 118);

  // 7. Footer Columns [Left: Metadata Card] [Center: QR Code] [Right: Authorized Signatory]
  const footerY = 124;

  // Left Column: Certificate Metadata Card (Matching Web Preview Card)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(22, footerY, 70, 52, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('CERTIFICATE NUMBER', 26, footerY + 7);

  doc.setTextColor(12, 35, 76);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.text(cert.certificateNumber, 26, footerY + 13);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('DATE OF ISSUE', 26, footerY + 21);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(formatDate(cert.issueDate), 26, footerY + 27);

  // Status Badge Pill inside Metadata Card
  doc.setFillColor(209, 250, 229);
  doc.setDrawColor(110, 231, 183);
  doc.setLineWidth(0.3);
  doc.roundedRect(26, footerY + 34, 62, 7.5, 2.5, 2.5, 'FD');
  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const statusLabel = cert.status === 'ISSUED' ? 'OFFICIALLY ISSUED & VERIFIED' : `STATUS: ${cert.status}`;
  doc.text(statusLabel, 26 + 31, footerY + 39, { align: 'center' });

  // Center Column: Server-Verified QR Code
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';
  const verifyUrl = cert.verificationUrl || `${origin}/verify/${cert.certificateNumber}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 160,
      margin: 1,
      color: { dark: '#0C234C', light: '#FFFFFF' },
    });

    // White QR card with gold border matching web preview
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(197, 155, 39);
    doc.setLineWidth(0.5);
    doc.roundedRect(pageWidth / 2 - 15, footerY + 1, 30, 30, 3, 3, 'FD');
    doc.addImage(qrDataUrl, 'PNG', pageWidth / 2 - 13.5, footerY + 2.5, 27, 27);

    doc.setTextColor(12, 35, 76);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('SCAN TO VERIFY ONLINE', pageWidth / 2, footerY + 36, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.text(cert.verificationCode, pageWidth / 2, footerY + 40.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Direct Central DB Authentication', pageWidth / 2, footerY + 44.5, { align: 'center' });
  } catch (qrErr) {
    console.warn('Could not render QR code on certificate PDF:', qrErr);
  }

  // Right Column: Official Stamp, Signature and Signatory Info
  const signatoryX = pageWidth - 60;

  // Render Official President Stamp first (so signature overlays on top)
  const stampData = await resolveImageToBase64(trust.presidentStamp);
  if (stampData) {
    try {
      doc.addImage(stampData, 'PNG', signatoryX - 18, footerY, 32, 32);
    } catch (e) {
      console.warn('Could not render stamp in certificate PDF:', e);
    }
  }

  // Render Official President Signature on top of the stamp
  const sigData = await resolveImageToBase64(trust.presidentSignature);
  if (sigData) {
    try {
      doc.addImage(sigData, 'PNG', signatoryX - 24, footerY + 8, 46, 18);
    } catch (e) {
      console.warn('Could not render signature in certificate PDF:', e);
    }
  }

  // Signatory separator line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.6);
  doc.line(signatoryX - 26, footerY + 31, signatoryX + 26, footerY + 31);

  const signName = cert.signatoryName || trust.presidentName || 'Managing Trustee';
  doc.setTextColor(12, 35, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(signName, signatoryX, footerY + 36, { align: 'center' });

  const signTitle = cert.signatoryTitle || trust.presidentTitle || 'President / Managing Trustee';
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(signTitle, signatoryX, footerY + 40.5, { align: 'center' });

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(trust.name || 'Nipania Vikash Seva Trust', signatoryX, footerY + 45, { align: 'center' });

  // 8. Footer Legal Note (Dignified & Subtle)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official recognition document issued under Trust Registration No. ${trust.registrationNumber || 'IV-120/2022'} • Authenticate at nipaniatrust.org/verify`,
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );
}

/**
 * Generates an official single A4 Landscape Certificate PDF
 */
export async function generateCertificatePdf(
  cert: CertificatePdfData,
  trustDetails?: TrustPdfDetails
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  await drawCertificatePage(doc, cert, trustDetails);

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

/**
 * Generates an official multi-page A4 Landscape Certificate PDF containing multiple certificates
 */
export async function generateBulkCertificatePdf(
  certs: CertificatePdfData[],
  trustDetails?: TrustPdfDetails
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < certs.length; i++) {
    if (i > 0) {
      doc.addPage('a4', 'landscape');
    }
    await drawCertificatePage(doc, certs[i], trustDetails);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
