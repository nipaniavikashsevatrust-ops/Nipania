'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, X, ShieldCheck, ArrowRight, Minus, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RecentDonation {
  id: string;
  donorName: string;
  donorCity: string;
  amount: number;
  cause: string;
  timeAgo: string;
  type?: string;
}

export default function RecentDonationToast() {
  const pathname = usePathname();
  const [donations, setDonations] = useState<RecentDonation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const isPausedRef = useRef(false);

  // Hide on admin routes or while donor is already on donate checkout page
  const shouldHide = pathname.startsWith('/admin') || pathname === '/donate';

  useEffect(() => {
    if (shouldHide || isDismissed) return;

    let isMounted = true;
    async function loadRecentDonations() {
      try {
        const res = await fetch('/api/donations/recent');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.donations && data.donations.length > 0) {
            setDonations(data.donations);
          }
        }
      } catch (err) {
        console.warn('Could not load recent donations feed:', err);
      }
    }

    loadRecentDonations();
    return () => {
      isMounted = false;
    };
  }, [shouldHide, isDismissed]);

  // Auto-cycle through recent donations every 7 seconds when not paused
  useEffect(() => {
    if (shouldHide || isDismissed || donations.length === 0) return;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % donations.length);
        setIsFading(false);
      }, 300); // 300ms fade transition
    }, 7000);

    return () => clearInterval(interval);
  }, [shouldHide, isDismissed, donations.length]);

  if (shouldHide || isDismissed || donations.length === 0) {
    return null;
  }

  const current = donations[currentIndex] || donations[0];

  // Minimized Compact Floating Chip View (tap anywhere on chip to maximize)
  if (isMinimized) {
    return (
      <aside
        aria-label="Recent donor activity"
        className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-50 max-w-[calc(100vw-24px)] pb-[env(safe-area-inset-bottom,0px)] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMinimized(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsMinimized(false);
            }
          }}
          className="flex items-center gap-2 bg-[#0c2444]/95 backdrop-blur-md border-2 border-gold-400 hover:border-gold-300 text-white pl-3 pr-2 py-1.5 rounded-full shadow-2xl cursor-pointer active:scale-95 transition-all select-none group"
          title="Click to expand donation alert"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 group-hover:text-white truncate max-w-[140px] xs:max-w-[200px]">
            {current.donorName} donated{' '}
            <strong className="text-gold-300 font-mono">{formatCurrency(current.amount)}</strong>
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-gold-400 shrink-0 group-hover:scale-125 transition-transform" />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(() => setIsDismissed(true), 200);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/20 transition-colors ml-0.5"
            title="Dismiss"
            aria-label="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </aside>
    );
  }

  // Full Notification Card View
  return (
    <aside
      aria-label="Recent donor activity"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
      onTouchStart={() => { isPausedRef.current = true; }}
      onTouchEnd={() => { isPausedRef.current = false; }}
      className={`fixed inset-x-2.5 sm:inset-x-auto sm:left-6 bottom-2.5 sm:bottom-6 z-40 max-w-[calc(100vw-20px)] sm:max-w-[360px] pb-[env(safe-area-inset-bottom,0px)] transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative bg-[#0c2444]/95 backdrop-blur-xl border border-gold-400/50 text-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-950/40 hover:border-gold-400/80 transition-colors pointer-events-auto">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Header Action Controls (Minimize & Dismiss) */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white active:scale-90 transition-all flex items-center justify-center min-w-[28px] min-h-[28px]"
            title="Minimize alert"
            aria-label="Minimize recent donation notification"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(() => setIsDismissed(true), 300);
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 text-slate-300 hover:text-white active:scale-90 transition-all flex items-center justify-center min-w-[28px] min-h-[28px]"
            title="Dismiss notification"
            aria-label="Close recent donation notification"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className={`flex items-start gap-2 sm:gap-3 transition-opacity duration-300 ${isFading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
          {/* Pulsing Avatar / Heart Badge */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md border border-emerald-400/40">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-white text-white animate-pulse" />
            </div>
            {/* Live green beacon */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 border border-[#0c2444]"></span>
            </span>
          </div>

          {/* Donor details */}
          <div className="flex-1 min-w-0 pr-8 sm:pr-10">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
                {current.donorName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400">
                from {current.donorCity}
              </span>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-200 mt-0.5 leading-snug line-clamp-2 sm:line-clamp-none">
              donated{' '}
              <span className="font-extrabold text-gold-300 font-mono">
                {formatCurrency(current.amount)}
              </span>{' '}
              {current.type === 'MONTHLY' && (
                <span className="text-[9px] sm:text-[10px] text-teal-300 font-semibold">(Monthly)</span>
              )}{' '}
              for <span className="text-slate-100 font-medium">{current.cause}</span>
            </p>

            <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-2 pt-1 sm:pt-1.5 border-t border-white/10 text-[9px] sm:text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Verified · {current.timeAgo}</span>
              </span>

              <Link
                href="/donate"
                className="inline-flex items-center gap-0.5 sm:gap-1 text-gold-400 hover:text-gold-300 font-bold transition-colors shrink-0"
              >
                <span>Support Cause</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
