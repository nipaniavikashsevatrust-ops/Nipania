'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Section80GCertificate, {
  Section80GDonationData,
  Section80GTrustMeta,
} from '@/components/common/Section80GCertificate';
import { Printer, Download, ArrowLeft, ShieldCheck, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PublicDonationReceiptPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [donation, setDonation] = useState<Section80GDonationData | null>(null);
  const [trustMeta, setTrustMeta] = useState<Section80GTrustMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rawId) return;

    // 1. Fetch donation details
    fetch(`/api/donations?search=${encodeURIComponent(rawId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.donations && data.donations.length > 0) {
          const match =
            data.donations.find(
              (d: any) =>
                d.donationId?.toUpperCase() === rawId.toUpperCase() ||
                d.id === rawId ||
                d.paymentId === rawId
            ) || data.donations[0];
          setDonation(match);
        } else {
          setError('No donation record found matching this Receipt or Reference ID.');
        }
      })
      .catch((err) => {
        console.error('Failed to load donation receipt:', err);
        setError('Failed to retrieve donation receipt details.');
      })
      .finally(() => setLoading(false));

    // 2. Fetch trust metadata
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTrustMeta(data.settings);
        }
      })
      .catch((err) => console.warn('Could not load settings:', err));
  }, [rawId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-700 font-bold text-sm">
              Loading official Section 80G receipt certificate...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-navy-950">Receipt Not Found</h1>
            <p className="text-slate-600 text-xs leading-relaxed">
              {error || 'We could not locate a verified Section 80G tax receipt for ID: ' + rawId}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/donate"
                className="px-5 py-2.5 rounded-xl bg-navy-950 text-white text-xs font-bold hover:bg-navy-900 transition-colors"
              >
                Donate to Nipania Trust
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {/* Public Page UI (Hidden during print) */}
      <div className="no-print flex flex-col min-h-screen bg-slate-100">
        <AnnouncementBar />
        <Navbar />

        {/* Top Floating Control Bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-800 px-4 sm:px-8 py-3.5 border-b border-amber-300 shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                  Official Section 80G Tax Exemption Certificate
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  Receipt: <strong className="text-slate-900">{donation.donationId}</strong> • Contributor:{' '}
                  <strong className="text-slate-900">{donation.donorName}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <a
                href={`/api/donations/${donation.donationId}/receipt`}
                download={`80G_Receipt_${donation.donationId}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>Download PDF</span>
              </a>

              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main On-Screen Certificate Preview */}
        <main className="flex-1 py-8 sm:py-12 px-2 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 p-2 sm:p-6">
              <Section80GCertificate donation={donation} trustMeta={trustMeta} />
            </div>

            {/* Form 10BE Annual Compliance & Download Section */}
            <div className="mt-8 bg-white shadow-xl rounded-2xl border border-slate-200 p-6">
              {donation.tenBeStatus === 'UPLOADED' && donation.tenBePdfUrl ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/80 border border-emerald-200 rounded-xl p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Official Form 10BE Certificate Issued</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed max-w-xl">
                      Your statutory Form 10BE (Certificate of Donation under Section 80G) for Financial Year{' '}
                      <strong>{donation.financialYear || '2025-26'}</strong> has been issued by the Income Tax Department of India and is ready for download.
                    </p>
                    {donation.tenBeNumber && (
                      <div className="text-[11px] font-mono text-emerald-950 font-bold mt-1">
                        Certificate No: {donation.tenBeNumber}
                      </div>
                    )}
                  </div>
                  <a
                    href={`/api/donations/${donation.id || donation.donationId}/10be?token=${donation.secureAccessToken || ''}&download=true`}
                    download
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Form 10BE (PDF)</span>
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-primary-600" />
                    <span>Annual Income Tax Return (Form 10BD / Form 10BE) Status</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This signed Section 80G receipt serves as your immediate acknowledgement of donation. In accordance with Rule 18AB of the Income Tax Rules, 1962, charitable trusts are required to electronically file an annual statement of donations in <strong>Form 10BD</strong> on or before 31st May following the financial year.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Financial Year</span>
                      <span className="font-bold text-navy-900">{donation.financialYear || '2025-26'}</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Filing Statement</span>
                      <span className="font-bold text-navy-900">
                        {donation.tenBdStatus === 'FILED' ? 'Form 10BD Filed' : 'Scheduled for Annual 10BD'}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Certificate Delivery</span>
                      <span className="font-bold text-navy-900 truncate" title={donation.donorEmail}>
                        Direct to {donation.donorEmail || 'Registered Email'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Dedicated Print Container (Hidden on screen, rendered on native print) */}
      <div className="receipt-print-area hidden print:block">
        <Section80GCertificate donation={donation} trustMeta={trustMeta} />
      </div>
    </>
  );
}
