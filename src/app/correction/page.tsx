'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import {
  FileEdit,
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Camera,
  MapPin,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export default function CorrectionSearchPage() {
  const router = useRouter();
  const [refInput, setRefInput] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = refInput.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your Application Reference ID (e.g. NVS-VOL-000001).');
      return;
    }
    setError('');
    setSearching(true);
    router.push(`/correction/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-card text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm border border-orange-200">
              <FileEdit className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="title-ornament mb-1">
                <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                  Applicant Self-Service Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
                Application Correction Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                If the Trust administration requested changes to your Volunteer or Membership application, enter your Registration Reference ID below to view the administrator remarks and submit your corrections online.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. NVS-VOL-000001 or NVS-MEM-000001"
                  value={refInput}
                  onChange={(e) => {
                    setRefInput(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 text-sm font-mono uppercase font-bold text-navy-950 placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={searching || !refInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
              >
                <span>{searching ? 'Finding Application...' : 'Open Correction Form'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-600" />
                <span>Fast 24-hr re-evaluation</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                <span>Encrypted & Verified Update</span>
              </div>
            </div>
          </div>

          {/* Guidance Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-950">Passport Photo Quality</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ensure your photograph is sharp, upright, front-facing, and taken against a light or plain background without hats or sunglasses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-950">Complete Address & PIN</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide your full residential street address along with district, state, and a valid 6-digit postal PIN code for official verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-950">Immediate Approval</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Once corrected and submitted, your status automatically changes to Pending Review so administrators can promptly issue your ID card.
              </p>
            </div>
          </div>

          {/* Need Assistance */}
          <div className="mt-8 text-center text-xs text-slate-500">
            <span>Can't find your reference number? Check your registration confirmation email or contact our desk at </span>
            <a href="mailto:info@nipaniatrust.org" className="font-bold text-navy-950 underline">
              info@nipaniatrust.org
            </a>
            <span> or </span>
            <a href="tel:+919431123456" className="font-bold text-navy-950 underline">
              +91 94311 23456
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
