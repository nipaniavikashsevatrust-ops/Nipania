'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, Download, X, FileCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'qrcode';

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

export default function DonationPrintPage() {
  const params = useParams();
  const rawId = params?.id as string;
  const router = useRouter();

  const [donation, setDonation] = useState<any>(null);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [trustMeta, setTrustMeta] = useState<any>({
    name: 'NIPANIA VIKASH SEVA TRUST',
    pan: 'AAFTN4004N',
    reg80gNo: 'AAFTN4004NF20214',
    reg12aNo: 'AAFTN4004NE20203',
    darpanId: 'UP/2021/0295112',
    registeredAddress: 'Nipania, P.O. Pargha, P.S. Baliapur, District Dhanbad, Jharkhand – 828201',
    email: 'info@nipaniatrust.org',
    phone: '+91 98765 43210',
    website: 'https://nipaniatrust.org',
    presidentName: 'Managing Trustee',
    presidentTitle: 'President / Managing Trustee',
    presidentSignature: '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png',
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawId) return;

    // 1. Fetch donation details
    fetch(`/api/donations?search=${encodeURIComponent(rawId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.donations && data.donations.length > 0) {
          const match = data.donations.find(
            (d: any) => d.donationId === rawId || d.id === rawId || d.paymentId === rawId
          ) || data.donations[0];
          setDonation(match);

          // Generate QR code data URL
          const verifyUrl = `${window.location.origin}/verify?type=donation&id=${match.donationId}`;
          QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
            .then(setQrCodeUrl)
            .catch((e) => console.warn('QR error:', e));
        }
      })
      .catch((err) => console.error('Failed to load donation for print:', err))
      .finally(() => setLoading(false));

    // 2. Fetch trust metadata
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTrustMeta((prev: any) => ({
            ...prev,
            name: data.settings.name || prev.name,
            pan: data.settings.pan || prev.pan,
            reg80gNo: data.settings.reg80gNo || prev.reg80gNo,
            reg12aNo: data.settings.reg12aNo || prev.reg12aNo,
            darpanId: data.settings.darpanId || prev.darpanId,
            registeredAddress: data.settings.registeredAddress || prev.registeredAddress,
            email: data.settings.email || prev.email,
            phone: data.settings.phone || prev.phone,
            presidentName: data.settings.presidentName || prev.presidentName,
            presidentTitle: data.settings.presidentTitle || prev.presidentTitle,
            presidentSignature: data.settings.presidentSignature || prev.presidentSignature,
          }));
        }
      })
      .catch((err) => console.warn('Could not load settings:', err));
  }, [rawId]);

  // Disable auto-print to debug - let user manually click Print Now
  // This allows them to see the content before printing
  /*
  useEffect(() => {
    if (donation && qrCodeUrl && !hasPrinted) {
      const logoImg = new Image();
      const signatureImg = new Image();
      let imagesLoaded = 0;
      const totalImages = trustMeta.presidentSignature ? 2 : 1;

      const checkAllLoaded = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          setTimeout(() => {
            window.print();
            setHasPrinted(true);
          }, 500);
        }
      };

      logoImg.onload = checkAllLoaded;
      logoImg.onerror = checkAllLoaded;
      logoImg.src = '/logo.png';

      if (trustMeta.presidentSignature) {
        signatureImg.onload = checkAllLoaded;
        signatureImg.onerror = checkAllLoaded;
        signatureImg.src = trustMeta.presidentSignature;
      }
    }
  }, [donation, qrCodeUrl, trustMeta, hasPrinted]);
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-semibold">
        Preparing official Section 80G print certificate...
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center space-y-3">
          <p className="text-slate-700 font-semibold text-sm">Donation record not found.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Add CSS to hide top bar during print */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          @page {
            size: A4;
            margin: 8mm;
          }
        }
      `}</style>

      {/* Top Floating Action Bar (Hidden during Print) */}
      <div className="no-print sticky top-0 z-50 bg-navy-950 text-white px-6 py-3 border-b border-gold-400/30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gold-300">
            Print Section 80G Tax Exemption Certificate
          </span>
          <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-white ml-2">
            {donation.donationId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Now</span>
          </button>

          <a
            href={`/api/donations/${donation.donationId}/receipt`}
            download={`80G_Receipt_${donation.donationId}.pdf`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Download PDF</span>
          </a>

          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Main A4 Certificate Sheet Container */}
      <div className="receipt-print-area max-w-[200mm] print:max-w-[190mm] mx-auto my-6 print:my-0 bg-white shadow-xl" style={{ minHeight: 'auto' }}>
        {/* Outer Formal Double Borders */}
        <div className="p-4 sm:p-6 print:p-4 border-2 border-navy-950 relative space-y-3 print:space-y-2">
          <div className="absolute inset-1.5 border border-gold-600/60 pointer-events-none" />

          {/* Letterhead */}
          <div className="text-center space-y-1.5 print:space-y-0.5 relative z-10 pt-1">
            {/* Enlarged Logo (Preserved 1:1 Aspect Ratio without snapping/distortion) */}
            <div className="flex justify-center mb-1">
              <img
                src="/logo.png"
                alt="Trust Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 print:w-24 print:h-24 object-contain aspect-square mx-auto filter drop-shadow-xs block"
                style={{ aspectRatio: '1 / 1' }}
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-950 uppercase font-serif">
              {trustMeta.name}
            </h1>

            <p className="text-[10px] font-bold text-amber-800 tracking-wider uppercase font-sans">
              A Registered Public Charitable Trust Under the Indian Trusts Act, 1882
            </p>

            <div className="text-[9.5px] font-bold text-slate-700 tracking-wide font-sans">
              <span>PAN: {trustMeta.pan}</span>
              <span className="mx-2 text-slate-400">|</span>
              <span>80G REG NO: {trustMeta.reg80gNo}</span>
              <span className="mx-2 text-slate-400">|</span>
              <span>12A REG NO: {trustMeta.reg12aNo}</span>
              <span className="mx-2 text-slate-400">|</span>
              <span>DARPAN ID: {trustMeta.darpanId}</span>
            </div>

            <p className="text-[9px] text-slate-500 max-w-xl mx-auto leading-tight font-sans">
              Registered Office: {trustMeta.registeredAddress}
              <br />
              Email: {trustMeta.email} | Helpline: {trustMeta.phone} | Website: {trustMeta.website}
            </p>

            {/* Separator rule */}
            <div className="pt-2">
              <div className="h-0.5 bg-navy-950 w-full" />
              <div className="h-px bg-gold-500 w-full mt-0.5" />
            </div>
          </div>

          {/* Certificate Title Banner */}
          <div className="bg-navy-950 text-white p-3 rounded-lg text-center space-y-1 relative z-10 border border-gold-500/40 shadow-xs">
            <h2 className="text-xs sm:text-sm font-black tracking-widest text-gold-300 uppercase font-serif">
              Donation Receipt & Section 80G Tax Exemption Certificate
            </h2>
            <p className="text-[9px] text-slate-200 font-sans tracking-wide">
              Issued under Section 80G(5)(vi) of the Income Tax Act, 1961 • Eligible for 50% Tax Deduction • Digital Audit Record
            </p>
          </div>

          {/* Structured Ledger Voucher Table */}
          <div className="border border-slate-300 text-xs relative z-10 font-sans divide-y divide-slate-200">
            {/* Row 1: Receipt Number, Date, Payment Mode */}
            <div className="grid grid-cols-3 bg-slate-50 divide-x divide-slate-200">
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Receipt Number</span>
                <span className="font-mono font-bold text-navy-950 text-xs">{donation.donationId}</span>
              </div>
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Date of Issue</span>
                <span className="font-medium text-navy-900 text-xs">{formatDate(donation.createdAt)}</span>
              </div>
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Payment Mode</span>
                <span className="font-bold text-navy-900 text-xs">{donation.paymentMethod || 'ONLINE'}</span>
              </div>
            </div>

            {/* Row 2: Received With Thanks From & PAN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 sm:col-span-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Received With Thanks From</span>
                <span className="font-bold text-navy-950 text-sm tracking-wide uppercase font-serif">
                  {donation.donorName}
                </span>
              </div>
              <div className="p-3 bg-amber-50/40">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Donor PAN (Form 10BE)</span>
                <span className="font-mono font-bold text-amber-900 text-xs bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 inline-block mt-0.5">
                  {donation.donorPan || 'Not Provided / Form 60'}
                </span>
              </div>
            </div>

            {/* Row 3: Donor Contact & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Donor Contact</span>
                <span className="text-slate-700 text-xs">
                  {donation.donorPhone} • {donation.donorEmail}
                </span>
              </div>
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Postal Address</span>
                <span className="text-slate-700 text-xs">
                  {donation.donorAddress || 'Nipania, Balrampur, Uttar Pradesh'}
                </span>
              </div>
            </div>

            {/* Row 4: Sum of Rupees */}
            <div className="p-3 bg-emerald-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-emerald-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-800 block">The Sum of Rupees</span>
                <span className="font-bold text-navy-950 text-xs italic">
                  ({numberToWordsINR(donation.amount)})
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-extrabold text-emerald-700 text-base sm:text-lg">
                  {formatCurrency(donation.amount)}/-
                </span>
              </div>
            </div>

            {/* Row 5: Designated Purpose & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Towards Designated Purpose</span>
                <span className="font-bold text-navy-950 text-xs">
                  {donation.projectTitle || 'General Trust Social Welfare Fund'}
                </span>
              </div>
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Transaction Ref / UTR ID</span>
                <span className="font-mono text-slate-700 text-xs">
                  {donation.paymentId || donation.orderId || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Exemption Compliance & Form 10BE Box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[9px] text-slate-600 space-y-1 relative z-10 leading-relaxed font-sans">
            <strong className="text-slate-800 font-bold block">
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
          <div className="p-3.5 bg-amber-50/50 rounded-lg border-l-4 border-amber-500 text-[9px] text-amber-950 space-y-1 relative z-10 leading-relaxed font-sans">
            <strong className="text-amber-900 font-bold block">
              STATUTORY DECLARATION UNDER SECTION 80G OF THE INCOME TAX ACT, 1961:
            </strong>
            <p>
              1. Certified that this voluntary contribution has been gratefully received towards the charitable objects of Nipania Vikash Seva Trust.
              <br />
              2. Nipania Vikash Seva Trust is registered under Section 12A (Reg No: {trustMeta.reg12aNo}) and approved under Section 80G (Reg No: {trustMeta.reg80gNo}) of the Income Tax Act, 1961. This contribution qualifies for 50% deduction from taxable income.
              <br />
              3. No commercial consideration, material benefits, goods, or services were provided to the donor in whole or partial exchange for this contribution.
            </p>
          </div>

          {/* Verification QR & Authorized Signatory Area (STRICTLY NO INK SEAL) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 relative z-10 font-sans">
            {/* Left: QR Code */}
            <div className="flex items-center gap-3">
              {qrCodeUrl && (
                <div className="p-1 border border-slate-300 rounded bg-white shrink-0">
                  <img src={qrCodeUrl} alt="Verify QR" className="w-20 h-20" />
                </div>
              )}
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-navy-950 block tracking-wider">
                  SCAN TO VERIFY
                </span>
                <span className="text-[9px] text-slate-500 block leading-tight max-w-[150px]">
                  Scan with any smartphone camera to verify this certificate on trust portal.
                </span>
                <span className="text-[8.5px] font-mono text-slate-400 block">ID: {donation.donationId}</span>
              </div>
            </div>

            {/* Right: Authorized Signatory (NO SEAL) */}
            <div className="text-center sm:text-right min-w-[200px]">
              <div className="h-14 w-40 relative mx-auto sm:ml-auto flex items-center justify-center sm:justify-end">
                {trustMeta.presidentSignature ? (
                  <img
                    src={trustMeta.presidentSignature}
                    alt="Authorized Signatory"
                    className="max-h-full max-w-full object-contain filter contrast-125"
                  />
                ) : (
                  <span className="font-serif italic text-gold-800 text-sm">Managing Trustee</span>
                )}
              </div>
              <div className="w-44 h-0.5 bg-navy-950 my-1 mx-auto sm:ml-auto" />
              <strong className="text-xs font-bold text-navy-950 uppercase block font-serif">
                {trustMeta.presidentName}
              </strong>
              <span className="text-[10px] text-slate-600 font-semibold block">
                {trustMeta.presidentTitle}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                Nipania Vikash Seva Trust
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-slate-200 text-[9px] text-slate-400 font-mono relative z-10">
            This is a computer-generated digital Section 80G Tax Exemption Certificate issued by Nipania Vikash Seva Trust on {new Date().toLocaleDateString('en-IN')}.
            <br />
            Portal: {trustMeta.website} | Verification: {trustMeta.website}/verify | Support: {trustMeta.email}
          </div>
        </div>
      </div>

      {/* Print Stylesheet Overrides */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
