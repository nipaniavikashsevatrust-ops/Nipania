'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  X, 
  CheckSquare, 
  Square, 
  Layers, 
  Loader2,
  Award,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  FileCheck,
  Eye
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CertificateData, CertificateTrustSettings } from './CertificateRenderer';

interface BulkCertificatePrintProps {
  certificates: CertificateData[];
  isOpen: boolean;
  onClose: () => void;
  initialSelectedIds?: string[];
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

export default function BulkCertificatePrint({
  certificates,
  isOpen,
  onClose,
  initialSelectedIds,
}: BulkCertificatePrintProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasUserDeselectedAll, setHasUserDeselectedAll] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'ALL' | 'SINGLE'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<CertificateTrustSettings>(DEFAULT_SETTINGS);

  // Initialize selected IDs whenever modal opens or certificates change
  useEffect(() => {
    if (isOpen) {
      setHasUserDeselectedAll(false);
      if (initialSelectedIds && initialSelectedIds.length > 0) {
        setSelectedIds(initialSelectedIds);
      } else if (certificates && certificates.length > 0) {
        setSelectedIds(certificates.map((c) => c.id));
      }
    }
  }, [isOpen, certificates, initialSelectedIds]);

  // Fetch live Trust settings
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
      .catch((e) => console.error('Error fetching settings for bulk cert print:', e));
  }, []);

  // Pre-generate QR codes for certificates
  useEffect(() => {
    if (!isOpen || certificates.length === 0) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nipaniatrust.org';

    const generateAllQr = async () => {
      const map: Record<string, string> = {};
      for (const cert of certificates) {
        try {
          const verifyUrl = cert.verificationUrl || `${origin}/verify/${cert.certificateNumber}`;
          const url = await QRCode.toDataURL(verifyUrl, {
            width: 180,
            margin: 1,
            color: { dark: '#0C234C', light: '#FFFFFF' },
          });
          map[cert.id] = url;
          map[cert.certificateNumber] = url;
        } catch (e) {
          console.error(`QR gen error for cert ${cert.certificateNumber}:`, e);
        }
      }
      setQrMap(map);
    };

    generateAllQr();
  }, [isOpen, certificates]);

  if (!isOpen) return null;

  // Resilient selection fallback: if user hasn't explicitly cleared selection, ensure certificates show
  const effectiveSelectedIds =
    selectedIds.length > 0
      ? selectedIds
      : hasUserDeselectedAll
        ? []
        : (initialSelectedIds && initialSelectedIds.length > 0
            ? initialSelectedIds
            : (certificates || []).map((c) => c.id));

  const activeCerts = (certificates || []).filter((c) =>
    effectiveSelectedIds.includes(c.id)
  );

  const filteredCerts = (certificates || []).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.recipientName.toLowerCase().includes(q) ||
      c.certificateNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === certificates.length) {
      setSelectedIds([]);
      setHasUserDeselectedAll(true);
    } else {
      setSelectedIds(certificates.map((c) => c.id));
      setHasUserDeselectedAll(false);
    }
  };

  const toggleCert = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (next.length === 0) setHasUserDeselectedAll(true);
      return next;
    });
  };

  // Direct Browser Print (A4 Landscape)
  const handlePrint = () => {
    if (viewMode === 'SINGLE') {
      // Switch to ALL mode so all selected certificates are rendered in the DOM for printing
      setViewMode('ALL');
      setTimeout(() => {
        window.print();
      }, 200);
    } else {
      window.print();
    }
  };

  // Download Multi-Page PDF
  const handleDownloadBulkPdf = async () => {
    const targetIds = effectiveSelectedIds.length > 0 ? effectiveSelectedIds : selectedIds;
    if (targetIds.length === 0) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/certificates/bulk-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate multi-page PDF');
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Nipania_Trust_Certificates_${targetIds.length}_Pages.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading bulk certificate PDF:', err);
      // Fallback: trigger print dialog
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const displayedCerts = viewMode === 'SINGLE' 
    ? (activeCerts[currentPage] ? [activeCerts[currentPage]] : []) 
    : activeCerts;

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex flex-col overflow-hidden print:static print:inset-auto print:z-auto print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:p-0 print:m-0"
    >
      
      {/* Print Stylesheet for Multi-Page Landscape Certificate Sheets */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          html, body {
            background: #FEFEFC !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .bulk-cert-container {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            overflow: visible !important;
            display: block !important;
          }
          .bulk-cert-a4-sheet {
            visibility: visible !important;
            display: flex !important;
            width: 297mm !important;
            height: 210mm !important;
            min-width: 297mm !important;
            max-width: 297mm !important;
            min-height: 210mm !important;
            max-height: 210mm !important;
            margin: 0 auto !important;
            padding: 24px 32px !important;
            box-shadow: none !important;
            border: 8px solid #0C234C !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bulk-cert-a4-sheet * {
            visibility: visible !important;
          }
        }
      `}</style>

      {/* Top Toolbar */}
      <div className="no-print bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md shrink-0">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600">
            <Award className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <span>Bulk Certificate Print &amp; Multi-Page PDF Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-900 font-mono font-bold">
                A4 Landscape
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {activeCerts.length} certificate{activeCerts.length !== 1 ? 's' : ''} selected across {activeCerts.length} page{activeCerts.length !== 1 ? 's' : ''} • {settings.name}
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Select All Toggle */}
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {selectedIds.length === certificates.length ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Select All ({certificates.length})</span>
              </>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('ALL')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                viewMode === 'ALL'
                  ? 'bg-navy-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              All Pages ({activeCerts.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('SINGLE')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                viewMode === 'SINGLE'
                  ? 'bg-navy-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Single Page
            </button>
          </div>

          {/* Single Page Pagination if in SINGLE view */}
          {viewMode === 'SINGLE' && activeCerts.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="p-1 rounded hover:bg-white text-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-navy-950 text-[11px]">
                {currentPage + 1} / {activeCerts.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(activeCerts.length - 1, prev + 1))}
                disabled={currentPage >= activeCerts.length - 1}
                className="p-1 rounded hover:bg-white text-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Print A4 Landscape Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={activeCerts.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" />
            <span>Print All ({activeCerts.length} A4 Pages)</span>
          </button>

          {/* Download Multi-Page PDF Button */}
          <button
            type="button"
            onClick={handleDownloadBulkPdf}
            disabled={isDownloadingPdf || activeCerts.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gold-600 hover:bg-gold-700 text-white shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting Multi-Page PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Multi-Page PDF ({activeCerts.length})</span>
              </>
            )}
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

      </div>

      {/* Main Studio Area: Left Certificate List + Right A4 Canvas */}
      <div className="flex-1 flex overflow-hidden print:block print:overflow-visible print:p-0 print:m-0">
        
        {/* Left Certificate Selector Tray */}
        <div className="no-print w-72 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-3 shrink-0 hidden md:block admin-modal-scroll">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipient or cert no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Select Certificates:</span>
              <span className="text-gold-700 font-mono font-bold">
                {activeCerts.length} of {certificates.length}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {filteredCerts.map((cert, index) => {
              const isChecked = selectedIds.includes(cert.id);
              return (
                <div
                  key={cert.id}
                  onClick={() => {
                    toggleCert(cert.id);
                    if (viewMode === 'SINGLE') {
                      const idx = activeCerts.findIndex((c) => c.id === cert.id);
                      if (idx !== -1) setCurrentPage(idx);
                    }
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center gap-2.5 transition-all ${
                    isChecked
                      ? 'bg-white border-gold-400 shadow-xs ring-1 ring-gold-400/40'
                      : 'bg-slate-100/70 border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 pointer-events-none"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy-950 truncate leading-tight">{cert.recipientName}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate leading-tight">{cert.certificateNumber}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        cert.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {cert.status}
                      </span>
                      <span className="text-[9px] text-amber-800 truncate">
                        {cert.title || cert.certificateType}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Canvas: Rendered A4 Printable Pages */}
        <div className="bulk-cert-container flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200/80 flex flex-col items-center space-y-8 admin-modal-scroll print:p-0 print:m-0 print:bg-transparent print:block print:overflow-visible print:space-y-0">
          
          {displayedCerts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center space-y-3 max-w-md shadow-md my-auto">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-navy-950">No Certificates Selected</p>
              <p className="text-xs text-slate-500">
                Please select at least one certificate from the left tray to render the printable A4 landscape pages.
              </p>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white cursor-pointer"
              >
                Select All Certificates
              </button>
            </div>
          ) : (
            displayedCerts.map((cert, pageIdx) => {
              const qrUrl = qrMap[cert.id] || qrMap[cert.certificateNumber];

              return (
                <div
                  key={cert.id}
                  id={`bulk-cert-page-${cert.id}`}
                  className="bulk-cert-a4-sheet relative bg-[#FEFEFC] w-[860px] min-w-[860px] h-[600px] p-6 rounded-2xl shadow-2xl border-[8px] border-[#0C234C] flex flex-col justify-between select-none mx-auto print:border-[8px] print:border-[#0C234C] print:shadow-none print:rounded-none overflow-hidden"
                  style={{
                    boxSizing: 'border-box',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    pageBreakAfter: 'always',
                    breakAfter: 'page',
                  }}
                >
                  {/* Inner Golden Double Border */}
                  <div className="absolute inset-3 border-2 border-[#C59B27] pointer-events-none rounded-lg" />
                  <div className="absolute inset-4 border border-[#C59B27]/40 pointer-events-none rounded-md" />

                  {/* Corner Ornaments */}
                  <div className="absolute top-6 left-6 w-9 h-9 border-t-2 border-l-2 border-[#C59B27]" />
                  <div className="absolute top-6 right-6 w-9 h-9 border-t-2 border-r-2 border-[#C59B27]" />
                  <div className="absolute bottom-6 left-6 w-9 h-9 border-b-2 border-l-2 border-[#C59B27]" />
                  <div className="absolute bottom-6 right-6 w-9 h-9 border-b-2 border-r-2 border-[#C59B27]" />

                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                    <Image src="/logo.png" alt="Watermark" width={340} height={340} className="object-contain" />
                  </div>

                  {/* Page indicator (no-print) */}
                  <div className="no-print absolute top-2 right-4 text-[10px] font-mono font-bold text-slate-400">
                    Page {viewMode === 'SINGLE' ? currentPage + 1 : pageIdx + 1} of {activeCerts.length}
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
                        {cert.title || `CERTIFICATE OF ${cert.certificateType.replace(/_/g, ' ')}`}
                      </span>
                      <span className="text-xs text-[#C59B27]">★</span>
                    </div>

                    <p className="text-xs sm:text-sm italic text-slate-600 font-serif pt-1">
                      This certificate of honour is proudly presented to
                    </p>

                    {/* Recipient Name Spotlight */}
                    <div className="py-0.5">
                      <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#0C234C] tracking-wide uppercase">
                        {cert.recipientName}
                      </h2>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#C59B27]" />
                        <div className="text-[#C59B27] text-[10px]">❖</div>
                        <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#C59B27]" />
                      </div>
                    </div>

                    {/* Citation Body */}
                    <p className="text-xs sm:text-[12.5px] text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
                      {cert.description ||
                        'In recognition of valuable voluntary service, sincere dedication, and active participation towards the community development, social welfare, and humanitarian initiatives of the Trust.'}
                    </p>

                    {(cert.event?.title || cert.project?.title) && (
                      <div className="inline-flex items-center gap-1.5 px-4 py-0.5 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-bold shadow-xs">
                        <span className="text-amber-600">✦</span>
                        <span>Program / Initiative: {cert.event?.title || cert.project?.title}</span>
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
                          {cert.certificateNumber}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                          Date of Issue
                        </span>
                        <span className="block font-semibold text-slate-800 text-xs">
                          {formatDate(cert.issueDate)}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          cert.status === 'ISSUED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : cert.status === 'REVOKED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {cert.status === 'ISSUED' ? 'OFFICIALLY ISSUED' : cert.status}
                        </span>
                      </div>
                    </div>

                    {/* Center: Server-Verified QR Code with Scan Frame */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-20 h-20 bg-white p-1 rounded-xl border-2 border-[#C59B27]/70 shadow-sm flex items-center justify-center">
                        {qrUrl ? (
                          <img src={qrUrl} alt="Verification QR" className="w-full h-full object-contain" />
                        ) : (
                          <Award className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <span className="text-[8.5px] font-black text-[#0C234C] uppercase tracking-wider mt-1">
                        Scan to Verify Online
                      </span>
                      <span className="text-[7.5px] text-slate-500 font-mono">
                        {cert.verificationCode}
                      </span>
                      <span className="text-[7px] text-slate-400">
                        Direct Central DB Verification
                      </span>
                    </div>

                    {/* Right: Authorized Signatory & Official Stamp */}
                    <div className="text-center space-y-1 w-60 relative">
                      <div className="h-16 flex items-center justify-center relative">
                        {/* Stamp enlarged overlapping under signature */}
                        {settings.presidentStamp && (
                          <div className="absolute right-12 -top-5 w-24 h-24 pointer-events-none opacity-80 z-0">
                            <img
                              src={settings.presidentStamp}
                              alt="Official Seal"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        {/* Signature enlarged layered over official stamp */}
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
                            {cert.signatoryName || settings.presidentName || 'Managing Trustee'}
                          </span>
                        )}
                      </div>
                      <div className="w-48 mx-auto h-[1.5px] bg-slate-400" />
                      <span className="block text-[9.5px] font-black uppercase tracking-wider text-[#0C234C]">
                        Authorized Signatory
                      </span>
                      <span className="block text-[8.5px] text-slate-600 font-medium">
                        {cert.signatoryTitle || settings.presidentTitle || 'President / Managing Trustee'}
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
              );
            })
          )}

        </div>

      </div>

    </div>
  );
}
