'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@nipaniatrust.org');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2340] via-[#0f2d52] to-[#123966] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-gold-400/30 space-y-6">
          
          {/* Logo Spotlight */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 p-1.5 border-2 border-amber-400 shadow-md relative flex items-center justify-center">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image src="/logo.png" alt="Trust Logo" fill className="object-contain p-0.5" priority />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase font-heading tracking-tight">
                Nipania Vikash Seva Trust
              </h1>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mt-0.5">
                ADMINISTRATION PORTAL
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Authorized Governance Access
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@nipaniatrust.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Password</label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-black text-sm bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-slate-950 shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure Admin Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Help */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block">Initial Default Credentials:</span>
            <div className="flex justify-between font-mono text-[10px]">
              <span>Email: <strong>admin@nipaniatrust.org</strong></span>
              <span>Pass: <strong>admin123</strong></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
