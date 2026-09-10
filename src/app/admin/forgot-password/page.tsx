'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('admin@nipaniatrust.org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoLink, setDemoLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setDemoLink('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Password reset link has been dispatched.');
        if (data.demoLink) {
          setDemoLink(data.demoLink);
        }
      } else {
        setError(data.error || 'Unable to process password reset request.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2340] via-[#0f2d52] to-[#123966] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Lighting Ornaments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-gold-400/30 space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 p-1.5 border-2 border-amber-400 shadow-md relative flex items-center justify-center">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image src="/logo.png" alt="Trust Logo" fill className="object-contain p-0.5" priority />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase font-heading tracking-tight">
                Password Recovery
              </h1>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                ADMINISTRATION SECURITY PORTAL
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered administrator email to receive a secure password reset link.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instructions Dispatched</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                {successMsg}
              </p>
              {demoLink && (
                <div className="pt-2 border-t border-emerald-200">
                  <span className="block text-[10px] font-bold text-slate-600 mb-1">Direct Reset Link:</span>
                  <Link
                    href={demoLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Open Reset Password Page</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@nipaniatrust.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 font-medium outline-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-black text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-slate-950 shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying &amp; Dispatching...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Return to Login */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Login</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
