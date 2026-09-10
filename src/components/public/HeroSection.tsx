'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Heart, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Award,
  FileCheck,
  QrCode,
  IndianRupee,
  Camera
} from 'lucide-react';

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=85',
    cause: 'RURAL VILLAGE FAMILIES',
    title: 'Emergency Flood Relief, Nutrition & Ration Kits',
    tag: 'Direct Field Relief',
  },
  {
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=85',
    cause: 'UNDERPRIVILEGED CHILDREN',
    title: 'Free Primary School Kits, Daily Meals & Tutoring',
    tag: 'Child Vidya Daan',
  },
  {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
    cause: 'VILLAGE HEALTHCARE SEVA',
    title: 'Mobile Health Clinics, Doctor Camps & First Aid Kits',
    tag: 'Community Healthcare',
  },
  {
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=85',
    cause: 'MARGINAL SMALL FARMERS',
    title: 'Eco-Seeds, Water Security & Rural Self-Reliance',
    tag: 'Kisan Kalyan Drive',
  },
];

const DONATION_TIERS = [
  { amount: 500, label: '₹500', impact: '5 Warm Meals' },
  { amount: 1500, label: '₹1,500', impact: '1 Health Check Kit' },
  { amount: 5000, label: '₹5,000', impact: 'Child Education Term' },
];

