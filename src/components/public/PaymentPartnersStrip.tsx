'use client';

import React from 'react';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

export default function PaymentPartnersStrip() {
  return (
    <section className="py-8 bg-white border-t border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-heading">
          Supported Donation Payment Modes • 100% Safe & Encrypted
        </h4>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-extrabold text-navy-950 font-mono">UPI</span>
            <span className="text-[10px] text-slate-400">GPay / PhonePe / Paytm</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <CreditCard className="w-4 h-4 text-gold-600" />
            <span className="font-semibold text-navy-950">Debit & Credit Cards</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-navy-950">NetBanking</span>
            <span className="text-[10px] text-slate-400">All Indian Banks</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-emerald-800">256-Bit SSL Secure Gateway</span>
          </div>
        </div>
      </div>
    </section>
  );
}
