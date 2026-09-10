'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'qrcode';

export interface Section80GDonationData {
  donationId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPan?: string | null;
  donorAddress?: string | null;
  amount: number;
  paymentMethod?: string | null;
  paymentId?: string | null;
  orderId?: string | null;
  projectTitle?: string | null;
  createdAt?: string | Date;
  id?: string;
  financialYear?: string | null;
  tenBdStatus?: string | null;
  tenBeStatus?: string | null;
  tenBeNumber?: string | null;
  tenBeIssueDate?: string | Date | null;
  tenBePdfUrl?: string | null;
  secureAccessToken?: string | null;
}

export interface Section80GTrustMeta {
  name?: string;
  pan?: string;
  reg80gNo?: string;
  reg12aNo?: string;
  darpanId?: string;
  registeredAddress?: string;
  email?: string;
  phone?: string;
  website?: string;
  presidentName?: string;
  presidentTitle?: string;
  presidentSignature?: string;
}

interface Section80GCertificateProps {
  donation: Section80GDonationData;
  trustMeta?: Section80GTrustMeta;
  qrCodeUrl?: string;
  className?: string;
  id?: string;
}

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

const DEFAULT_TRUST_META: Section80GTrustMeta = {
  name: 'NIPANIA VIKASH SEVA TRUST',
  pan: 'AAFTN4004N',
  reg80gNo: 'AAFTN4004NF20214',
  reg12aNo: 'AAFTN4004NE20203',
  darpanId: 'UP/2021/0295112',
  registeredAddress: 'Village & Post Nipania, Dist. Balrampur, Uttar Pradesh - 271201, India',
  email: 'info@nipaniatrust.org',
  phone: '+91 94311 23456',
  website: 'https://nipaniatrust.org',
  presidentName: 'Managing Trustee',
  presidentTitle: 'President / Managing Trustee',
  presidentSignature: '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png',
};

