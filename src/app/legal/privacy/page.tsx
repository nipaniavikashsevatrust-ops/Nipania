import React from 'react';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organization: <strong>NIPANIA VIKASH SEVA TRUST</strong> (Registered Public Charitable Trust)
            </p>
          </div>

          <p>
            At Nipania Vikash Seva Trust, we are committed to upholding the highest standards of data privacy and information security. This Privacy Policy details how we collect, handle, and protect personal information provided by donors, volunteers, members, event attendees, and visitors.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">1. Information We Collect</h3>
          <p>We only collect information strictly necessary for charitable operations, compliance, and communication, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Donor names, email addresses, contact numbers, and optional PAN numbers for digital receipt generation.</li>
            <li>Volunteer and Member applicant details, including emergency contact information and qualifications.</li>
            <li>Event registrations and newsletter subscription email addresses.</li>
          </ul>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">2. How We Use Information</h3>
          <p>Your information is used solely to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process donations and issue verifiable digital receipts.</li>
            <li>Issue and verify official Volunteer, Member, and Representative Identity Cards.</li>
            <li>Send program updates, newsletters, and event confirmation details.</li>
            <li>Comply with Indian statutory filing and non-profit reporting mandates.</li>
          </ul>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">3. Zero Data Commercialization</h3>
          <p>
            Nipania Vikash Seva Trust never sells, rents, leases, or trades personal information to commercial third parties or advertisers.
          </p>

          <h3 className="text-base font-bold text-navy-950 font-heading pt-2">4. Contact Grievance Officer</h3>
          <p>
            For any queries or requests regarding your stored personal data, please contact:
            <br />
            <strong>Trust Secretary</strong>, Nipania Vikash Seva Trust
            <br />
            Email: <a href="mailto:info@nipaniatrust.org" className="text-gold-600 font-bold">info@nipaniatrust.org</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
