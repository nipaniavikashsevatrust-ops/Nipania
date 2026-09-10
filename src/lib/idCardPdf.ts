import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export interface IdCardPdfData {
  cardNumber: string;
  fullName: string;
  role: string;
  personType: string;
  photoUrl?: string | null;
  issueDate: string | Date;
  validUntil: string | Date;
  status: string;
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

  // 1. Try local filesystem if it's a relative path in public/
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
    console.warn('Could not read local file:', err);
  }

  // 2. Try fetching remote URL with 3s timeout
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
      console.warn('Could not fetch remote image for PDF:', fetchErr);
    }
  }

  return null;
}

/**
 * Generates an official Single-Sided CR80 PVC Identity Card PDF buffer
 * Dimensions: 54mm x 85.6mm (CR80 Standard PVC Card Portrait)
 */
export async function generateIdCardPdf(cardData: IdCardPdfData): Promise<Buffer> {
  // Fetch trust settings for official headers & details
  let trustDetails = {
    name: 'NIPANIA VIKASH SEVA TRUST',
    regNumber: 'IV-120/2022',
    darpanId: 'NITI Aayog Darpan',
    presidentName: cardData.signatoryName || 'Managing Trustee',
    presidentTitle: cardData.signatoryTitle || 'President / Managing Trustee',
    phone: '+91 94311 23456',
    email: 'info@nipaniatrust.org',
    address: 'Nipania, Hunterganj, Chatra, Jharkhand - 825403',
  };

  try {
    const dbTrust = await prisma.trustDetail.findUnique({
      where: { id: 'trust-settings' },
    });
    if (dbTrust) {
      trustDetails = {
        name: dbTrust.name || trustDetails.name,
        regNumber: dbTrust.registrationNo || trustDetails.regNumber,
        darpanId: dbTrust.darpanId ? `Darpan: ${dbTrust.darpanId}` : trustDetails.darpanId,
        presidentName: cardData.signatoryName || dbTrust.presidentName || trustDetails.presidentName,
        presidentTitle: cardData.signatoryTitle || dbTrust.presidentTitle || trustDetails.presidentTitle,
        phone: dbTrust.phone || trustDetails.phone,
        email: dbTrust.email || trustDetails.email,
        address: dbTrust.registeredAddress || trustDetails.address,
      };
    }
  } catch (err) {
    console.warn('Could not fetch trust settings for PDF, using defaults:', err);
  }

  // Resolve images in parallel
  const [logoBase64, photoBase64, signatureBase64, stampBase64] = await Promise.all([
    resolveImageToBase64('/logo.png'),
    resolveImageToBase64(cardData.photoUrl),
    resolveImageToBase64(cardData.signatureUrl),
    resolveImageToBase64(cardData.stampUrl),
  ]);

  // Create CR80 standard vertical document: 54mm x 85.6mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [54, 85.6],
  });

  const cardW = 54;
  const cardH = 85.6;

  // 1. Base Card Surface & Outer Border
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(0.5, 0.5, cardW - 1, cardH - 1, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.35);
  doc.roundedRect(0.5, 0.5, cardW - 1, cardH - 1, 2, 2, 'D');

  // 2. Background Security Watermark
  doc.setTextColor(243, 244, 246);
  doc.setFontSize(4.2);
  doc.setFont('courier', 'bold');
  const watermarkText = 'NIPANIA VIKASH SEVA TRUST • OFFICIAL CREDENTIAL';
  try {
    doc.text(watermarkText, 27, 28, { align: 'center', angle: -25 });
    doc.text(watermarkText, 27, 38, { align: 'center', angle: -25 });
    doc.text(watermarkText, 27, 48, { align: 'center', angle: -25 });
    doc.text(watermarkText, 27, 58, { align: 'center', angle: -25 });
  } catch {
    // ignore
  }

  // 3. Royal Navy Header Banner
  doc.setFillColor(11, 25, 44); // Midnight Navy #0B192C
  doc.rect(0.5, 0.5, cardW - 1, 17.5, 'F');

  // Gold Divider Line
  doc.setDrawColor(197, 155, 39); // Gold #C59B27
  doc.setLineWidth(0.5);
  doc.line(0.5, 18, cardW - 0.5, 18);

  // Logo in Header (Circular white disc with gold ring)
  const logoX = 2.5;
  const logoY = 2.5;
  const logoSize = 10;
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.3);
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'D');

  if (logoBase64) {
    try {
      const format = logoBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(logoBase64, format, logoX + 0.8, logoY + 0.8, logoSize - 1.6, logoSize - 1.6);
    } catch (e) {
      console.warn('Could not add logo to PDF:', e);
    }
  }

  // Header Typography
  doc.setTextColor(253, 224, 71); // Gold 300
  doc.setFontSize(4.4);
  doc.setFont('helvetica', 'bold');
  doc.text('NIPANIA VIKASH SEVA TRUST', 33, 5.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3.6);
  doc.setFont('helvetica', 'normal');
  doc.text('SEVA • VIKASH • SAMARPAN', 33, 8.5, { align: 'center' });

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(3.0);
  doc.text(`Govt. Regd: ${trustDetails.regNumber} | Darpan`, 33, 11.5, { align: 'center' });

  // Role Category Ribbon
  const isVolunteer = cardData.personType?.toUpperCase() === 'VOLUNTEER';
  const isTrustee = cardData.personType?.toUpperCase() === 'TRUSTEE' || cardData.personType?.toUpperCase() === 'BOARD';
  const ribbonColor = isVolunteer ? [16, 185, 129] : isTrustee ? [217, 119, 6] : [197, 155, 39]; // Emerald, Amber, or Gold
  
  doc.setFillColor(ribbonColor[0], ribbonColor[1], ribbonColor[2]);
  doc.rect(0.5, 14, cardW - 1, 3.8, 'F');
  
  doc.setTextColor(isVolunteer || !isTrustee ? 255 : 11, isVolunteer || !isTrustee ? 255 : 25, isVolunteer || !isTrustee ? 255 : 44);
  doc.setFontSize(4.4);
  doc.setFont('helvetica', 'bold');
  const roleTag = isVolunteer ? 'SEVA VOLUNTEER CORPS' : isTrustee ? 'BOARD OF TRUSTEES' : 'OFFICIAL TRUST MEMBER';
  doc.text(roleTag, 27, 16.6, { align: 'center' });

  // 4. Passport Photograph Frame
  const photoX = 18.5;
  const photoY = 19.5;
  const photoW = 17;
  const photoH = 21.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(photoX, photoY, photoW, photoH, 'F');
  doc.setDrawColor(197, 155, 39); // Gold border
  doc.setLineWidth(0.4);
  doc.rect(photoX, photoY, photoW, photoH, 'D');

  if (photoBase64) {
    try {
      const format = photoBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(photoBase64, format, photoX, photoY, photoW, photoH);
    } catch {
      // Draw silhouette if corrupted
      doc.setFillColor(203, 213, 225);
      doc.circle(photoX + photoW / 2, photoY + 8, 4, 'F');
      doc.ellipse(photoX + photoW / 2, photoY + 18, 6, 4, 'F');
    }
  } else {
    // Draw silhouette
    doc.setFillColor(203, 213, 225);
    doc.circle(photoX + photoW / 2, photoY + 8, 4, 'F');
    doc.ellipse(photoX + photoW / 2, photoY + 18, 6, 4, 'F');
  }

  // Verified Green Badge on corner of photo
  doc.setFillColor(16, 185, 129);
  doc.circle(photoX + photoW - 1.5, photoY + photoH - 1.5, 1.8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3.2);
  doc.setFont('helvetica', 'bold');
  doc.text('v', photoX + photoW - 1.5, photoY + photoH - 0.7, { align: 'center' });

  // 5. Cardholder Name & Role
  doc.setTextColor(11, 25, 44);
  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  const formattedName = (cardData.fullName || 'Cardholder').toUpperCase();
  doc.text(formattedName, 27, 44.5, { align: 'center', maxWidth: 48 });

  doc.setTextColor(180, 83, 9); // Amber 700
  doc.setFontSize(4.6);
  doc.setFont('helvetica', 'bold');
  doc.text((cardData.role || cardData.personType).toUpperCase(), 27, 47.5, { align: 'center', maxWidth: 48 });

  // 6. Structured Credentials Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(3.5, 49.5, 47, 10.5, 1, 1, 'FD');

  // Column 1: Card ID
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(3.2);
  doc.setFont('helvetica', 'normal');
  doc.text('CARD ID', 10, 52.5, { align: 'center' });
  doc.setTextColor(11, 25, 44);
  doc.setFontSize(4.2);
  doc.setFont('courier', 'bold');
  doc.text(cardData.cardNumber, 10, 56.5, { align: 'center' });

  // Column 2: Issue Date
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(3.2);
  doc.setFont('helvetica', 'normal');
  doc.text('ISSUE DATE', 27, 52.5, { align: 'center' });
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(4.0);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(cardData.issueDate), 27, 56.5, { align: 'center' });

  // Column 3: Valid Until
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(3.2);
  doc.setFont('helvetica', 'normal');
  doc.text('VALID UNTIL', 43, 52.5, { align: 'center' });
  doc.setTextColor(16, 185, 129); // Emerald
  doc.setFontSize(4.0);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(cardData.validUntil), 43, 56.5, { align: 'center' });

  // 7. Verification Row: QR Code + Signature + Official Stamp
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(3.5, 61.5, 50.5, 61.5);

  // 7a. QR Code
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nipaniatrust.org'}/verify/${cardData.cardNumber}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#0B192C', light: '#FFFFFF' },
    });
    doc.addImage(qrDataUrl, 'PNG', 4, 62.5, 12, 12);
  } catch (qrErr) {
    console.error('QR code generation error in PDF:', qrErr);
  }
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(3.0);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN TO VERIFY', 10, 76, { align: 'center' });

  // 7b. Authorized Signatory
  if (signatureBase64) {
    try {
      const format = signatureBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(signatureBase64, format, 20, 63, 14, 6);
    } catch {
      doc.setTextColor(11, 25, 44);
      doc.setFontSize(5);
      doc.setFont('times', 'italic');
      doc.text(trustDetails.presidentName, 27, 67.5, { align: 'center' });
    }
  } else {
    doc.setTextColor(11, 25, 44);
    doc.setFontSize(5);
    doc.setFont('times', 'italic');
    doc.text(trustDetails.presidentName, 27, 67.5, { align: 'center' });
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(19, 69.5, 35, 69.5);

  doc.setTextColor(11, 25, 44);
  doc.setFontSize(3.6);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory', 27, 72, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(2.8);
  doc.setFont('helvetica', 'normal');
  doc.text(trustDetails.presidentTitle, 27, 74.2, { align: 'center' });

  // 7c. Official Circular Stamp
  const stampCenterX = 43.5;
  const stampCenterY = 68.5;
  if (stampBase64) {
    try {
      const format = stampBase64.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(stampBase64, format, stampCenterX - 5.5, stampCenterY - 5.5, 11, 11);
    } catch {
      // Fallback circular stamp
      drawOfficialStamp(doc, stampCenterX, stampCenterY);
    }
  } else {
    drawOfficialStamp(doc, stampCenterX, stampCenterY);
  }

  // 8. Bottom Footer
  doc.setFillColor(241, 245, 249);
  doc.rect(0.5, 78.5, cardW - 1, 6.6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(0.5, 78.5, cardW - 0.5, 78.5);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(3.0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Phone: ${trustDetails.phone}  •  ${trustDetails.email}`, 27, 80.8, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(2.6);
  doc.setFont('helvetica', 'normal');
  doc.text(trustDetails.address, 27, 82.6, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(2.3);
  doc.text('Official Credential • Property of Trust • Return if found', 27, 84.4, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

function drawOfficialStamp(doc: jsPDF, cx: number, cy: number) {
  doc.setDrawColor(190, 24, 93); // Crimson/Rose stamp ink
  doc.setLineWidth(0.35);
  doc.circle(cx, cy, 5.5, 'D');
  doc.setLineWidth(0.15);
  doc.circle(cx, cy, 4.4, 'D');

  doc.setTextColor(159, 18, 57);
  doc.setFontSize(3.0);
  doc.setFont('helvetica', 'bold');
  doc.text('NVS TRUST', cx, cy - 1.2, { align: 'center' });
  doc.setFontSize(3.6);
  doc.text('SEAL', cx, cy + 1.2, { align: 'center' });
  doc.setFontSize(2.4);
  doc.text('VERIFIED', cx, cy + 3.2, { align: 'center' });
}