export default function Section80GCertificate({
  donation,
  trustMeta = DEFAULT_TRUST_META,
  qrCodeUrl: externalQrUrl,
  className = '',
  id,
}: Section80GCertificateProps) {
  const [internalQrUrl, setInternalQrUrl] = useState<string>(externalQrUrl || '');

  const meta = {
    ...DEFAULT_TRUST_META,
    ...trustMeta,
  };

  useEffect(() => {
    if (externalQrUrl) {
      setInternalQrUrl(externalQrUrl);
      return;
    }

    if (donation?.donationId && typeof window !== 'undefined') {
      const verifyUrl = `${window.location.origin}/verify?type=donation&id=${encodeURIComponent(
        donation.donationId
      )}`;
      QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
        .then(setInternalQrUrl)
        .catch((err) => console.warn('QR code generation error:', err));
    }
  }, [donation?.donationId, externalQrUrl]);

  if (!donation) return null;

  return (
    <div
      id={id}
      className={`section-80g-certificate bg-white text-slate-900 w-full max-w-[200mm] print:max-w-[190mm] mx-auto ${className}`}
      style={{
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* Outer Formal Double Borders */}
      <div className="p-4 sm:p-6 print:p-4 border-2 border-navy-950 relative space-y-2.5 sm:space-y-3.5 print:space-y-2 bg-white">
        <div className="absolute inset-1.5 border border-amber-600/70 pointer-events-none" />

        {/* Letterhead */}
        <div className="text-center space-y-1 sm:space-y-1.5 print:space-y-0.5 relative z-10 pt-0.5">
          {/* Enlarged Official Trust Logo (Preserved 1:1 Aspect Ratio without snapping/distortion) */}
          <div className="flex justify-center mb-1">
            <img
              src="/logo.png"
              alt="Nipania Vikash Seva Trust Logo"
              className="w-32 h-32 sm:w-32 sm:h-32 print:w-32 print:h-32 object-contain aspect-square mx-auto filter drop-shadow-xs block"
              style={{ aspectRatio: '1 / 1' }}
            />
          </div>

          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-navy-950 uppercase font-serif leading-tight">
            {meta.name}
          </h1>

          <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 tracking-wider uppercase font-sans">
            A Registered Public Charitable Trust Under the Indian Trusts Act, 1882
          </p>

          <div className="text-[9px] sm:text-[10px] font-bold text-slate-700 tracking-wide font-sans flex flex-wrap justify-center items-center gap-1 sm:gap-2">
            <span>PAN: <strong>{meta.pan}</strong></span>
            <span className="text-slate-400">|</span>
            <span>80G REG NO: <strong>{meta.reg80gNo}</strong></span>
            <span className="text-slate-400">|</span>
            <span>12A REG NO: <strong>{meta.reg12aNo}</strong></span>
            <span className="text-slate-400">|</span>
            <span>DARPAN ID: <strong>{meta.darpanId}</strong></span>
          </div>

          <p className="text-[8.5px] sm:text-[9.5px] text-slate-500 max-w-xl mx-auto leading-tight font-sans">
            Registered Office: {meta.registeredAddress}
            <br />
            Email: {meta.email} | Helpline: {meta.phone} | Website: {meta.website}
          </p>

          {/* Separator rule */}
          <div className="pt-1">
            <div className="h-0.5 bg-navy-950 w-full" />
            <div className="h-px bg-amber-500 w-full mt-0.5" />
          </div>
        </div>

        {/* Certificate Title Banner */}
        <div className="bg-navy-950 text-white p-2 sm:p-2.5 print:py-1.5 print:px-2 rounded-lg text-center space-y-0.5 relative z-10 border border-amber-500/40 shadow-xs">
          <h2 className="text-xs sm:text-sm font-black tracking-widest text-amber-300 uppercase font-serif">
            Donation Receipt & Section 80G Tax Exemption Certificate
          </h2>
          <p className="text-[8.5px] sm:text-[9px] text-slate-200 font-sans tracking-wide">
            Issued under Section 80G(5)(vi) of the Income Tax Act, 1961 • Eligible for 50% Tax Deduction • Digital Audit Record
          </p>
        </div>

        {/* Structured Ledger Voucher Table */}
        <div className="border border-slate-300 text-xs relative z-10 font-sans divide-y divide-slate-200 bg-white">
          {/* Row 1: Receipt Number, Date, Payment Mode */}
          <div className="grid grid-cols-3 bg-slate-50 divide-x divide-slate-200">
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Receipt Number</span>
              <span className="font-mono font-bold text-navy-950 text-xs sm:text-sm">{donation.donationId}</span>
            </div>
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Date of Issue</span>
              <span className="font-semibold text-navy-900 text-xs">
                {donation.createdAt ? formatDate(donation.createdAt) : formatDate(new Date())}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Payment Mode</span>
              <span className="font-bold text-navy-900 text-xs">{donation.paymentMethod || 'ONLINE'}</span>
            </div>
          </div>

          {/* Row 2: Received With Thanks From & PAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2 sm:p-2.5 print:py-1.5 print:px-2 sm:col-span-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Received With Thanks From</span>
              <span className="font-bold text-navy-950 text-xs sm:text-sm tracking-wide uppercase font-serif">
                {donation.donorName}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 print:py-1.5 print:px-2 bg-amber-50/40">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Donor PAN (Form 10BE)</span>
              <span className="font-mono font-bold text-amber-950 text-[11px] bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 inline-block mt-0.5">
                {donation.donorPan || 'Not Provided / Form 60'}
              </span>
            </div>
          </div>

          {/* Row 3: Donor Contact & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Donor Contact</span>
              <span className="text-slate-700 text-[11px]">
                {donation.donorPhone} • {donation.donorEmail}
              </span>
            </div>
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Postal Address</span>
              <span className="text-slate-700 text-[11px]">
                {donation.donorAddress || 'Nipania, Balrampur, Uttar Pradesh'}
              </span>
            </div>
          </div>

          {/* Row 4: Sum of Rupees */}
          <div className="p-2 sm:p-2.5 print:py-1.5 print:px-2 bg-emerald-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-emerald-200">
            <div>
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-emerald-800 block">The Sum of Rupees</span>
              <span className="font-bold text-navy-950 text-xs sm:text-sm italic font-serif">
                ({numberToWordsINR(donation.amount)})
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-extrabold text-emerald-800 text-sm sm:text-base">
                {formatCurrency(donation.amount)}/-
              </span>
            </div>
          </div>

          {/* Row 5: Designated Purpose & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Towards Designated Purpose</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {donation.projectTitle?.includes('Sponsor') ? (
                  <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[8.5px] font-bold border border-teal-300">
                    🤝 SPONSORSHIP
                  </span>
                ) : donation.projectTitle && !donation.projectTitle.toLowerCase().includes('general') ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[8.5px] font-bold border border-amber-300">
                    🌟 CAMPAIGN
                  </span>
                ) : null}
                <span className="font-bold text-navy-950 text-xs">
                  {donation.projectTitle || 'General Trust Social Welfare Fund'}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 print:py-1 print:px-2">
              <span className="text-[8px] sm:text-[8.5px] uppercase font-bold text-slate-500 block">Transaction Ref / UTR ID</span>
              <span className="font-mono text-slate-800 text-xs font-semibold">
                {donation.paymentId || donation.orderId || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Exemption Compliance & Form 10BE Box */}
        <div className="p-2 sm:p-2.5 print:p-2 bg-slate-50 rounded-lg border border-slate-200 text-[8px] sm:text-[8.5px] print:text-[8px] text-slate-600 space-y-0.5 relative z-10 leading-relaxed font-sans">
          <strong className="text-slate-800 font-bold block uppercase">
            TAX DEDUCTION ELIGIBILITY & FORM 10BE COMPLIANCE NOTICE:
          </strong>
          <p>
            • Section 80G Deduction: Donations to Nipania Vikash Seva Trust qualify for 50% income tax deduction under Section 80G(5)(vi).
            <br />
            • Annual Form 10BE Filing: The Trust files annual donor returns with the Income Tax Department. Retain this certificate for tax filing.
            <br />
            • Transparency Commitment: 100% of community contributions are deployed strictly towards verified humanitarian and educational programs.
          </p>
        </div>

        {/* Statutory 80G Declaration Box */}
        <div className="p-2 sm:p-2.5 print:p-2 bg-amber-50/60 rounded-lg border-l-4 border-amber-500 text-[8px] sm:text-[8.5px] print:text-[8px] text-amber-950 space-y-0.5 relative z-10 leading-relaxed font-sans">
          <strong className="text-amber-900 font-bold block uppercase">
            STATUTORY DECLARATION UNDER SECTION 80G OF THE INCOME TAX ACT, 1961:
          </strong>
          <p>
            1. Certified that this voluntary contribution has been gratefully received towards the charitable objects of Nipania Vikash Seva Trust.
            <br />
            2. Nipania Vikash Seva Trust is registered under Section 12A (Reg No: {meta.reg12aNo}) and approved under Section 80G (Reg No: {meta.reg80gNo}) of the Income Tax Act, 1961. This contribution qualifies for 50% deduction from taxable income.
            <br />
            3. No commercial consideration, material benefits, goods, or services were provided to the donor in exchange for this contribution.
          </p>
        </div>

        {/* Verification QR & Authorized Signatory Area (STRICTLY NO INK SEAL) */}
        <div className="flex flex-row items-center justify-between gap-3 pt-0.5 print:pt-0 relative z-10 font-sans">
          {/* Left: QR Code */}
          <div className="flex items-center gap-2">
            {internalQrUrl && (
              <div className="p-1 border border-slate-300 rounded bg-white shrink-0">
                <img src={internalQrUrl} alt="Verify QR" className="w-14 h-14 sm:w-16 sm:h-16 print:w-14 print:h-14" />
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-black text-navy-950 block tracking-wider">
                SCAN TO VERIFY
              </span>
              <span className="text-[8px] text-slate-500 block leading-tight max-w-[130px]">
                Scan with any smartphone camera to verify this certificate on trust portal.
              </span>
              <span className="text-[7.5px] font-mono text-slate-400 block">ID: {donation.donationId}</span>
            </div>
          </div>

          {/* Right: Authorized Signatory (NO SEAL) */}
          <div className="text-right min-w-[160px] sm:min-w-[180px]">
            <div className="h-10 sm:h-11 w-32 sm:w-36 relative ml-auto flex items-center justify-end">
              {meta.presidentSignature ? (
                <img
                  src={meta.presidentSignature}
                  alt="Authorized Signatory"
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
              ) : (
                <span className="font-serif italic text-amber-800 text-xs">Managing Trustee</span>
              )}
            </div>
            <div className="w-36 h-0.5 bg-navy-950 my-0.5 ml-auto" />
            <strong className="text-[10.5px] sm:text-xs font-bold text-navy-950 uppercase block font-serif">
              {meta.presidentName}
            </strong>
            <span className="text-[9px] text-slate-600 font-semibold block">
              {meta.presidentTitle}
            </span>
            <span className="text-[8px] text-slate-500 uppercase tracking-wider block">
              Nipania Vikash Seva Trust
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-1.5 print:pt-1 border-t border-slate-200 text-[8px] text-slate-400 font-mono relative z-10">
          This is a computer-generated digital Section 80G Tax Exemption Certificate issued by Nipania Vikash Seva Trust on{' '}
          {new Date().toLocaleDateString('en-IN')}.
          <br />
          Portal: {meta.website} | Verification: {meta.website}/verify | Support: {meta.email}
        </div>
      </div>
    </div>
  );
}
