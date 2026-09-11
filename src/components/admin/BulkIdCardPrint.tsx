'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  X, 
  Scissors, 
  CheckSquare, 
  Square, 
  Layers, 
  Loader2,
  BadgeCheck,
  CheckCircle2,
  Phone,
  Mail,
  QrCode as QrIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { IdCardData } from './IdCardRenderer';

interface BulkIdCardPrintProps {
  cards: IdCardData[];
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkIdCardPrint({ cards, isOpen, onClose }: BulkIdCardPrintProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [cardsPerPage, setCardsPerPage] = useState<number>(9); // 1, 2, 4, 6, 8, 9
  const [sheetViewMode, setSheetViewMode] = useState<'ALL' | 'SINGLE'>('ALL');
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [trustDetails, setTrustDetails] = useState({
    name: 'NIPANIA VIKASH SEVA TRUST',
    regNumber: 'IV-120/2022',
    darpanId: 'NITI Aayog Darpan',
    presidentName: 'Managing Trustee',
    presidentTitle: 'President / Managing Trustee',
    presidentSignature: null as string | null,
    presidentStamp: null as string | null,
    trustPhone: '+91 94311 23456',
    trustEmail: 'info@nipaniatrust.org',
    trustAddress: 'Nipania, P.O. Pargha, P.S. Baliapur, District Dhanbad, Jharkhand – 828201',
  });

  const defaultPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

  // Initialize selected cards
  useEffect(() => {
    if (cards && cards.length > 0) {
      setSelectedCardIds(cards.map((c) => c.cardNumber));
    }
  }, [cards]);

  // Fetch trust settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setTrustDetails((prev) => ({
            ...prev,
            name: data.settings.name || prev.name,
            regNumber: data.settings.registrationNumber || prev.regNumber,
            presidentName: data.settings.presidentName || prev.presidentName,
            presidentTitle: data.settings.presidentTitle || prev.presidentTitle,
            presidentSignature: data.settings.presidentSignature || prev.presidentSignature,
            presidentStamp: data.settings.presidentStamp || prev.presidentStamp,
            trustPhone: data.settings.phone || prev.trustPhone,
            trustEmail: data.settings.email || prev.trustEmail,
            trustAddress: data.settings.address || prev.trustAddress,
          }));
        }
      })
      .catch((e) => console.error('Error fetching settings for bulk print:', e));
  }, []);

  // Pre-generate QR codes for all selected cards
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nipaniatrust.org';
    const generateAllQr = async () => {
      const map: Record<string, string> = {};
      for (const card of cards) {
        try {
          const url = await QRCode.toDataURL(`${origin}/verify/${card.cardNumber}`, {
            width: 240,
            margin: 1,
            color: { dark: '#0B192C', light: '#FFFFFF' },
            errorCorrectionLevel: 'M',
          });
          map[card.cardNumber] = url;
        } catch (e) {
          console.error(`QR gen error for ${card.cardNumber}:`, e);
        }
      }
      setQrMap(map);
    };

    if (isOpen && cards.length > 0) {
      generateAllQr();
    }
  }, [isOpen, cards]);

  if (!isOpen) return null;

  const activeCards = cards.filter((c) => selectedCardIds.includes(c.cardNumber));
  const totalPages = Math.max(1, Math.ceil(activeCards.length / cardsPerPage));

  // Chunk cards into pages
  const paginatedCards: IdCardData[][] = [];
  for (let i = 0; i < activeCards.length; i += cardsPerPage) {
    paginatedCards.push(activeCards.slice(i, i + cardsPerPage));
  }

  const toggleSelectAll = () => {
    if (selectedCardIds.length === cards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(cards.map((c) => c.cardNumber));
    }
  };

  const toggleCard = (id: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Multi-Page A4 PDF Generation
  const handleDownloadBulkPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let pageIdx = 0; pageIdx < paginatedCards.length; pageIdx++) {
        const pageEl = document.getElementById(`a4-sheet-page-${pageIdx}`);
        if (!pageEl) continue;

        const canvas = await html2canvas(pageEl, {
          scale: 2.8, // Ultra-sharp 300 DPI
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1200,
          onclone: (clonedDoc) => {
            const noPrintNodes = clonedDoc.querySelectorAll('.no-print');
            noPrintNodes.forEach((node) => {
              (node as HTMLElement).style.display = 'none';
            });
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (pageIdx > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // A4 page dimensions: 210mm x 297mm
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      pdf.save(`NVS_Trust_Bulk_ID_Cards_${activeCards.length}_Cards.pdf`);
    } catch (err) {
      console.error('Error generating bulk A4 PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
      default:
        return {
          badgeBg: 'bg-navy-900 text-gold-400 border-navy-800',
          bannerBg: 'bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-gold-300',
          bannerTag: 'ADMINISTRATIVE STAFF',
        };
    }
  };

  return (
    <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex flex-col overflow-hidden">
      
      {/* Print Stylesheet for Multi-Page Portrait ID Card Sheets */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          body {
            background: #FFFFFF !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-print-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* TOP CONTROLS TOOLBAR (NO-PRINT)                          */}
      {/* ======================================================== */}
      <div className="no-print bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md shrink-0">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600">
            <Layers className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <span>Bulk ID Card Print Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-900 font-mono font-bold">
                A4 Standard Layout
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Arranging {activeCards.length} selected ID card{activeCards.length !== 1 ? 's' : ''} across {totalPages} A4 sheet{totalPages !== 1 ? 's' : ''} (100% Identical to Single Card Preview)
            </p>
          </div>
        </div>

        {/* Options & Print Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Select All Toggle */}
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {selectedCardIds.length === cards.length ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Select All ({cards.length})</span>
              </>
            )}
          </button>

          {/* Cards per sheet selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="text-slate-500 text-[11px] px-1.5">Cards / Sheet:</span>
            {[
              { count: 1, label: '1' },
              { count: 2, label: '2' },
              { count: 4, label: '4' },
              { count: 6, label: '6' },
              { count: 8, label: '8' },
              { count: 9, label: '9' },
            ].map(({ count, label }) => (
              <button
                key={count}
                type="button"
                onClick={() => {
                  setCardsPerPage(count);
                  setActiveSheetIndex(0);
                }}
                className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                  cardsPerPage === count
                    ? 'bg-navy-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sheet View Mode (All Sheets vs Single Sheet) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSheetViewMode('ALL')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                sheetViewMode === 'ALL'
                  ? 'bg-navy-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              All Sheets ({totalPages})
            </button>
            <button
              type="button"
              onClick={() => setSheetViewMode('SINGLE')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                sheetViewMode === 'SINGLE'
                  ? 'bg-navy-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Single Sheet
            </button>
          </div>

          {/* Single Sheet Pagination */}
          {sheetViewMode === 'SINGLE' && totalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveSheetIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSheetIndex === 0}
                className="p-1 rounded hover:bg-white text-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono font-bold text-navy-950 text-[11px]">
                {activeSheetIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setActiveSheetIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={activeSheetIndex >= totalPages - 1}
                className="p-1 rounded hover:bg-white text-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Crop Marks Toggle */}
          <button
            type="button"
            onClick={() => setShowCropMarks(!showCropMarks)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showCropMarks
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Cutting Guides {showCropMarks ? 'ON' : 'OFF'}</span>
          </button>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={activeCards.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" />
            <span>Print {sheetViewMode === 'SINGLE' ? `Sheet ${activeSheetIndex + 1}` : 'A4 Sheets'}</span>
          </button>

          {/* Download A4 Multi-Page PDF */}
          <button
            type="button"
            disabled={isGeneratingPdf || activeCards.length === 0}
            onClick={handleDownloadBulkPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gold-600 hover:bg-gold-700 text-white shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download A4 PDF</span>
              </>
            )}
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MAIN VIEW: SELECTION SIDEBAR + A4 SHEET PREVIEW CANVAS   */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Card Selector Tray (No-Print) */}
        <div className="no-print w-72 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-2 shrink-0 hidden md:block admin-modal-scroll">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>Select Cards to Print:</span>
            <span className="text-gold-700 font-mono">{activeCards.length} of {cards.length}</span>
          </div>

          <div className="space-y-1.5">
            {cards.map((card) => {
              const isChecked = selectedCardIds.includes(card.cardNumber);
              return (
                <div
                  key={card.cardNumber}
                  onClick={() => toggleCard(card.cardNumber)}
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
                    <p className="font-bold text-navy-950 truncate leading-tight">{card.fullName}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate leading-tight">{card.cardNumber}</p>
                    <span className="inline-block text-[9px] font-semibold text-amber-800 uppercase leading-none mt-0.5">
                      {card.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Canvas: Rendered A4 Printable Pages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200/80 flex flex-col items-center space-y-8 admin-modal-scroll">
          
          {paginatedCards.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center space-y-3 max-w-md shadow-md my-auto">
              <p className="text-sm font-bold text-navy-950">No Cards Selected</p>
              <p className="text-xs text-slate-500">
                Please select at least one ID card from the left tray to generate the printable A4 sheet.
              </p>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white"
              >
                Select All Cards
              </button>
            </div>
          ) : (
            (sheetViewMode === 'SINGLE'
              ? (paginatedCards[activeSheetIndex] ? [{ pageCards: paginatedCards[activeSheetIndex], pageIndex: activeSheetIndex }] : [])
              : paginatedCards.map((pageCards, pageIndex) => ({ pageCards, pageIndex }))
            ).map(({ pageCards, pageIndex }) => (
              <div
                key={pageIndex}
                id={`a4-sheet-page-${pageIndex}`}
                className="a4-print-page relative bg-white shadow-2xl border border-slate-300 mx-auto select-none print:shadow-none print:border-none print:m-0 print:break-inside-avoid"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  maxHeight: '297mm',
                  padding: '6mm',
                  boxSizing: 'border-box',
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                }}
              >
                {/* Page Header (Informational) */}
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 text-[9px] text-slate-500 font-medium">
                  <span>NIPANIA VIKASH SEVA TRUST • OFFICIAL CR80 PVC BATCH PRINT</span>
                  <span>Page {pageIndex + 1} of {totalPages} • Total Cards on Page: {pageCards.length}</span>
                </div>

                {/* Grid Container for CR80 Cards (54mm × 85.6mm each) */}
                <div
                  className={`grid justify-center items-center ${
                    cardsPerPage === 9
                      ? 'grid-cols-3 gap-x-3 gap-y-2 items-start'
                      : cardsPerPage === 8
                        ? 'grid-cols-2 gap-x-6 gap-y-2 items-start'
                        : cardsPerPage === 6
                          ? 'grid-cols-2 gap-x-6 gap-y-4 items-start'
                          : cardsPerPage === 4
                            ? 'grid-cols-2 gap-x-10 gap-y-8 my-auto'
                            : cardsPerPage === 2
                              ? 'grid-cols-2 gap-x-12 my-auto'
                              : 'grid-cols-1 my-auto'
                  }`}
                  style={{
                    height: 'calc(297mm - 24mm)',
                  }}
                >
                  {pageCards.map((card) => {
                    const theme = getRoleTheme(card.personType || card.role);
                    const qrUrl = qrMap[card.cardNumber];
                    const photoSrc = card.photoUrl || defaultPhoto;

                    return (
                      <div
                        key={card.cardNumber}
                        className={`relative overflow-hidden bg-white ${
                          showCropMarks ? 'border border-dashed border-slate-400' : 'border border-slate-300'
                        }`}
                        style={{
                          width: '54mm',
                          height: '85.6mm',
                          boxSizing: 'border-box',
                          position: 'relative',
                        }}
                      >
                        {/* 100% PROPORTIONAL CLONE OF SINGLE PVC CARD (Width: 360px scaled by 0.5669 to exactly 54mm) */}
                        <div
                          style={{
                            width: '360px',
                            height: '570.8px',
                            transform: 'scale(0.5669)',
                            transformOrigin: 'top left',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                          className="relative bg-white flex flex-col justify-between shrink-0 select-none"
                        >
                          
                          {/* HIGH-SECURITY WATERMARK LAYER (BACKGROUND ONLY) */}
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
                                  src={trustDetails.presidentStamp || '/logo.png'}
                                  alt="Official Trust Seal Watermark"
                                  crossOrigin="anonymous"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          </div>

                          {/* ======================================================== */}
                          {/* 1. CARD TOP: ROYAL BILINGUAL HEADER                      */}
                          {/* ======================================================== */}
                          <div className="relative z-10">
                            {/* Header Banner */}
                            <div className="relative bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white px-4 py-2.5 border-y-2 border-gold-500/50 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-gold-400 shadow-md shrink-0 ring-1 ring-gold-400/50">
                                  <Image src="/logo.png" alt="Trust Logo" fill className="object-contain" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <span className="block text-[10px] font-bold text-gold-300 tracking-normal leading-normal">
                                    निपनिया विकास सेवा ट्रस्ट
                                  </span>
                                  <h3 className="text-xs font-black uppercase tracking-tight font-heading leading-normal text-white">
                                    Nipania Vikash Seva Trust
                                  </h3>
                                  <p className="text-[8.5px] text-slate-300 leading-normal">
                                    Govt. Regd: {trustDetails.regNumber} • NITI Aayog Darpan
                                  </p>
                                  <p className="text-[8px] font-bold text-gold-400 uppercase tracking-wider leading-normal">
                                    Seva • Vikash • Samarpan
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Sub-strip: Category Designation Ribbon */}
                            <div className={`px-4 py-1.5 ${theme.bannerBg} flex items-center justify-between border-b border-gold-400/40 shadow-xs`}>
                              <span className="text-[9px] font-black uppercase tracking-wider leading-normal">
                                {theme.bannerTag}
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
                            
                            {/* Centered Passport Photo Frame (100% IDENTICAL POSITION & PROPORTIONS) */}
                            <div className="flex justify-center pt-0.5">
                              <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-gold-500 shadow-md bg-slate-100 shrink-0 ring-2 ring-white">
                                <img
                                  src={photoSrc}
                                  alt={card.fullName}
                                  crossOrigin="anonymous"
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
                                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${theme.badgeBg} leading-normal`}>
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
                                  {qrUrl ? (
                                    <img
                                      src={qrUrl}
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
                                  {trustDetails.presidentSignature ? (
                                    <img
                                      src={trustDetails.presidentSignature}
                                      alt="Authorized Signature"
                                      crossOrigin="anonymous"
                                      className="max-h-full max-w-[100px] object-contain"
                                    />
                                  ) : (
                                    <span className="font-serif italic text-navy-950 text-xs font-bold leading-normal">
                                      {trustDetails.presidentName}
                                    </span>
                                  )}
                                </div>
                                <div className="w-20 mx-auto h-px bg-slate-400 my-0.5" />
                                <span className="block text-[8px] font-black uppercase tracking-wider text-navy-950 leading-normal">
                                  Authorized Signatory
                                </span>
                                <span className="block text-[7px] text-slate-600 font-medium leading-normal">
                                  {trustDetails.presidentTitle}
                                </span>
                              </div>

                              {/* Official Trust Seal Stamp Column */}
                              <div className="relative shrink-0 flex items-center justify-center">
                                <div className="w-14 h-14 flex items-center justify-center transform -rotate-6 select-none">
                                  {trustDetails.presidentStamp ? (
                                    <img
                                      src={trustDetails.presidentStamp}
                                      alt="Official Seal Stamp"
                                      crossOrigin="anonymous"
                                      className="w-14 h-14 object-contain"
                                    />
                                  ) : (
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
                                {trustDetails.trustPhone}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5 text-gold-600 shrink-0" />
                                {trustDetails.trustEmail}
                              </span>
                            </div>
                            <p className="text-[7.5px] text-slate-600 leading-normal">
                              {trustDetails.trustAddress}
                            </p>
                            <p className="text-[6.5px] text-slate-400 uppercase tracking-tight leading-normal">
                              Official Credential • Nipania Vikash Seva Trust • Does not confer trusteeship, ownership or voting rights • Property of Trust
                            </p>
                          </div>

                        </div>

                        {/* Crop / Cutting Corner Indicators */}
                        {showCropMarks && (
                          <>
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-600 pointer-events-none z-20" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-600 pointer-events-none z-20" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-600 pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-600 pointer-events-none z-20" />
                          </>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* Page Footer (Printing Guide) */}
                <div className="pt-1.5 border-t border-slate-200 text-center text-[7.5px] text-slate-400">
                  Cut along the dotted guidelines using standard badge cutter or scissors. Card dimensions: 54mm × 85.6mm (CR80 Standard PVC).
                </div>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}
