'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ShieldCheck, Globe, User, Activity, ExternalLink } from 'lucide-react';

export default function AdminNavbar({
  user,
  onToggleSidebar,
}: {
  user?: any;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* Left: Mobile Toggle & Trust Identification */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-slate-900 text-sm hidden md:inline font-heading">
            Nipania Vikash Seva Trust
          </span>
          <span className="hidden md:inline text-slate-300">•</span>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50/90 px-2.5 py-1 rounded-full border border-amber-300/80 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Public Charitable Trust</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Website Switcher & Admin Identity */}
      <div className="flex items-center gap-3.5">
        
        {/* Live Public Site Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-950 bg-blue-50/80 hover:bg-blue-100/80 transition-all border border-blue-200/80 shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Live Site</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* System Health / Status Indicator */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs border border-gold-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="font-bold text-slate-900 block text-xs leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Active</span>
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
