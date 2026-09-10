'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Phone, MapPin, Heart, ArrowRight, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0c2340] via-[#0f2b4c] to-[#12355c] text-blue-100/90 pt-16 pb-28 sm:pb-12 border-t-2 border-gold-400/40 shadow-2xl relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Trust Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white p-1 shadow-md border-2 border-gold-400">
                <Image
                  src="/logo.png"
                  alt="Nipania Vikash Seva Trust Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight font-heading">
                  Nipania Vikash Seva Trust
                </h3>
                <p className="text-xs font-bold text-gold-400 tracking-wider">
                  SEVA | VIKASH | SAMARPAN
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed pr-4">
              A dedicated public charitable organization committed to grassroots social welfare, education support, primary healthcare camps, and rural community empowerment through selfless dedication.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-gold-400/30 text-xs font-medium text-gold-300 shadow-xs backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Registered Public Charitable Trust (Govt. Regd: IV-120/2022)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Our Focus Areas
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Current Campaigns
                </Link>
              </li>
              <li>
                <Link href="/sponsor" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Sponsor a Cause
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Events &amp; Drives
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Photo Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white font-heading">
              Get Involved
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/donate" className="hover:text-gold-300 transition-colors flex items-center gap-1.5 font-bold text-gold-400">
                  <Heart className="w-3.5 h-3.5 fill-gold-400 text-gold-400" /> Donate Now
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Become a Volunteer
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Become a Member
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-gold-400" /> Verify ID Card
                </Link>
              </li>
              <li>
                <Link href="/correction" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Application Correction
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-400" /> Contact Trust Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white font-heading">
              Trust Office
            </h4>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="break-words">Nipania, Hunterganj, Chatra, Jharkhand - 825403</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <a href="mailto:info@nipaniatrust.org" className="hover:text-gold-400 break-all transition-colors underline-offset-2 hover:underline">
                  info@nipaniatrust.org
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <a href="tel:+919876543210" className="font-mono hover:text-gold-400 transition-colors font-semibold">
                  +91 98765 43210
                </a>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-slate-200 hover:text-white transition-all shadow-xs"
                >
                  <ExternalLink className="w-3 h-3 text-gold-400" />
                  <span>Secure Admin Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal Disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center md:text-left">
          <div className="space-y-1">
            <p>
              &copy; {new Date().getFullYear()} <strong className="text-white">NIPANIA VIKASH SEVA TRUST</strong>. All Rights Reserved.
            </p>
            <p className="text-[11px] text-slate-400">
              Tax Exemption Available under Section 80G of the Income Tax Act, 1961.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] sm:text-xs font-medium">
            <Link href="/legal/privacy" className="hover:text-gold-400 transition-colors py-0.5">Privacy Policy</Link>
            <span className="text-slate-600">&bull;</span>
            <Link href="/legal/terms" className="hover:text-gold-400 transition-colors py-0.5">Terms &amp; Conditions</Link>
            <span className="text-slate-600">&bull;</span>
            <Link href="/legal/donation-policy" className="hover:text-gold-400 transition-colors py-0.5">Donation Policy</Link>
            <span className="text-slate-600">&bull;</span>
            <Link href="/legal/volunteer-policy" className="hover:text-gold-400 transition-colors py-0.5">Volunteer Code</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
