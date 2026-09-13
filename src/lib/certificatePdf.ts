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
 * Draws a filled vector diamond centered at (cx, cy)
 */
function drawVectorDiamond(
  doc: jsPDF,
  cx: number,
  cy: number,
  w: number,
  h: number,
  r = 197,
  g = 155,
  b = 39
) {
  doc.setFillColor(r, g, b);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.15);
  const hw = w / 2;
  const hh = h / 2;
  doc.lines(
    [
      [hw, hh],
      [-hw, hh],
      [-hw, -hh],
      [hw, -hh],
    ],
    cx,
    cy - hh,
    [1, 1],
    'FD',
    true
  );
}

/**
 * Draws a 5-pointed filled vector star centered at (cx, cy)
 */
function drawVectorStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  r = 197,
  g = 155,
  b = 39
) {
  const spikes = 5;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  const points: [number, number][] = [];

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    points.push([x, y]);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    points.push([x, y]);
    rot += step;
  }

  doc.setFillColor(r, g, b);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.15);

  const startX = points[0][0];
  const startY = points[0][1];
  const deltas: [number, number][] = [];
  let prevX = startX;
  let prevY = startY;

  for (let i = 1; i < points.length; i++) {
    deltas.push([points[i][0] - prevX, points[i][1] - prevY]);
    prevX = points[i][0];
    prevY = points[i][1];
  }
  deltas.push([startX - prevX, startY - prevY]);

  doc.lines(deltas, startX, startY, [1, 1], 'FD', true);
}

/**
 * Draws a single A4 Landscape Certificate onto a jsPDF document page
 * Guaranteed 1:1 visual match with the web CertificateRenderer preview
 */
