'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Heart,
  ChevronDown,
  Users,
  UserPlus,
  Sparkles,
  Home,
  Info,
  FolderKanban,
  FileCheck,
  Phone,
  ShieldCheck,
  Award,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Menu,
  X,
  Building2,
  HeartHandshake,
} from 'lucide-react';

interface SubNavItem {
  name: string;
  href: string;
  icon: any;
  desc?: string;
  description?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  submenu?: SubNavItem[];
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About Us', href: '/about', icon: Info },
  { name: 'Campaigns', href: '/campaigns', icon: FolderKanban },
  {
    name: 'Get Involved',
    href: '/volunteer',
    icon: Users,
    submenu: [
      {
        name: 'Volunteer',
        href: '/volunteer',
        icon: HeartHandshake,
        desc: 'Join as a volunteer & create grassroots impact',
      },
      {
        name: 'CSR Partnerships',
        href: '/csr',
        icon: Building2,
        desc: 'Schedule VII CSR projects & Section 80G tax benefits',
      },
    ],
  },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/98 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-b border-slate-200/90 py-2 sm:py-2.5' 
            : 'bg-white/95 backdrop-blur-md border-b border-slate-200/70 py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
            
            {/* Official Trust Brand Logo & Typography */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white p-0.5 shadow-sm border-2 border-amber-400 transition-all duration-300 group-hover:scale-105 shrink-0 group-hover:border-amber-500">
                <Image
                  src="/logo.png"
                  alt="Nipania Vikash Seva Trust Logo"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs xs:text-sm sm:text-[15px] font-black tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors uppercase leading-tight font-heading truncate">
                  Nipania Vikash Seva Trust
                </span>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-600 uppercase truncate mt-0.5">
                  SEVA • VIKASH • SAMARPAN
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Cleanly visible on xl: screens without overflow) */}
            <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;

                if (item.submenu) {
                  const isSubActive = item.submenu.some((s) => pathname.startsWith(s.href));
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className={`px-3 py-2 text-xs 2xl:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                          isSubActive
                            ? 'text-amber-800 bg-amber-50 border border-amber-300 shadow-2xs'
                            : 'text-slate-700 hover:text-amber-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-amber-600' : 'text-slate-400'}`} />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute top-full left-0 w-80 pt-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 space-y-1">
                            {item.submenu.map((sub) => {
                              const SubIcon = sub.icon;
                              const isCurrent = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => setDropdownOpen(false)}
                                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                                    isCurrent
                                      ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-amber-800'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200/80 text-amber-700 mt-0.5">
                                    <SubIcon className="w-4 h-4" />
                                  </div>
                                  <div className="text-left min-w-0">
                                    <span className="block text-xs font-bold leading-tight text-navy-950">{sub.name}</span>
                                    <span className="text-[10.5px] text-slate-500 block mt-0.5 leading-snug">{sub.desc}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-xs 2xl:text-sm font-bold rounded-full transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-amber-800 bg-amber-50 border border-amber-300 shadow-2xs'
                        : 'text-slate-700 hover:text-amber-700 hover:bg-slate-100/80'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action CTAs: Sponsor & Donate */}
            <div className="hidden xl:flex items-center gap-2.5 shrink-0">
              <Link
                href="/sponsor"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50/90 hover:bg-amber-100 border border-amber-300 hover:border-amber-400 transition-all whitespace-nowrap shadow-2xs active:scale-95 leading-none shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>SPONSOR A CAUSE</span>
              </Link>

              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.45)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap leading-none shrink-0"
              >
                <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                <span>DONATE NOW</span>
              </Link>
            </div>

            {/* Responsive Action Buttons & Modern Hamburger/Close Toggle Button (Displays below xl) */}
            <div className="flex xl:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-sm active:scale-95 transition-transform whitespace-nowrap leading-none shrink-0"
                aria-label="Donate"
              >
                <Heart className="w-3 h-3 fill-white shrink-0" />
                <span>DONATE</span>
              </Link>

              {/* Clear, High-Contrast Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 touch-manipulation border shrink-0 cursor-pointer active:scale-95 select-none ${
                  mobileMenuOpen
                    ? 'bg-amber-500 border-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                    : 'bg-slate-100 hover:bg-slate-200/90 border-slate-300 text-slate-800 shadow-2xs'
                }`}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white stroke-[2.5]" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-800 stroke-[2.5]" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Drawer (Zero space at top, dedicated close header & smooth scroll) */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Dedicated Drawer Top Bar with Trust Branding and Unmistakable Close Button */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-white border-b border-slate-200 shadow-2xs shrink-0">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-amber-400 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Nipania Vikash Seva Trust Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 tracking-tight leading-tight truncate">
                  NIPANIA VIKASH SEVA TRUST
                </div>
                <div className="text-[9px] font-extrabold text-amber-600 tracking-wider">
                  SEVA • VIKASH • SAMARPAN
                </div>
              </div>
            </Link>

            {/* Clear, Prominent Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-300 transition-all cursor-pointer shrink-0 shadow-2xs"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 text-slate-800 stroke-[2.5]" />
            </button>
          </div>

          {/* Scrollable Drawer Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-12 space-y-4 max-w-lg mx-auto w-full">
            
            {/* Trust Identity Pill Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-warm-50 to-amber-50/80 rounded-2xl p-3 border border-amber-200/80 shadow-xs flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-bold text-amber-950 truncate">
                  Govt. Regd. Public Charitable Trust • Section 80G
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300/60 shrink-0">
                Verified
              </span>
            </div>

            {/* Navigation Items List */}
            <div className="space-y-1.5">
              {MAIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                if (item.submenu) {
                  const isSubActive = item.submenu.some((s) => pathname.startsWith(s.href));
                  return (
                    <div key={item.name} className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isSubActive ? 'text-amber-900 bg-amber-50/80 font-black' : 'text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSubActive ? 'bg-amber-500 text-white border-amber-500 shadow-2xs' : 'bg-white text-amber-600 border-slate-200'
                          }`}>
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">{item.name}</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-amber-600 transition-transform duration-200 ${
                            mobileSubmenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Submenu Accordion Items */}
                      {mobileSubmenuOpen && (
                        <div className="p-1.5 pt-0 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                          {item.submenu.map((sub) => {
                            const SubIcon = sub.icon;
                            const isCurrent = pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-colors ${
                                  isCurrent ? 'bg-amber-100/70 text-amber-950 font-bold' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                                  <SubIcon className="w-3.5 h-3.5 text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800">{sub.name}</div>
                                  <div className="text-[11px] text-slate-500 leading-tight">{sub.desc}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                        : 'bg-slate-50/50 hover:bg-slate-100/80 text-slate-700 border-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive ? 'bg-amber-500 text-white border-amber-500 shadow-2xs' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">{item.name}</span>
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Quick Action CTAs: Sponsor & Donate */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <Link
                href="/sponsor"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs border border-amber-300 text-amber-800 bg-amber-50/90 hover:bg-amber-100 active:scale-98 transition-all shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>SPONSOR A CAUSE</span>
              </Link>

              <Link
                href="/donate"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md active:scale-98 transition-all"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>DONATE TO ACTIVE SEVA</span>
              </Link>
            </div>

            {/* Useful Mobile Helpline & Verification Strip */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-bold">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 active:scale-95 transition-all truncate"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">WhatsApp Help</span>
              </a>
              <Link
                href="/csr"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 active:scale-95 transition-all truncate"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">CSR Desk</span>
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
