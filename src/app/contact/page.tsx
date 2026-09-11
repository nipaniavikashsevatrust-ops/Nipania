'use client';

import React, { useState } from 'react';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export default function ContactPage() {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    showInfo('Sending your message...');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        showSuccess('Message sent successfully! We\'ll get back to you soon.');
      } else {
        const msg = data.error || 'Failed to send message. Please try again.';
        setError(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = 'Network error. Please try again.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="title-ornament mb-2">
              <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                Get In Touch
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
              Contact Nipania Vikash Seva Trust
            </h1>
            <p className="text-sm text-slate-600">
              Have questions regarding our social initiatives, partnerships, or volunteering? Reach out to our office team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Contact Details Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-b from-amber-50/90 via-white to-orange-50/40 text-slate-800 rounded-3xl p-5 sm:p-10 border-2 border-amber-300/80 shadow-lg space-y-8">
                <div>
                  <h3 className="text-xl font-bold font-heading uppercase text-slate-900">
                    Trust Headquarters
                  </h3>
                  <p className="text-xs text-amber-800 font-bold mt-1">
                    NIPANIA VIKASH SEVA TRUST
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Regd. Public Charitable Trust
                  </span>
                </div>

                <div className="space-y-6 text-xs sm:text-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-heading">Registered Address</strong>
                      <p className="text-slate-600 leading-relaxed mt-1">
                        Nipania, P.O. Pargha, P.S. Baliapur,<br />
                        District Dhanbad, Jharkhand – 828201
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-heading">Official Email</strong>
                      <a href="mailto:info@nipaniatrust.org" className="text-slate-600 hover:text-amber-800 transition-colors block mt-1">
                        info@nipaniatrust.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-heading">Helpline Phone</strong>
                      <p className="text-slate-700 mt-1 font-semibold">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-heading">Working Hours</strong>
                      <p className="text-slate-600 mt-1">Monday – Saturday: 9:00 AM – 6:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-navy-900">
                  <div className="flex items-center gap-2 text-xs text-gold-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Direct Community Grievance Cell Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-5 sm:p-12 border border-slate-200 shadow-card">
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-950 font-heading">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </p>
                </div>

                {success && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your message has been sent successfully. We will contact you soon!</span>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Singh"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ramesh@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Partnership / Seva Inquiry"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message, queries, or collaboration proposals here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="pt-2">
                    {(() => {
                      const isFormComplete = Boolean(
                        form.name.trim() &&
                        form.email.trim() &&
                        form.email.includes('@') &&
                        form.subject.trim() &&
                        form.message.trim()
                      );

                      return (
                        <button
                          type="submit"
                          disabled={loading || !isFormComplete}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-900 transition-all"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                              <span>Sending Message...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 text-gold-400" />
                              <span>Send Message</span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Interactive Map Section */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card p-4">
            <iframe
              title="Trust Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742491.5471676663!2d83.33642398471279!3d23.63450125867169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f4e104aa5db7dd%3A0xdc0d0d8291410427!2sJharkhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="340"
              style={{ border: 0, borderRadius: '1rem' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
