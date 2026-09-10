import React from 'react';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function DonationPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
              Donation & Refund Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organization: <strong>NIPANIA VIKASH SEVA TRUST</strong> (Registered Public Charitable Trust)
            </p>
          </div>

          <p>
            Nipania Vikash Seva Trust is a registered public charitable trust. We adhere to the highest standards of financial integrity, fund utilization accountability, and statutory compliance.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">1. Donation Receipts & Documentation</h3>
          <p>
            Every donation processed through our online gateway generates an instant official digital receipt containing the donor name, contribution amount, and unique serial identifier.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">2. Fund Utilization</h3>
          <p>
            Contributions are directed strictly toward charitable initiatives (educational materials, healthcare diagnosis, rural livelihood development, and emergency relief) as designated by the donor.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">3. Refund Policy</h3>
          <p>
            Donations made erroneously or in duplicate will be refunded upon written request submitted to <a href="mailto:info@nipaniatrust.org" className="text-gold-600 font-bold">info@nipaniatrust.org</a> within 7 business days, accompanied by transaction proof.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
