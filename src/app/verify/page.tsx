'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { ShieldCheck, Search, QrCode, AlertCircle, ArrowRight } from 'lucide-react';

export default function VerifySearchPage() {
  const router = useRouter();
  const [idInput, setIdInput] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = idInput.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter a valid Trust ID number.');
      return;
    }
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-card text-center space-y-6">
            
            <div className="w-16 h-16 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="title-ornament mb-1">
                <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                  Official Verification Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
                Verify Identity Card
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Enter the official Volunteer, Member, or Staff ID number to verify authenticity in real-time.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
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
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 text-sm font-mono uppercase font-bold text-navy-950 placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all"
              >
                <span>Verify Credential</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </form>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-gold-600" />
                <span>Or scan the QR code printed on physical cards</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                <span>Direct DB lookup (Zero spoofing)</span>
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            <span>Received a correction notice from administration? </span>
            <a href="/correction" className="font-bold text-orange-700 hover:text-orange-800 underline inline-flex items-center gap-1">
              Open Application Correction Desk →
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
