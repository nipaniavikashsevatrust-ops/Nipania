'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Repeat, Building2, CheckCircle2, ArrowRight, Sparkles, Mail } from 'lucide-react';

export default function WaysToHelpSection() {
  return (
    <section className="py-20 bg-warm-50 border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="title-ornament mb-2">
            <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
              Support Our Cause
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
            How Can You Support Nipania Trust?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every contribution — whether an individual gift, a monthly seva pledge, or a corporate CSR partnership — directly fuels on-ground humanitarian assistance.
          </p>
        </div>

        {/* 3 Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: One-Time Donation */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-700 flex items-center justify-center font-bold border border-gold-400/40">
                <Heart className="w-7 h-7 fill-gold-500 text-gold-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-navy-950 font-heading">
                  One-Time Contribution
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Make an immediate difference. Your contribution funds emergency food supplies, medical camps, and essential care.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant official digital receipt via email</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% transparent fund utilization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct allocation to chosen cause</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/donate"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-md transition-all"
              >
                <span>Make a Donation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Monthly Giving (Featured - High Contrast Spotlight) */}
          <div className="bg-gradient-to-b from-[#0f2d52] via-[#0d2644] to-[#0a1e36] text-white rounded-3xl p-8 border-2 border-gold-400 shadow-2xl relative flex flex-col justify-between group transform lg:-translate-y-2 ring-4 ring-gold-400/20">
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-gold-400 to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              HIGHEST SUSTAINED IMPACT
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-300 flex items-center justify-center font-bold border border-gold-400/40">
                <Repeat className="w-7 h-7 text-gold-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Monthly Seva Partner
                </h3>
                <p className="text-xs text-blue-100/80 mt-2 leading-relaxed">
                  Become a continuous patron. Recurring monthly support helps us run uninterrupted village medical drives and child education centers.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Predictable grassroots planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Annual impact newsletter & reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Pause, modify or cancel anytime</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/15">
              <Link
                href="/donate?type=monthly"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-slate-950 font-black shadow-gold transition-all active:scale-95"
              >
                <span>Start Monthly Giving</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: CSR & Community Partnership */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-100 text-navy-900 flex items-center justify-center font-bold border border-navy-200">
                <Building2 className="w-7 h-7 text-navy-800" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-navy-950 font-heading">
                  Corporate CSR Partner
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Collaborate with Nipania Trust for Corporate Social Responsibility programs in health, village development, and youth education.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom CSR social project planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comprehensive impact audits & metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct ground implementation</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all"
              >
                <Mail className="w-4 h-4 text-gold-400" />
                <span>Contact Partnerships Team</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
