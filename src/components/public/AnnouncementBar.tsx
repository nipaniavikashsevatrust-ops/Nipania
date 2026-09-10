'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-blue-100 text-[11px] py-1.5 sm:py-2 px-3 sm:px-6 border-b border-blue-800/60 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 whitespace-nowrap">
        {/* Left: Organization Status */}
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="inline-flex items-center gap-1.5 text-gold-400 font-bold tracking-wider uppercase text-[10px] sm:text-[11px] truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-xs shadow-emerald-400" />
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className="hidden sm:inline">Govt. Registered Public Charitable Trust</span>
            <span className="sm:hidden font-bold">Regd. NGO Trust</span>
          </span>
          <span className="hidden md:inline text-blue-400/50">|</span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-blue-200 text-xs">
            <Mail className="w-3 h-3 text-gold-400 shrink-0" /> info@nipaniatrust.org
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-blue-200 text-xs">
            <Phone className="w-3 h-3 text-gold-400 shrink-0" /> +91 98765 43210
          </span>
        </div>

        {/* Right: Quick Links strictly aligned on a single baseline */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 text-[10px] sm:text-[11px] font-medium">
          <Link 
            href="/verify" 
            className="text-blue-200 hover:text-gold-300 transition-colors inline-flex items-center gap-1 font-semibold"
          >
            <ShieldCheck className="w-3 h-3 text-gold-400 shrink-0" />
            <span>Verify ID</span>
          </Link>
          <span className="text-blue-400/50">•</span>
          <Link 
            href="/admin/login" 
            className="text-gold-300 hover:text-white transition-colors font-bold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-gold-400/30"
          >
            <span>Admin</span>
            <ExternalLink className="w-2.5 h-2.5 text-gold-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
