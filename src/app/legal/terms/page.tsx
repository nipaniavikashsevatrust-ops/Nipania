import React from 'react';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organization: <strong>NIPANIA VIKASH SEVA TRUST</strong> (Registered Public Charitable Trust)
            </p>
          </div>

          <p>
            Welcome to the official website and management portal of Nipania Vikash Seva Trust. By accessing this platform or engaging with our charitable activities, you agree to comply with and be bound by the following terms.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">1. Official Identity & Representation</h3>
          <p>
            All active representatives, staff, members, and volunteers must hold a verified digital identity issued through this system. Anyone representing the Trust must produce verifiable credentials at <a href="/verify" className="text-gold-600 font-bold">/verify</a>.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">2. Voluntary Contributions</h3>
          <p>
            All donations are voluntary contributions towards the non-profit objectives of the Trust. Donors receive official receipts generated with unique serial codes.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">3. Intellectual Property</h3>
          <p>
            The official Trust logo, emblem, motto <em>"SEVA | VIKASH | SAMARPAN"</em>, and published material remain the property of Nipania Vikash Seva Trust and may not be used without written authorization.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
