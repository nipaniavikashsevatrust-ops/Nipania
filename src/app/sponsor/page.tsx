import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import EmergencyBanner from '@/components/public/EmergencyBanner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import DirectDonationSection from '@/components/public/DirectDonationSection';
import SponsorTiersClient from '@/components/public/SponsorTiersClient';
import {
  Heart,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  HelpCircle,
} from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Sponsor a Cause — Choose How You Help | Nipania Vikash Seva Trust',
  description:
    'Sponsor meals, child education, menstrual hygiene drives, and rural healthcare clinics. Every contribution funds a specific verified outcome with 100% transparency and Section 80G tax exemption.',
};

export default function SponsorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-warm-50 text-slate-800">
      {/* 1. Header Bar */}
      <AnnouncementBar />
      <EmergencyBanner />
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-amber-50/50 via-white to-warm-50/40">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>SPONSOR A CAUSE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight sm:leading-tight text-slate-900">
              Choose How You Help
            </h1>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Every tier funds a specific, verified outcome — hot nutritious meals on plates, sanitary dignity kits in hands, annual schooling for rural girls, and doctor consultations in remote hamlets. Pick a cause, pick a tier.
            </p>

            {/* Quick Trust Highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Section 80G Tax Exemption</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">100% Direct Field Delivery</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">Instant Digital PDF Receipt</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Sponsorship Tiers */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SponsorTiersClient />
          </div>
        </section>

        {/* 4. Direct Bank Transfer & Official UPI QR Code */}
        <div className="border-t border-slate-200 bg-white">
          <DirectDonationSection />
        </div>

        {/* 5. How Sponsorship Works (3-Step Clarity) */}
        <section className="py-16 sm:py-20 bg-slate-50/80 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-2">
                TRANSPARENT JOURNEY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                How Your Sponsorship Creates Direct Impact
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all text-center group">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-extrabold text-xl flex items-center justify-center mx-auto mb-4 border border-amber-300 shadow-xs">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Select a Tangible Cause</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Choose the specific initiative you want to fund — from a single child's school kit to an entire day of community langar seva.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all text-center group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-xl flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-xs">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Instant 80G Tax Receipt</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upon secure online checkout or UTR entry, your formal Section 80G voucher is generated immediately with 1-click print and download.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all text-center group">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-extrabold text-xl flex items-center justify-center mx-auto mb-4 border border-teal-300 shadow-xs">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Verified On-Ground Seva</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our dedicated field volunteers deploy rations, medicines, and kits directly to beneficiaries with zero intermediary leakages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Frequently Asked Questions about Sponsorship */}
        <section className="py-16 sm:py-20 border-t border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-2">
                SPONSORSHIP FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  What is the difference between a Campaign and a Sponsorship?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  <strong>Campaigns</strong> are time-bound emergency responses or major community targets (e.g. Flood Relief 2026, Blanket Drive) with collective funding goals. <strong>Sponsorships</strong> allow you to fund a specific tangible unit of impact (e.g. feed 12 people, provide 1 child's school uniform, sponsor 1 day of a community kitchen) either as a one-time gift or monthly recurring partner.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Is my sponsorship eligible for 80G tax benefits?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  Yes! Nipania Vikash Seva Trust is an officially registered public charitable organization under Section 80G of the Indian Income Tax Act. Indian taxpayers can claim a 50% deduction on their taxable income.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Can I sponsor via direct Bank Transfer (NEFT/RTGS/IMPS) or UPI?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  Absolutely. You can scan our official Trust UPI QR code or transfer directly to our State Bank of India account detailed above. After transferring, simply enter your UTR/Reference number in our direct checkout form to receive your 80G receipt voucher.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
