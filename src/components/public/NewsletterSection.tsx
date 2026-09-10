'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing to Nipania Vikash Seva Trust updates!');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <section className="py-16 bg-warm-100 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="w-12 h-12 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center mx-auto mb-4 shadow-md">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
          Stay Connected with Our Grassroots Mission
        </h2>
        
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Subscribe to receive quarterly community progress bulletins, event announcements, and initiative reports.
        </p>

        {status === 'success' ? (
          <div className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-center gap-2 max-w-md mx-auto">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white sm:w-1/3 text-left placeholder:text-slate-400"
              />
              <input
                type="email"
                required
                placeholder="Your Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white flex-1 text-left placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim() || !email.includes('@')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-navy-900 hover:bg-navy-800 text-white transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-900"
              >
                <span>{status === 'loading' ? 'Joining...' : 'Subscribe'}</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>

            {status === 'error' && (
              <div className="text-xs text-rose-600 flex items-center justify-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              We respect your privacy. No spam. You can unsubscribe at any time.
            </p>
          </form>
        )}

      </div>
    </section>
  );
}