export default function HeroSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number>(1500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(slideInterval);
  }, []);

  const currentSlide = HERO_SLIDES[slideIndex];
  const finalDonationAmount = isCustomMode && Number(customAmount) > 0 
    ? Number(customAmount) 
    : selectedAmount;

  return (
    <section className="relative bg-white text-slate-900 overflow-hidden border-b border-slate-100">
      
      {/* Background Slideshow with CLEARLY VISIBLE On-Ground Seva Imagery */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === slideIndex ? 'opacity-35 sm:opacity-45 scale-105 transition-transform duration-[6000ms]' : 'opacity-0 scale-100'
            }`}
          >
            <Image
              src={slide.url}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={idx === 0}
            />
          </div>
        ))}

        {/* Directional Light Gradient Veil - Keeps left typography 100% crisp while letting photos shine through on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40 sm:to-white/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-transparent to-white" />
        
        {/* Subtle Ambient Flares */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-amber-400/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-emerald-400/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Mission, Rotating Headline & Action CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            {/* Top Official Trust Pill Badge & Live Drive Tag */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-300 text-amber-900 text-[11px] sm:text-xs font-black shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>NIPANIA VIKASH SEVA TRUST</span>
                <span className="text-amber-400">•</span>
                <span className="text-slate-700">REGD. 80G &amp; 12A</span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold shadow-xs">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentSlide.tag}</span>
              </div>
            </div>

            {/* Headline with Live Rotating Cause */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-black text-slate-900 leading-[1.18] tracking-tight font-heading">
              Dedicated to the Service &amp; Upliftment of{' '}
              <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 transition-all duration-500 font-black">
                {currentSlide.cause}
              </span>
            </h1>

            {/* Inspiring Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              {subtitle ||
                'Delivering immediate disaster relief, free community medical care, primary education kits, and sustainable livelihoods across rural India with 100% transparency and verified on-ground impact.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <Link
                href={`/donate?amount=${finalDonationAmount}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500 hover:from-amber-600 hover:to-gold-600 text-white shadow-[0_6px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_10px_28px_rgba(245,158,11,0.45)] transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
              >
                <Heart className="w-4 h-4 fill-white text-white shrink-0" />
                <span>Donate to Active Causes</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>

              <Link
                href="/campaigns"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold border-2 border-slate-300 hover:border-amber-500 text-slate-800 hover:text-amber-800 bg-white hover:bg-amber-50/50 shadow-xs transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                <span>Explore Ongoing Seva</span>
                <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
              </Link>
            </div>

            {/* Official Compliance & Trust Badges Strip */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-800 font-bold">
              <div className="flex items-center gap-1.5 bg-white/95 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
                <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                <span>Section 80G Tax Exemption</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/95 border border-emerald-300 px-3.5 py-1.5 rounded-full shadow-2xs text-emerald-800">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>NITI Aayog Darpan Regd.</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/95 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                <span>100% Verifiable Seva</span>
              </div>
            </div>

            {/* Interactive Hero Photo Switcher Dots */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Active Seva Photo:</span>
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.cause}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === slideIndex 
                      ? 'w-6 bg-amber-600 shadow-sm' 
                      : 'w-2 bg-slate-300 hover:bg-amber-400'
                  }`}
                  aria-label={`Switch to slide ${idx + 1}: ${slide.cause}`}
                />
              ))}
            </div>

          </div>

          {/* Right Column: Clean White Floating Quick Seva Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] border border-amber-300/80 space-y-4 sm:space-y-5 relative group hover:border-amber-400 transition-all duration-300">
              
              {/* Trust Badge Bar */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white p-1 border-2 border-amber-400 shadow-xs shrink-0">
                    <Image src="/logo.png" alt="Nipania Trust Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight font-heading">
                      Nipania Vikash Seva Trust
                    </h3>
                    <span className="text-[10px] text-amber-600 font-bold tracking-wider block">
                      SEVA • VIKASH • SAMARPAN
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold border border-emerald-200 shrink-0">
                  <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>Verified 80G</span>
                </div>
              </div>

              {/* Interactive Quick Seva Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Community Seva
                  </span>
                  <span className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                    50% Tax Relief (80G)
                  </span>
                </div>
                
                {/* 3 Preset Tier Buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {DONATION_TIERS.map((tier) => {
                    const isSelected = !isCustomMode && selectedAmount === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => {
                          setIsCustomMode(false);
                          setSelectedAmount(tier.amount);
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-500 shadow-[0_4px_15px_rgba(245,158,11,0.3)] scale-[1.02]'
                            : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40'
                        }`}
                      >
                        <span className={`text-xs sm:text-sm font-extrabold block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {tier.label}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-amber-100 font-semibold' : 'text-slate-500'}`}>
                          {tier.impact}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input Option */}
                <div className="pt-1">
                  {!isCustomMode ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(true)}
                      className="text-[11px] text-slate-500 hover:text-amber-700 transition-colors flex items-center gap-1 font-medium"
                    >
                      <span>Want to give a different amount?</span>
                      <span className="text-amber-600 font-bold underline underline-offset-2">Enter custom ₹</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-amber-300">
                      <span className="text-xs font-black text-amber-600 pl-2">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter amount (e.g. 2100)"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none font-bold py-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomMode(false);
                          setCustomAmount('');
                        }}
                        className="text-[10px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-200 shrink-0 font-bold"
                      >
                        Presets
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Donation CTA */}
                <Link
                  href={`/donate?amount=${finalDonationAmount}`}
                  className="w-full mt-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500 hover:from-amber-600 hover:to-gold-600 text-white font-black text-xs sm:text-sm transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)] active:scale-98"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Contribute ₹{finalDonationAmount.toLocaleString('en-IN')} Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <p className="text-[10px] text-center text-slate-500 font-medium">
                  Instant Section 80G Tax Exemption Receipt issued via Email &amp; WhatsApp.
                </p>
              </div>

              {/* Quick Trust Action Links */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <Link
                  href="/volunteer"
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 hover:bg-amber-50/60 text-slate-700 border border-slate-200/80 hover:border-amber-300 transition-colors group/link"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Join as Field Volunteer</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 group-hover/link:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/verify"
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 hover:bg-emerald-50/60 text-slate-700 border border-slate-200/80 hover:border-emerald-300 transition-colors group/link"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Verify ID Card of Volunteer / Staff</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-emerald-600 group-hover/link:translate-x-0.5 transition-all" />
                </Link>

                <a
                  href="#qr-donation-section"
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 hover:bg-amber-50/60 text-slate-700 border border-slate-200/80 hover:border-amber-300 transition-colors group/link"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Direct UPI QR &amp; Bank Transfer Details</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 group-hover/link:translate-x-0.5 transition-all" />
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Hero Trust Metrics Ribbon */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">50,000+</span>
            <span className="text-[11px] sm:text-xs text-slate-500 block font-bold">Lives Touched &amp; Uplifted</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-amber-600 font-heading">100%</span>
            <span className="text-[11px] sm:text-xs text-slate-500 block font-bold">80G Tax Deductible</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">120+</span>
            <span className="text-[11px] sm:text-xs text-slate-500 block font-bold">Rural Villages Reached</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-heading">1,200+</span>
            <span className="text-[11px] sm:text-xs text-slate-500 block font-bold">Dedicated Seva Volunteers</span>
          </div>
        </div>

      </div>
    </section>
  );
}
