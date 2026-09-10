'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, ChevronDown, Users, UserPlus, Calendar, Sparkles } from 'lucide-react';

const MAIN_NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Our Work', href: '/work' },
  {
    name: 'Get Involved',
    href: '#',
    submenu: [
      { name: 'Become a Volunteer', href: '/volunteer', desc: 'Join on-ground community welfare drives', icon: Users },
      { name: 'Become a Member', href: '/membership', desc: 'Official trust membership & governance', icon: UserPlus },
      { name: 'Community Events', href: '/campaigns', desc: 'Health camps & environmental drives', icon: Calendar },
    ],
  },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(68);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update header height dynamically for exact mobile drawer alignment
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [scrolled]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
            
            {/* Official Trust Brand Logo & Typography */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink min-w-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white p-0.5 shadow-sm border-2 border-amber-400 transition-all duration-300 group-hover:scale-105 shrink-0 group-hover:border-amber-500">
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
                <span className="text-[9px] xs:text-[10px] font-bold tracking-wider text-amber-600 uppercase truncate mt-0.5">
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
                        className={`px-3 py-2 text-xs 2xl:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isSubActive
                            ? 'text-amber-800 bg-amber-50 border border-amber-300 shadow-2xs'
                            : 'text-slate-700 hover:text-amber-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-amber-600' : 'text-slate-400'}`} />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute top-full left-0 w-72 pt-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1">
                            {item.submenu.map((sub) => {
                              const SubIcon = sub.icon;
                              const isCurrent = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                                    isCurrent
                                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/80'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-amber-700'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 text-amber-600">
                                    <SubIcon className="w-4 h-4" />
                                  </div>
                                  <div className="text-left">
                                    <span className="block text-xs font-bold leading-tight">{sub.name}</span>
                                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">{sub.desc}</span>
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

            {/* Responsive Action Buttons & Mobile Drawer Trigger (Displays below xl) */}
            <div className="flex xl:hidden items-center gap-2 shrink-0">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md active:scale-95 transition-transform whitespace-nowrap leading-none shrink-0"
                aria-label="Donate"
              >
                <Heart className="w-3.5 h-3.5 fill-white shrink-0" />
                <span>DONATE</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-800 hover:text-slate-950 hover:bg-slate-100 focus:outline-none active:scale-95 transition-all touch-manipulation border border-slate-200 shrink-0 cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-down Responsive Menu Drawer (Mounted outside header to guarantee full viewport visibility) */}
      {mobileMenuOpen && (
        <div
          style={{ top: `${headerHeight}px` }}
          className="xl:hidden fixed inset-x-0 bottom-0 z-50 bg-white/98 backdrop-blur-2xl border-t border-slate-200 overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-4 sm:p-6 pb-28 space-y-4 max-w-lg mx-auto">
            {/* Nav Links */}
            <div className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => {
                if (item.submenu) {
                  const isSubActive = item.submenu.some((s) => pathname.startsWith(s.href));
                  return (
                    <div key={item.name} className="py-1 border-b border-slate-100">
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                          isSubActive ? 'text-amber-800 bg-amber-50' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-600" />
                          <span>{item.name}</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-amber-600 transition-transform duration-200 ${
                            mobileSubmenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Submenu Accordion Items */}
                      {mobileSubmenuOpen && (
                        <div className="mt-1 space-y-1 pl-2 pr-1 pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
                          {item.submenu.map((sub) => {
                            const SubIcon = sub.icon;
                            const isCurrent = pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                  isCurrent
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <SubIcon className="w-4 h-4 text-amber-600 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                                    {sub.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 mt-0.5 truncate leading-snug">
                                    {sub.desc}
                                  </span>
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
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions: Sponsor & Donate */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <Link
                href="/sponsor"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>SPONSOR A CAUSE</span>
              </Link>

              <Link
                href="/donate"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-lg active:scale-98 transition-all"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>DONATE NOW</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
