import React from 'react';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { ShieldCheck, Heart, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function VolunteerPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-gold-600 font-bold uppercase tracking-widest text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Governance & Legal Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
              Official Volunteer Policy & Code of Association
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Established under the Trust Deed of <strong>H.R. MEMORIAL EDUCATIONAL AND WELFARE TRUST</strong> (operating as Nipania Vikash Seva Trust).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">Foundational Participation Notice:</strong>
              Volunteering is entirely voluntary. Association as a volunteer does not establish an employment relationship, agency, trusteeship, governance ownership, or legal office-bearer authority within the Trust.
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Voluntary Service & Application Discretion
            </h2>
            <p>
              Participation in Trust community drives, healthcare camps, literacy programs, and relief operations is conducted on a purely voluntary, honorary basis. Submission of an online volunteer application does not guarantee acceptance. The Trust reserves full discretion to accept, defer, request corrections on, or reject any application based on community suitability and organizational needs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Legal Nature of Volunteer ID Card
            </h2>
            <p>
              Upon verification and formal approval by the Board of Trustees, an official Volunteer Identity Card with server-verified QR authentication may be issued. The holder explicitly acknowledges and agrees to the following legal constraints:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>The ID card serves exclusively as proof of volunteer identity and active community association during authorized Trust activities.</li>
              <li>The card <strong>does not confer trusteeship, ownership, voting rights, office-bearer status, or any right to manage or control the Trust or its assets</strong>.</li>
              <li>The card remains the property of the Trust and must be returned or surrendered immediately upon suspension, revocation, or resignation of volunteer association.</li>
              <li>Volunteers may not represent themselves as Trustees, Directors, Managing Committee members, or legal representatives of the Trust without specific written authorization.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. Prohibition on Unauthorized Fund Collection
            </h2>
            <p>
              Volunteers are strictly prohibited from collecting cash, donations, or physical contributions on behalf of the Trust without prior formal written authorization from the Managing Trustee. All official donations must be routed transparently through the official banking accounts, registered UPI IDs, or online payment gateways of the Trust, for which official Section 80G receipts are generated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              4. Code of Conduct & Integrity
            </h2>
            <p>
              All volunteers agree to act with dignity, honesty, empathy, and respect for rural beneficiaries, grassroots women, elders, and children. The Trust maintains a strict zero-tolerance policy towards discrimination based on religion, caste, creed, ethnicity, gender, or social background.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              5. Suspension & Revocation of Association
            </h2>
            <p>
              The Trust reserves the unreserved authority to suspend, deactivate, or formally revoke the volunteer credentials of any individual who violates this policy, misuses Trust property or identification cards, engages in illegal conduct, or compromises the reputation of the Trust. Upon revocation, the volunteer status will reflect immediately as <strong>REVOKED</strong> on the public server-verified QR verification portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              6. Privacy & Data Handling
            </h2>
            <p>
              Personal details submitted during volunteer registration are handled in accordance with our Privacy Policy. Personal telephone numbers, residential addresses, and private identification records are kept confidential and are never published on the public QR verification portal. Public verification discloses only the volunteer's assigned ID number, full name, category, issue date, and live validity status.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
            For inquiries regarding volunteer opportunities or policy compliance, contact the Administration Desk at{' '}
            <a href="mailto:info@nipaniatrust.org" className="text-navy-900 font-bold underline">
              info@nipaniatrust.org
            </a>.
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
