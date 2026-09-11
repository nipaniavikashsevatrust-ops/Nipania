'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import {
  Award,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  QrCode as QrIcon,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface CertificateData {
  id: string;
  certificateNumber: string;
  certificateType: string;
  title: string;
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  description?: string | null;
  issueDate: string | Date;
  status: string;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
  verificationCode: string;
  verificationUrl?: string | null;
  revokedAt?: string | Date | null;
  revocationReason?: string | null;
  event?: { title: string } | null;
  project?: { title: string } | null;
}

export interface CertificateTrustSettings {
  name: string;
  tagline: string;
  pan: string;
  darpanId: string;
  registrationNumber: string;
  address: string;
  presidentName: string;
  presidentTitle: string;
  presidentSignature: string | null;
  presidentStamp: string | null;
}

const DEFAULT_SETTINGS: CertificateTrustSettings = {
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

export default function CertificateRenderer({
  certificate,
  showActions = true,
  customSettings,
}: {
  certificate: CertificateData;
  showActions?: boolean;
  customSettings?: Partial<CertificateTrustSettings>;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [settings, setSettings] = useState<CertificateTrustSettings>({
    ...DEFAULT_SETTINGS,
    ...customSettings,
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nipaniatrust.org';
  const verifyUrl = certificate.verificationUrl || `${origin}/verify/${certificate.certificateNumber}`;

  // Fetch settings from API if customSettings not provided
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setSettings((prev) => ({
            ...prev,
            name: data.settings.name || prev.name,
            tagline: data.settings.tagline || prev.tagline,
            pan: data.settings.pan || prev.pan,
            darpanId: data.settings.darpanId || prev.darpanId,
            registrationNumber: data.settings.registrationNumber || prev.registrationNumber,
            address: data.settings.address || prev.address,
            presidentName: data.settings.presidentName || prev.presidentName,
            presidentTitle: data.settings.presidentTitle || prev.presidentTitle,
            presidentSignature: data.settings.presidentSignature || prev.presidentSignature,
            presidentStamp: data.settings.presidentStamp || prev.presidentStamp,
          }));
        }
      })
      .catch((e) => console.error('Error fetching settings for certificate:', e));
  }, []);

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0C234C',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((e) => console.error('QR code generation error:', e));
  }, [verifyUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const targetId = certificate.id || certificate.certificateNumber;
      const downloadUrl = `/api/certificates/${encodeURIComponent(targetId)}/pdf?download=true`;

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${certificate.certificateNumber}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();

      // Delay revokeObjectURL so the browser download manager can read and save the file
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);
    } catch (err) {
      console.warn('Direct blob download failed, falling back to direct window open:', err);
      const targetId = certificate.id || certificate.certificateNumber;
      window.open(`/api/certificates/${encodeURIComponent(targetId)}/pdf?download=true`, '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Print Stylesheet for Single Certificate */}
      <style jsx global>{`
        @media print {
          @page {
            size: 297mm 210mm;
            margin: 0;
          }
          html, body {
            background: #FEFEFC !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .certificate-print-sheet,
          .certificate-print-sheet * {
            visibility: visible !important;
          }
          .certificate-print-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            min-width: 297mm !important;
            min-height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            box-sizing: border-box !important;
            border: 8px solid #0C234C !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #FEFEFC !important;
            z-index: 99999999 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Action Toolbar */}
      {showActions && (
        <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm no-print">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${certificate.status === 'ISSUED'
              ? 'bg-emerald-100 text-emerald-800'
              : certificate.status === 'REVOKED'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-700'
              }`}>
              Status: {certificate.status}
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold hidden sm:inline">
              {certificate.certificateNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Print official certificate (A4 Landscape)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print A4</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              type="button"
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-500 hover:to-amber-600 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Revocation Banner if applicable */}
      {certificate.status === 'REVOKED' && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs space-y-1 no-print">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>OFFICIAL NOTICE: THIS CERTIFICATE HAS BEEN REVOKED</span>
          </div>
          <p className="text-[11px] text-rose-700">
            Revoked On: {formatDate(certificate.revokedAt)} • Reason: &ldquo;{certificate.revocationReason || 'Administrative cancellation'}&rdquo;
          </p>
        </div>
      )}

      {/* A4 Landscape Printable Certificate Canvas */}
      <div className="w-full overflow-x-auto p-2 sm:p-4 bg-slate-100 rounded-3xl flex justify-center print:overflow-visible print:p-0 print:m-0 print:bg-transparent print:block">
        <div
          id={`cert-canvas-${certificate.certificateNumber}`}
          className="certificate-print-sheet relative bg-[#FEFEFC] w-[860px] min-w-[860px] h-[600px] p-6 rounded-2xl shadow-2xl border-[8px] border-[#0C234C] flex flex-col justify-between select-none overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Inner Golden Border */}
          <div className="absolute inset-3 border-2 border-[#C59B27] pointer-events-none rounded-lg" />
          <div className="absolute inset-4 border border-[#C59B27]/40 pointer-events-none rounded-md" />

          {/* Decorative Corner Seals */}
          <div className="absolute top-6 left-6 w-9 h-9 border-t-2 border-l-2 border-[#C59B27]" />
          <div className="absolute top-6 right-6 w-9 h-9 border-t-2 border-r-2 border-[#C59B27]" />
          <div className="absolute bottom-6 left-6 w-9 h-9 border-b-2 border-l-2 border-[#C59B27]" />
          <div className="absolute bottom-6 right-6 w-9 h-9 border-b-2 border-r-2 border-[#C59B27]" />

          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
            <Image src="/logo.png" alt="Watermark" width={340} height={340} className="object-contain" />
          </div>

          {/* 1. Header & Trust Identity (Grand & Prominent) */}
          <div className="text-center relative z-10 pt-1 px-4">
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white p-1 border-2 border-[#C59B27] shadow-md ring-2 ring-[#C59B27]/30 shrink-0">
                <Image src="/logo.png" alt="Trust Logo" fill className="object-contain p-0.5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-[30px] font-black font-heading text-[#0C234C] uppercase tracking-wider leading-tight">
                  {settings.name || 'NIPANIA VIKASH SEVA TRUST'}
                </h1>
                <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-[0.22em] mt-0.5">
                  REGISTERED PUBLIC CHARITABLE TRUST {settings.tagline ? `• ${settings.tagline}` : '• SEVA | VIKASH | SAMARPAN'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-2 text-[9px] font-semibold text-slate-600 mt-1 uppercase tracking-tight">
                  <span>Govt. Reg. No: {settings.registrationNumber || 'IV-120/2022'}</span>
                  <span className="text-[#C59B27]">•</span>
                  <span>PAN: {settings.pan || 'AAFTN4004N'}</span>
                  <span className="text-[#C59B27]">•</span>
                  <span>NGO Darpan ID: {settings.darpanId || 'UP/2021/0295112'}</span>
                </div>
                <p className="text-[8.5px] text-slate-500 font-medium tracking-tight mt-0.5">
                  {settings.address || 'NIPANIA, P.O. PARGHA, P.S. BALIAPUR, DISTRICT DHANBAD, JHARKHAND – 828201'}
                </p>
              </div>
            </div>

            {/* Majestic Ornate Dividing Rule */}
            <div className="relative flex items-center justify-center my-2">
              <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#C59B27] to-transparent w-4/5" />
              <div className="absolute px-2.5 bg-[#FEFEFC] text-[#C59B27] text-xs font-black">
                ♦ ❖ ♦
              </div>
            </div>
          </div>

          {/* 2. Certificate Award Spotlight */}
          <div className="text-center relative z-10 px-8 py-0.5 space-y-1.5">
            {/* Prestigious Category Ribbon */}
            <div className="inline-flex items-center gap-2 px-8 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-[#C59B27] shadow-xs">
              <span className="text-xs text-[#C59B27]">★</span>
              <span className="text-sm sm:text-base font-black uppercase tracking-[0.2em] text-[#0C234C]">
                {certificate.title || `CERTIFICATE OF ${certificate.certificateType.replace(/_/g, ' ')}`}
              </span>
              <span className="text-xs text-[#C59B27]">★</span>
            </div>

            <p className="text-xs sm:text-sm italic text-slate-600 font-serif pt-1">
              This certificate of honour is proudly presented to
            </p>

            {/* Recipient Name Spotlight */}
            <div className="py-0.5">
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#0C234C] tracking-wide uppercase">
                {certificate.recipientName}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#C59B27]" />
                <div className="text-[#C59B27] text-[10px]">❖</div>
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#C59B27]" />
              </div>
            </div>

            {/* Citation Body */}
            <p className="text-xs sm:text-[12.5px] text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
              {certificate.description ||
                'In recognition of valuable voluntary service, sincere dedication, and active participation towards the community development, social welfare, and humanitarian initiatives of the Trust.'}
            </p>

            {(certificate.event?.title || certificate.project?.title) && (
              <div className="inline-flex items-center gap-1.5 px-4 py-0.5 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-bold shadow-xs">
                <span className="text-amber-600">✦</span>
                <span>Program / Initiative: {certificate.event?.title || certificate.project?.title}</span>
              </div>
            )}
          </div>

          {/* 3. Footer Columns: Left Details, Center QR, Right Signatory */}
          <div className="relative z-10 px-8 pt-2.5 pb-2 border-t border-slate-200/90 flex items-end justify-between text-left">
            {/* Left: Certificate Metadata Card */}
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2.5 space-y-1 min-w-[200px]">
              <div>
                <span className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Certificate Number
                </span>
                <span className="block font-mono font-black text-[#0C234C] text-xs tracking-wider">
                  {certificate.certificateNumber}
                </span>
              </div>
              <div>
                <span className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Date of Issue
                </span>
                <span className="block font-semibold text-slate-800 text-xs">
                  {formatDate(certificate.issueDate)}
                </span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${certificate.status === 'ISSUED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : certificate.status === 'REVOKED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {certificate.status === 'ISSUED' ? 'OFFICIALLY ISSUED' : certificate.status}
                </span>
              </div>
            </div>

            {/* Center: Server-Verified QR Code with Scan Frame */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 bg-white p-1 rounded-xl border-2 border-[#C59B27]/70 shadow-sm flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Verification QR" className="w-full h-full object-contain" />
                ) : (
                  <QrIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <span className="text-[8.5px] font-black text-[#0C234C] uppercase tracking-wider mt-1">
                Scan to Verify Online
              </span>
              <span className="text-[7.5px] text-slate-500 font-mono">
                {certificate.verificationCode}
              </span>
              <span className="text-[7px] text-slate-400">
                Direct Central DB Verification
              </span>
            </div>

            {/* Right: Authorized Signatory & Official Stamp */}
            <div className="text-center space-y-1 w-60 relative">
              <div className="h-16 flex items-center justify-center relative">
                {/* Official Stamp enlarged overlapping under signature */}
                {settings.presidentStamp && (
                  <div className="absolute right-12 -top-5 w-24 h-24 pointer-events-none opacity-80 z-0">
                    <img
                      src={settings.presidentStamp}
                      alt="Official Seal"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {/* Official Signature enlarged layered over the official stamp */}
                {settings.presidentSignature ? (
                  <div className="w-44 h-16 relative z-10 flex items-center justify-center">
                    <img
                      src={settings.presidentSignature}
                      alt="President Signature"
                      className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs"
                    />
                  </div>
                ) : (
                  <span className="font-serif italic font-bold text-base text-[#0C234C] relative z-10">
                    {certificate.signatoryName || settings.presidentName || 'Managing Trustee'}
                  </span>
                )}
              </div>
              <div className="w-48 mx-auto h-[1.5px] bg-slate-400" />
              <span className="block text-[9.5px] font-black uppercase tracking-wider text-[#0C234C]">
                Authorized Signatory
              </span>
              <span className="block text-[8.5px] text-slate-600 font-medium">
                {certificate.signatoryTitle || settings.presidentTitle || 'President / Managing Trustee'}
              </span>
              <span className="block text-[8px] font-bold text-amber-800 uppercase">
                {settings.name || 'Nipania Vikash Seva Trust'}
              </span>
            </div>
          </div>

          {/* Legal Bottom Disclaimer Line */}
          <div className="text-center text-[7.5px] text-slate-400 relative z-10 -mb-1 pb-1">
            Official recognition document issued under Trust Registration No. {settings.registrationNumber || 'IV-120/2022'} • Authenticate at nipaniatrust.org/verify
          </div>
        </div>
      </div>
    </div>
  );
}
