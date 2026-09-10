'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Printer, 
  CheckCircle2, 
  Phone, 
  Mail, 
  QrCode as QrIcon,
  BadgeCheck,
  Download,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface IdCardData {
  cardNumber: string;
  fullName: string;
  role: string;
  personType: string;
  photoUrl?: string | null;
  issueDate: string | Date;
  validUntil: string | Date;
  status: string;
  remarks?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
  bloodGroup?: string | null;
  mobile?: string | null;
  emergencyContact?: string | null;
}

export default function IdCardRenderer({ card }: { card: IdCardData }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [presidentDetails, setPresidentDetails] = useState<{
    name: string;
    title: string;
    signatureUrl: string | null;
    stampUrl: string | null;
    trustAddress?: string;
    trustPhone?: string;
    trustEmail?: string;
    regNumber?: string;
  }>({
    name: card.signatoryName || 'Managing Trustee',
    title: card.signatoryTitle || 'President / Managing Trustee',
    signatureUrl: card.signatureUrl || null,
    stampUrl: card.stampUrl || null,
    trustAddress: 'Nipania, Hunterganj, Chatra, Jharkhand - 825403',
    trustPhone: '+91 94311 23456',
    trustEmail: 'info@nipaniatrust.org',
    regNumber: 'IV-120/2022',
  });

  const defaultPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
  const [photoSrc, setPhotoSrc] = useState<string>(card.photoUrl || defaultPhoto);

  useEffect(() => {
    setPhotoSrc(card.photoUrl || defaultPhoto);
  }, [card.photoUrl]);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nipaniatrust.org';
    const verifyUrl = `${origin}/verify/${card.cardNumber}`;

    QRCode.toDataURL(verifyUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0B192C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setPresidentDetails((prev) => ({
            ...prev,
            name: card.signatoryName || data.settings.presidentName || prev.name,
            title: card.signatoryTitle || data.settings.presidentTitle || prev.title,
            signatureUrl: card.signatureUrl || data.settings.presidentSignature || prev.signatureUrl,
            stampUrl: card.stampUrl || data.settings.presidentStamp || prev.stampUrl,
            trustAddress: data.settings.address || prev.trustAddress,
            trustPhone: data.settings.phone || prev.trustPhone,
            trustEmail: data.settings.email || prev.trustEmail,
            regNumber: data.settings.registrationNumber || prev.regNumber,
          }));
        }
      })
      .catch((e) => console.error('Error fetching trust settings:', e));
  }, [card.cardNumber, card.signatoryName, card.signatoryTitle, card.signatureUrl, card.stampUrl]);

  // Client-Side Pixel-Perfect PDF Export (100% Identical to Preview Card)
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const cardEl = document.getElementById(`pvc-card-${card.cardNumber}`);
      if (!cardEl) return;

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(cardEl, {
        scale: 3, // Ultra-high resolution 300+ DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Hide any no-print guides (such as lanyard cutout guide)
          const noPrintNodes = clonedDoc.querySelectorAll('.no-print');
          noPrintNodes.forEach((node) => {
            (node as HTMLElement).style.display = 'none';
          });

          const clonedCard = clonedDoc.getElementById(`pvc-card-${card.cardNumber}`);
          if (clonedCard) {
            // Remove box-shadow so canvas capture doesn't create outer shadow blurring
            clonedCard.style.boxShadow = 'none';
            // Ensure no text elements clip descenders in canvas rendering
            const textNodes = clonedCard.querySelectorAll('p, span, h2, h3, div');
            textNodes.forEach((node) => {
              const el = node as HTMLElement;
              if (
                !el.classList.contains('rounded-2xl') && 
                !el.classList.contains('rounded-3xl') && 
                !el.classList.contains('rounded-full') && 
                !el.classList.contains('rounded-xl')
              ) {
                el.style.overflow = 'visible';
                el.style.textOverflow = 'clip';
              }
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Standard CR80 PVC width is 54mm; calculate proportional height
      const mmWidth = 54;
      const mmHeight = (canvas.height / canvas.width) * mmWidth;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [mmWidth, mmHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
      pdf.save(`${card.cardNumber}_Identity_Card.pdf`);
    } catch (err) {
      console.error('Error generating client-side PDF:', err);
      // Fallback to server endpoint
      window.open(`/api/id-cards/${card.cardNumber}/pdf`, '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Role Color Customization
  const getRoleTheme = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TRUSTEE':
      case 'BOARD':
        return {
          badgeBg: 'bg-amber-500 text-navy-950 border-amber-400 font-black',
          bannerBg: 'bg-gradient-to-r from-amber-600 via-gold-500 to-amber-600 text-navy-950',
          bannerTag: 'BOARD OF TRUSTEES',
        };
      case 'VOLUNTEER':
        return {
          badgeBg: 'bg-emerald-600 text-white border-emerald-500',
          bannerBg: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white',
          bannerTag: 'SEVA VOLUNTEER CORPS',
        };
      case 'MEMBER':
        return {
          badgeBg: 'bg-gold-600 text-white border-gold-500',
          bannerBg: 'bg-gradient-to-r from-amber-700 via-gold-600 to-amber-700 text-white',
          bannerTag: 'OFFICIAL TRUST MEMBER',
        };
      default: // STAFF
        return {
          badgeBg: 'bg-navy-900 text-gold-400 border-navy-800',
          bannerBg: 'bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-gold-300',
          bannerTag: 'ADMINISTRATIVE STAFF',
        };
    }
  };

  const roleTheme = getRoleTheme(card.personType || card.role);

  return (
    <div className="space-y-4">
      
      {/* Action Toolbar (No-Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official PVC Identity Credential</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pixel-Perfect PDF Download */}
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-950 text-white hover:bg-navy-900 shadow-md transition-all active:scale-98 disabled:opacity-60"
            title="Download PDF exactly as previewed"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-gold-400 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-gold-400" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Direct Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-navy-950 transition-all active:scale-98"
            title="Print Card"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* SINGLE-SIDED OFFICIAL CR80 PVC IDENTITY CARD */}
      <div className="printable-area flex justify-center py-2">
        <div 
          id={`pvc-card-${card.cardNumber}`}
          className="relative w-[360px] min-h-[590px] bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-300 flex flex-col justify-between shrink-0 select-none print:shadow-none print:border-slate-400 print:m-0 print:break-inside-avoid"
        >
          
          {/* ------------------------------------------------------------- */}
          {/* HIGH-SECURITY WATERMARK LAYER (BACKGROUND ONLY)              */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
            
            {/* 1. Fine Security Guilloche Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#c59b27_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-15" />

            {/* 2. Repeating Diagonal Security Watermark Text Bands */}
            <div className="absolute -inset-16 flex flex-col justify-around rotate-[-28deg] opacity-[0.055] font-mono text-[8px] font-black tracking-widest text-navy-950 uppercase leading-loose">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="whitespace-nowrap">
                  NIPANIA VIKASH SEVA TRUST • OFFICIAL CREDENTIAL • SECURE IDENTITY • REGD IV-120/2022 • NITI AAYOG DARPAN • 
                  NIPANIA VIKASH SEVA TRUST • OFFICIAL CREDENTIAL • SECURE IDENTITY • REGD IV-120/2022 • NITI AAYOG DARPAN •
                </div>
              ))}
            </div>

            {/* 3. Central Official Trust Seal Watermark Emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 opacity-[0.11] flex items-center justify-center">
                <img
                  src={presidentDetails.stampUrl || '/logo.png'}
                  alt="Official Trust Seal Watermark"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 1. CARD TOP: LANYARD HOLE & ROYAL BILINGUAL HEADER       */}
          {/* ======================================================== */}
          <div className="relative z-10">
            {/* Lanyard Cutout Guide (No-Print) */}
            <div className="pt-2 pb-1 flex justify-center no-print">
              <div className="w-14 h-2.5 rounded-full border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center">
                <div className="w-3 h-0.5 rounded-full bg-slate-300" />
              </div>
            </div>

            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white px-4 py-2.5 border-y-2 border-gold-500/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-gold-400 shadow-md shrink-0 ring-1 ring-gold-400/50">
                  <Image src="/logo.png" alt="Trust Logo" fill className="object-contain" priority />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <span className="block text-[10px] font-bold text-gold-300 tracking-normal leading-normal">
                    निपनिया विकास सेवा ट्रस्ट
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-tight font-heading leading-normal text-white">
                    Nipania Vikash Seva Trust
                  </h3>
                  <p className="text-[8.5px] text-slate-300 leading-normal">
                    Govt. Regd: {presidentDetails.regNumber} • NITI Aayog Darpan
                  </p>
                  <p className="text-[8px] font-bold text-gold-400 uppercase tracking-wider leading-normal">
                    Seva • Vikash • Samarpan
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-strip: Category Designation Ribbon */}
            <div className={`px-4 py-1.5 ${roleTheme.bannerBg} flex items-center justify-between border-b border-gold-400/40 shadow-xs`}>
              <span className="text-[9px] font-black uppercase tracking-wider leading-normal">
                {roleTheme.bannerTag}
              </span>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide leading-normal">
                <BadgeCheck className="w-3.5 h-3.5 text-current shrink-0" />
                <span>Official ID Card</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. CARD MIDDLE: PHOTO, NAME & CREDENTIALS                */}
          {/* ======================================================== */}
          <div className="px-5 py-3 flex-1 flex flex-col justify-between space-y-3 relative z-10">
            
            {/* Centered Passport Photo Frame */}
            <div className="flex justify-center pt-0.5">
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-gold-500 shadow-md bg-slate-100 shrink-0 ring-2 ring-white">
                <img
                  src={photoSrc}
                  alt={card.fullName}
                  crossOrigin="anonymous"
                  onError={() => setPhotoSrc(defaultPhoto)}
                  className="w-full h-full object-cover"
                />

                {/* Official Verified Corner Badge */}
                <div className="absolute bottom-1.5 right-1.5 p-0.5 rounded-full bg-emerald-600 text-white shadow-sm ring-2 ring-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Name, Role & Status Pills */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-black font-heading text-navy-950 uppercase tracking-tight leading-normal">
                {card.fullName}
              </h2>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide leading-normal">
                {card.role}
              </p>
              <div className="pt-0.5 flex items-center justify-center gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${roleTheme.badgeBg} leading-normal`}>
                  {card.personType}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 leading-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  {card.status}
                </span>
              </div>
            </div>

            {/* Structured Credentials Grid */}
            <div className="bg-slate-50/90 backdrop-blur-xs rounded-xl px-2.5 py-2 border border-slate-200 text-xs grid grid-cols-3 gap-2 shadow-xs text-center">
              <div>
                <span className="block text-[7.5px] font-bold text-slate-500 uppercase tracking-wider leading-normal">
                  Card ID
                </span>
                <span className="block font-mono text-[10px] font-black text-navy-950 leading-normal tracking-tight">
                  {card.cardNumber}
                </span>
              </div>
              <div>
                <span className="block text-[7.5px] font-bold text-slate-500 uppercase tracking-wider leading-normal">
                  Issue Date
                </span>
                <span className="block text-[9.5px] font-semibold text-slate-800 leading-normal">
                  {formatDate(card.issueDate)}
                </span>
              </div>
              <div>
                <span className="block text-[7.5px] font-bold text-slate-500 uppercase tracking-wider leading-normal">
                  Valid Until
                </span>
                <span className="block text-[9.5px] font-bold text-emerald-700 leading-normal">
                  {formatDate(card.validUntil)}
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. VERIFICATION QR CODE + SIGNATURE + STAMP ROW          */}
            {/* ======================================================== */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 relative">
              
              {/* QR Code Column */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR ${card.cardNumber}`}
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <span className="text-[6.5px] font-black text-slate-600 uppercase tracking-wider mt-1 leading-normal">
                  Scan to Verify
                </span>
              </div>

              {/* Authorized Signatory Column */}
              <div className="flex-1 text-center space-y-0.5 min-w-0">
                <div className="h-8 w-full relative flex items-center justify-center">
                  {presidentDetails.signatureUrl ? (
                    <img
                      src={presidentDetails.signatureUrl}
                      alt="Authorized Signature"
                      crossOrigin="anonymous"
                      className="max-h-full max-w-[100px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-navy-950 text-xs font-bold leading-normal">
                      {presidentDetails.name}
                    </span>
                  )}
                </div>
                <div className="w-20 mx-auto h-px bg-slate-400 my-0.5" />
                <span className="block text-[8px] font-black uppercase tracking-wider text-navy-950 leading-normal">
                  Authorized Signatory
                </span>
                <span className="block text-[7px] text-slate-600 font-medium leading-normal">
                  {presidentDetails.title}
                </span>
              </div>

              {/* Official Trust Seal Stamp Column */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-14 h-14 flex items-center justify-center transform -rotate-6 select-none">
                  {presidentDetails.stampUrl ? (
                    <img
                      src={presidentDetails.stampUrl}
                      alt="Official Seal Stamp"
                      crossOrigin="anonymous"
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    /* High-Definition SVG Official Rubber Stamp */
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-rose-700/90 bg-rose-50/60 p-0.5 flex flex-col items-center justify-center text-center shadow-xs">
                      <div className="w-full h-full rounded-full border border-rose-700/60 flex flex-col items-center justify-center p-0.5">
                        <span className="block text-[5.5px] font-black uppercase text-rose-800 tracking-tighter leading-none">
                          ★ NVS TRUST ★
                        </span>
                        <span className="block text-[7px] font-black uppercase text-rose-900 tracking-tight leading-tight my-0.5">
                          OFFICIAL SEAL
                        </span>
                        <span className="block text-[5px] font-bold text-rose-700 leading-none">
                          REGD. IV-120
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ======================================================== */}
          {/* 4. CARD BOTTOM: CONTACT & HELPLINE FOOTER                */}
          {/* ======================================================== */}
          <div className="relative z-10 bg-slate-100 px-3 py-2 border-t border-slate-200 text-center space-y-0.5 text-[7.5px] text-slate-600">
            <div className="flex items-center justify-center gap-3 text-navy-950 font-bold leading-normal">
              <span className="flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-gold-600 shrink-0" />
                {presidentDetails.trustPhone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-2.5 h-2.5 text-gold-600 shrink-0" />
                {presidentDetails.trustEmail}
              </span>
            </div>
            <p className="text-[7.5px] text-slate-600 leading-normal">
              {presidentDetails.trustAddress}
            </p>
            <p className="text-[6.5px] text-slate-400 uppercase tracking-tight leading-normal">
              Official Credential • Property of Trust • Return if found
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
