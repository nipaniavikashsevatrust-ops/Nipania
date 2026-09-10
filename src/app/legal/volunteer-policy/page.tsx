import React from 'react';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function VolunteerPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
              Volunteer Code of Conduct
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organization: <strong>NIPANIA VIKASH SEVA TRUST</strong> (Registered Public Charitable Trust)
            </p>
          </div>

          <p>
            Volunteers are the vital backbone of Nipania Vikash Seva Trust. To preserve community trust and safety, all registered volunteers agree to abide by this Code of Conduct.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">1. The Core Ethos</h3>
          <p>
            Volunteers must act with humility, integrity, and respect for all community beneficiaries, embodying the core values of <em>Seva (Service), Vikash (Progress), and Samarpan (Dedication)</em>.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">2. Identity Card & Authorization</h3>
          <p>
            Official ID cards are issued exclusively to approved volunteers. Volunteers must present their verified card during field activities. Unauthorized collection of cash or donations without prior written approval is strictly prohibited.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">3. Zero Discrimination Policy</h3>
          <p>
            Nipania Vikash Seva Trust strictly enforces a zero-discrimination policy across all programs regardless of caste, creed, religion, gender, or social status.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
