'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  FileCheck,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface DirectDonationProps {
  compact?: boolean;
}

export default function DirectDonationSection({ compact = false }: DirectDonationProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankConfig, setBankConfig] = useState({
    upiId: 'nipaniatrust@upi',
    upiPayeeName: 'Nipania Vikash Seva Trust',
    upiQrImage: '/qr.png',
    bankAccountName: 'NIPANIA VIKASH SEVA TRUST',
    bankAccountNumber: '921020010268306',
    bankIfsc: 'UTIB0003025',
    bankName: 'Axis Bank',
    branchName: 'Dhanbad Branch',
    accountType: 'Current Account',
    phone: '+91 98765 43210',
    email: 'info@nipaniatrust.org',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const trust = data.trust || data.settings;
        if (trust) {
          setBankConfig((prev) => ({
            ...prev,
            bankAccountName: trust.accountName || trust.name || prev.bankAccountName,
            bankAccountNumber: trust.accountNumber || prev.bankAccountNumber,
            bankIfsc: trust.ifscCode || prev.bankIfsc,
            bankName: trust.bankName || prev.bankName,
            branchName: trust.branchName || prev.branchName,
            upiId: trust.upiId || prev.upiId,
            upiPayeeName: trust.upiPayeeName || trust.name || prev.upiPayeeName,
            upiQrImage: trust.upiQrImage || prev.upiQrImage,
            phone: trust.phone || prev.phone,
            email: trust.email || prev.email,
          }));
        }
      })
      .catch((err) => console.warn('Bank config fallback:', err));
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `🙏 Support Nipania Vikash Seva Trust\n\nDirect Bank Transfer Details:\n• A/C Name: ${bankConfig.bankAccountName}\n• A/C No: ${bankConfig.bankAccountNumber}\n• IFSC: ${bankConfig.bankIfsc}\n• Bank: ${bankConfig.bankName} (${bankConfig.branchName})\n• UPI ID: ${bankConfig.upiId}\n\n100% Tax Deductible under Section 80G.\nVerify & Donate: https://nipaniatrust.org/donate`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="qr-donation-section" className={`${compact ? 'py-8' : 'py-16 sm:py-20'} bg-slate-50 relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Direct Community Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
            Make an Immediate Impact
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Scan the official Trust UPI QR code on the left with any payment app, or use our verified direct bank account details on the right for NEFT, RTGS, IMPS, or Cheque transfers.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Official Trust UPI QR Code */}
          <div className="lg:col-span-5 bg-white p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="w-full space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-navy-950 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                <QrCode className="w-3.5 h-3.5 text-gold-600" />
                <span>Zero-Fee Instant Transfer</span>
              </div>

              <h3 className="text-xl font-extrabold text-navy-950 font-heading">
                Scan to Donate via UPI
              </h3>
              <p className="text-xs text-slate-500">
                Compatible with GPay, PhonePe, Paytm, BHIM, Amazon Pay & all banking apps.
              </p>

              {/* QR Image Container */}
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto p-3 sm:p-4 bg-white rounded-2xl border-2 border-dashed border-gold-400 shadow-md flex items-center justify-center group">
                <div className="relative w-full h-full">
                  <Image
                    src={bankConfig.upiQrImage || '/qr.png'}
                    alt="Nipania Vikash Seva Trust Official UPI QR Code"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* UPI ID display & copy */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs max-w-xs mx-auto">
                <span className="font-mono font-bold text-navy-950 truncate">{bankConfig.upiId}</span>
                <button
                  onClick={() => handleCopy(bankConfig.upiId, 'upiId')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-700 hover:text-gold-900 transition-colors ml-2 shrink-0"
                >
                  {copiedField === 'upiId' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full pt-6 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <a
                  href={bankConfig.upiQrImage || '/qr.png'}
                  download="Nipania_Trust_UPI_QR.png"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-950 text-white hover:bg-navy-900 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-gold-400" />
                  <span>Download QR</span>
                </a>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share QR</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>50% Tax Exemption Under Section 80G</span>
              </div>
            </div>
          </div>

          {/* Column 2: Direct Bank Transfer Card with 1-Click Copy */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="h-2 bg-gradient-to-r from-navy-950 via-gold-500 to-navy-950" />
            
            <div className="p-4 sm:p-6 sm:p-8 space-y-4 sm:space-y-6 flex-1">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-wider mb-1">
                  <Building2 className="w-4 h-4 text-gold-600" />
                  <span>Verified Organization Account</span>
                </div>
                <h3 className="text-2xl font-extrabold text-navy-950 font-heading">
                  Bank Account & NEFT / RTGS / IMPS Details
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Transfer directly from your banking portal or branch counter using the details below.
                </p>
              </div>

              {/* Structured Bank Fields with Copy Buttons */}
              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                
                {/* Account Name */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Name</span>
                    <strong className="text-sm sm:text-base font-bold text-navy-950">{bankConfig.bankAccountName}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.bankAccountName, 'accountName')}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-navy-950 transition-colors shadow-2xs"
                  >
                    {copiedField === 'accountName' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Number */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Number</span>
                    <strong className="text-base sm:text-lg font-mono font-black text-navy-950 tracking-wider">
                      {bankConfig.bankAccountNumber}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.bankAccountNumber, 'accountNumber')}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-navy-950 transition-colors shadow-2xs"
                  >
                    {copiedField === 'accountNumber' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* IFSC Code */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IFSC Code</span>
                    <strong className="text-base sm:text-lg font-mono font-black text-navy-950 tracking-wider">
                      {bankConfig.bankIfsc}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.bankIfsc, 'ifsc')}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-navy-950 transition-colors shadow-2xs"
                  >
                    {copiedField === 'ifsc' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bank Name & Branch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bank & Branch</span>
                    <strong className="text-sm sm:text-base font-bold text-navy-950">
                      {bankConfig.bankName} &bull; {bankConfig.branchName}
                    </strong>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                    Indian Bank
                  </span>
                </div>

                {/* Account Type */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Type</span>
                    <strong className="text-sm font-bold text-navy-950">{bankConfig.accountType}</strong>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Trust Account</span>
                  </span>
                </div>
              </div>

              {/* 80G Tax Assistance Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div className="text-xs text-amber-950 space-y-1.5">
                  <strong className="font-bold text-sm text-navy-950 block">
                    Need an Instant Section 80G Tax Exemption Receipt?
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    After completing your bank transfer, submit your UTR reference on our portal, or share your transfer screenshot with your PAN details via WhatsApp or Email to receive your digitally certified 80G receipt immediately:
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`mailto:${bankConfig.email}?subject=80G Receipt Request for Bank Transfer`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-navy-950 font-bold text-xs hover:bg-amber-50 transition-colors shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-700" />
                      <span>{bankConfig.email}</span>
                    </a>
                    <a
                      href={`https://wa.me/${bankConfig.phone.replace(/[^0-9]/g, '')}?text=Hello%20Nipania%20Trust,%20I%20have%20completed%20a%20direct%20bank%20transfer.%20Kindly%20issue%20my%2080G%20receipt.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-navy-950 font-bold text-xs hover:bg-amber-50 transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Support</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
