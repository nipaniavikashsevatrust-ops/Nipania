'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Heart } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500 text-navy-950 text-xs font-bold py-2 px-3 sm:px-4 shadow-sm relative overflow-hidden z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Left: Appeal Tag & Message */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-950 text-gold-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-gold-400 shrink-0" />
            <span className="hidden xs:inline">URGENT SEVA APPEAL</span>
            <span className="xs:hidden">RELIEF</span>
          </span>

          <p className="text-[11px] sm:text-xs font-bold text-navy-950 truncate font-heading">
            <strong className="hidden sm:inline">Flood & Community Relief:</strong> Deploying food rations, medical camps & clean water.
          </p>
        </div>

        {/* Right: Direct Donation CTA */}
        <div className="flex items-center shrink-0">
          <Link
            href="/donate"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black bg-navy-950 text-gold-300 hover:bg-navy-900 transition-all shadow-xs active:scale-95 whitespace-nowrap"
          >
            <Heart className="w-3 h-3 fill-gold-400 text-gold-400 shrink-0" />
            <span className="hidden xs:inline">Support Relief</span>
            <span className="xs:hidden">Support</span>
            <ArrowRight className="w-2.5 h-2.5 shrink-0 hidden sm:inline" />
          </Link>
        </div>

      </div>
    </div>
  );
}