export async function drawCertificatePage(
  doc: jsPDF,
  cert: CertificatePdfData,
  trustDetails?: TrustPdfDetails
): Promise<void> {
  const pageWidth = 297;
  const pageHeight = 210;

  const trust: TrustPdfDetails = {
    ...DEFAULT_TRUST_DETAILS,
    ...trustDetails,
  };

  // 1. Premium Parchment Background
  doc.setFillColor(254, 254, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Outer Regal Royal Sapphire Border
  doc.setDrawColor(12, 35, 76); // Royal Sapphire #0C234C
  doc.setLineWidth(2.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // 3. Inner Gold Accent Border
  doc.setDrawColor(197, 155, 39); // Amber Gold #C59B27
  doc.setLineWidth(0.8);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // 4. Second Inner Gold Accent Border (Faint)
  doc.setDrawColor(218, 184, 85);
  doc.setLineWidth(0.35);
  doc.rect(13.6, 13.6, pageWidth - 27.2, pageHeight - 27.2);

  // 5. Corner Ornaments (Inner Border Accents)
  const cornerSize = 11;
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.6);
  // Top-left
  doc.line(12, 12 + cornerSize, 12, 12);
  doc.line(12, 12, 12 + cornerSize, 12);
  // Top-right
  doc.line(pageWidth - 12 - cornerSize, 12, pageWidth - 12, 12);
  doc.line(pageWidth - 12, 12, pageWidth - 12, 12 + cornerSize);
  // Bottom-left
  doc.line(12, pageHeight - 12 - cornerSize, 12, pageHeight - 12);
  doc.line(12, pageHeight - 12, 12 + cornerSize, pageHeight - 12);
  // Bottom-right
  doc.line(pageWidth - 12 - cornerSize, pageHeight - 12, pageWidth - 12, pageHeight - 12);
  doc.line(pageWidth - 12, pageHeight - 12 - cornerSize, pageWidth - 12, pageHeight - 12);

  // 6. Central Background Watermark Logo (Subtle Opacity)
  const logoData = await resolveImageToBase64('/logo.png');
  if (logoData) {
    try {
      if ((doc as any).GState) {
        const watermarkGState = new (doc as any).GState({ opacity: 0.035 });
        (doc as any).setGState(watermarkGState);
        doc.addImage(logoData, 'PNG', pageWidth / 2 - 42.5, pageHeight / 2 - 42.5, 85, 85);
        (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
      }
    } catch (wmErr) {
      console.warn('Could not draw watermark on certificate PDF:', wmErr);
    }
  }

  // 7. Header Section: Symmetrically Centered Lockup (Logo + Gap + Text Block)
  const trustName = (trust.name || 'NIPANIA VIKASH SEVA TRUST').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  const trustNameW = doc.getTextWidth(trustName);

  doc.setFontSize(8.5);
  const taglineStr = `REGISTERED PUBLIC CHARITABLE TRUST | ${trust.tagline || 'SEVA | VIKASH | SAMARPAN'}`.toUpperCase();
  const taglineW = doc.getTextWidth(taglineStr);

  doc.setFontSize(7.5);
  const regNo = trust.registrationNumber || 'IV-120/2022';
  const pan = trust.pan || 'AAFTN4004N';
  const darpan = trust.darpanId || 'UP/2021/0295112';
  const credsStr = `Govt. Reg. No: ${regNo}  |  PAN: ${pan}  |  NGO Darpan ID: ${darpan}`;
  const credsW = doc.getTextWidth(credsStr);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const addressStr = (trust.address || 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND - 828201').toUpperCase();
  const addressW = doc.getTextWidth(addressStr);

  const maxHeaderW = Math.max(trustNameW, taglineW, credsW, addressW);
  const lockupLogoW = 20;
  const lockupGap = 6;
  const totalLockupW = lockupLogoW + lockupGap + maxHeaderW;
  const lockupStartX = (pageWidth - totalLockupW) / 2;
  const logoCenterX = lockupStartX + lockupLogoW / 2;
  const logoCenterY = 28;
  const textCenterX = lockupStartX + lockupLogoW + lockupGap + maxHeaderW / 2;

  // Render Circular Trust Logo on Left
  if (logoData) {
    try {
      doc.setDrawColor(197, 155, 39);
      doc.setLineWidth(0.6);
      doc.setFillColor(255, 255, 255);
      doc.circle(logoCenterX, logoCenterY, 10, 'FD');

      doc.setDrawColor(218, 184, 85);
      doc.setLineWidth(0.3);
      doc.circle(logoCenterX, logoCenterY, 9, 'S');

      doc.addImage(logoData, 'PNG', logoCenterX - 7.5, logoCenterY - 7.5, 15, 15);
    } catch (e) {
      console.warn('Could not render header logo in certificate PDF:', e);
    }
  }

  // Trust Name
  doc.setTextColor(12, 35, 76); // Deep Royal Sapphire #0C234C
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text(trustName, textCenterX, 22.5, { align: 'center' });

  // Subtitle / Legal Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber 800
  doc.text(taglineStr, textCenterX, 28, { align: 'center' });

  // Statutory Credentials
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(credsStr, textCenterX, 32.8, { align: 'center' });

  // Registered Address Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(addressStr, textCenterX, 36.8, { align: 'center' });

  // Majestic Ornate Divider Ribbon with Pure Vector Diamonds (no Unicode artifacts)
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.6);
  doc.line(35, 41.5, pageWidth / 2 - 9, 41.5);
  doc.line(pageWidth / 2 + 9, 41.5, pageWidth - 35, 41.5);

  // Trio of Vector Gold Diamonds
  drawVectorDiamond(doc, pageWidth / 2 - 5, 41.5, 2.2, 2.2, 197, 155, 39);
  drawVectorDiamond(doc, pageWidth / 2, 41.5, 3.6, 3.6, 197, 155, 39);
  drawVectorDiamond(doc, pageWidth / 2 + 5, 41.5, 2.2, 2.2, 197, 155, 39);

  // 8. Certificate Award Category Badge (Rounded Gold Pill with Vector Stars)
  const certTypeHeading = (cert.title || `CERTIFICATE OF ${cert.certificateType.replace(/_/g, ' ')}`).toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const badgeTextW = doc.getTextWidth(certTypeHeading);
  const badgeW = badgeTextW + 28;
  const badgeH = 8.5;
  const badgeY = 46.5;

  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(197, 155, 39); // Amber 500 / Gold
  doc.setLineWidth(0.6);
  doc.roundedRect(pageWidth / 2 - badgeW / 2, badgeY, badgeW, badgeH, 4.25, 4.25, 'FD');

  // Left vector gold star
  drawVectorStar(doc, pageWidth / 2 - badgeTextW / 2 - 6, badgeY + badgeH / 2, 2.2, 0.95, 197, 155, 39);

  // Clean ASCII Category Title
  doc.setTextColor(12, 35, 76);
  doc.text(certTypeHeading, pageWidth / 2, badgeY + 5.8, { align: 'center' });

  // Right vector gold star
  drawVectorStar(doc, pageWidth / 2 + badgeTextW / 2 + 6, badgeY + badgeH / 2, 2.2, 0.95, 197, 155, 39);

  // 9. Presentation Line
  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('This certificate of honour is proudly presented to', pageWidth / 2, 61.5, { align: 'center' });

  // 10. Recipient Name Spotlight (Grand Serif Bold)
  doc.setTextColor(12, 35, 76);
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.text(cert.recipientName.toUpperCase(), pageWidth / 2, 73, { align: 'center' });

  // Recipient Flourish Underline with Vector Center Diamond
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 30, 76.5, pageWidth / 2 - 4, 76.5);
  doc.line(pageWidth / 2 + 4, 76.5, pageWidth / 2 + 30, 76.5);
  drawVectorDiamond(doc, pageWidth / 2, 76.5, 3, 3, 197, 155, 39);

  // 11. Citation / Description Body (Balanced width preventing orphan single-word lines)
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const defaultCitation =
    'In recognition of valuable voluntary service, sincere dedication, and active participation towards the community development, social welfare, and humanitarian initiatives of the Trust.';
  const citationText = cert.description || defaultCitation;
  const wrappedCitation = doc.splitTextToSize(citationText, 235);
  doc.text(wrappedCitation, pageWidth / 2, 83.5, { align: 'center', lineHeightFactor: 1.45 });

  // Event / Project Reference Pill if provided
  let currentY = 83.5 + wrappedCitation.length * 5.8 + 2;
  if (cert.eventName || cert.projectName) {
    const progText = `Program / Initiative: ${cert.eventName || cert.projectName}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const progW = doc.getTextWidth(progText) + 16;
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(pageWidth / 2 - progW / 2, currentY - 3.5, progW, 6.5, 3, 3, 'FD');

    // Vector Diamond Bullet
    drawVectorDiamond(doc, pageWidth / 2 - progW / 2 + 4.5, currentY - 0.25, 2, 2, 217, 119, 6);

    doc.setTextColor(180, 83, 9);
    doc.text(progText, pageWidth / 2 + 2, currentY + 1, { align: 'center' });
    currentY += 8;
  }

  // Divider above footer (matching preview border-t border-slate-200/90)
  const dividerY = 122;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(22, dividerY, pageWidth - 22, dividerY);

  // 12. Footer Columns: Left Metadata Box, Center QR Code, Right Signatory & Stamp
  const footerY = 127;

  // LEFT COLUMN: Certificate Metadata Card (Identical to Web Preview Card, height 48mm)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(22, footerY, 74, 48, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CERTIFICATE NUMBER', 26, footerY + 6.5);

  doc.setTextColor(12, 35, 76);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(cert.certificateNumber, 26, footerY + 13);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DATE OF ISSUE', 26, footerY + 20.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(formatDate(cert.issueDate), 26, footerY + 27);

  // Status Badge Pill inside Metadata Card (symmetrically centered)
  const isIssued = cert.status === 'ISSUED';
  const isRevoked = cert.status === 'REVOKED';
  doc.setFillColor(isIssued ? 209 : isRevoked ? 254 : 241, isIssued ? 250 : isRevoked ? 226 : 245, isIssued ? 229 : isRevoked ? 226 : 249);
  doc.setDrawColor(isIssued ? 110 : isRevoked ? 252 : 203, isIssued ? 231 : isRevoked ? 165 : 213, isIssued ? 183 : isRevoked ? 165 : 225);
  doc.setLineWidth(0.35);
  const pillW = 66;
  const pillH = 7.5;
  const pillX = 26;
  const pillY = footerY + 34.5;
  doc.roundedRect(pillX, pillY, pillW, pillH, 3.5, 3.5, 'FD');

  // Status Indicator Dot
  doc.setFillColor(isIssued ? 5 : isRevoked ? 225 : 100, isIssued ? 150 : isRevoked ? 29 : 116, isIssued ? 105 : isRevoked ? 72 : 139);
  doc.circle(pillX + 5, pillY + pillH / 2, 1.2, 'F');

  // Status Text
  doc.setTextColor(isIssued ? 4 : isRevoked ? 190 : 71, isIssued ? 120 : isRevoked ? 18 : 85, isIssued ? 87 : isRevoked ? 60 : 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const statusLabel = isIssued ? 'OFFICIALLY ISSUED' : cert.status;
  doc.text(statusLabel, pillX + 9, pillY + 5.1, { align: 'left' });

  // CENTER COLUMN: Server-Verified QR Code Frame
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org';
  const verifyUrl = cert.verificationUrl || `${origin}/verify/${cert.certificateNumber}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#0C234C', light: '#FFFFFF' },
    });

    // White QR card with gold border matching web preview
    const qrCardSize = 30;
    const qrCardX = pageWidth / 2 - qrCardSize / 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(197, 155, 39);
    doc.setLineWidth(0.6);
    doc.roundedRect(qrCardX, footerY, qrCardSize, qrCardSize, 3, 3, 'FD');
    doc.addImage(qrDataUrl, 'PNG', qrCardX + 1.5, footerY + 1.5, qrCardSize - 3, qrCardSize - 3);

    doc.setTextColor(12, 35, 76);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SCAN TO VERIFY ONLINE', pageWidth / 2, footerY + 36, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text(cert.verificationCode, pageWidth / 2, footerY + 40.5, { align: 'center' });

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Direct Central DB Verification', pageWidth / 2, footerY + 44.5, { align: 'center' });
  } catch (qrErr) {
    console.warn('Could not render QR code on certificate PDF:', qrErr);
  }

  // RIGHT COLUMN: Authorized Signatory, Authentic Stamp & Signature
  const signatoryX = pageWidth - 58;

  // Render Official President Stamp first (so signature overlays on top)
  const stampData = await resolveImageToBase64(trust.presidentStamp);
  if (stampData) {
    try {
      doc.addImage(stampData, 'PNG', signatoryX - 22, footerY - 2, 34, 34);
    } catch (e) {
      console.warn('Could not render stamp in certificate PDF:', e);
    }
  }

  // Render Official President Signature on top of the stamp
  const sigData = await resolveImageToBase64(trust.presidentSignature);
  if (sigData) {
    try {
      doc.addImage(sigData, 'PNG', signatoryX - 23, footerY + 7, 46, 19);
    } catch (e) {
      console.warn('Could not render signature in certificate PDF:', e);
    }
  }

  // Signatory separator line (matching preview)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.6);
  doc.line(signatoryX - 26, footerY + 30.5, signatoryX + 26, footerY + 30.5);

  // Line 1: 'AUTHORIZED SIGNATORY'
  doc.setTextColor(12, 35, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('AUTHORIZED SIGNATORY', signatoryX, footerY + 36, { align: 'center' });

  // Line 2: Signatory Title
  const signTitle = cert.signatoryTitle || trust.presidentTitle || 'President / Managing Trustee';
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(signTitle, signatoryX, footerY + 40.5, { align: 'center' });

  // Line 3: Trust Name
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(trust.name || 'Nipania Vikash Seva Trust', signatoryX, footerY + 45, { align: 'center' });

  // 13. Footer Legal Note (Dignified at page bottom, safely 5mm inside the inner border)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official recognition document issued under Trust Registration No. ${regNo}  |  Authenticate at nipaniatrust.org/verify`,
    pageWidth / 2,
    191.5,
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
