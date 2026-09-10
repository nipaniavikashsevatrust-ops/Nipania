'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  PenTool, 
  Trash2, 
  Sparkles,
  Building,
  Mail,
  Send,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Server,
  KeyRound,
  CreditCard,
  IndianRupee,
  Check,
  ArrowRight,
  Building2,
  QrCode,
} from 'lucide-react';

const SMTP_PRESETS = [
  {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    tip: 'Use a 16-character Google App Password (not your personal password).',
  },
  {
    name: 'Outlook / Office 365',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    tip: 'Use your Microsoft account email and SMTP enabled app password.',
  },
  {
    name: 'Zoho Mail',
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    tip: 'Use Zoho account credentials with SSL on port 465.',
  },
  {
    name: 'Hostinger / Custom',
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    tip: 'Enter your domain webmail server host, port, and email credentials.',
  },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const sigFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Password visibility & testing states
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: 'NIPANIA VIKASH SEVA TRUST',
    pan: '',
    tagline: 'SEVA | VIKASH | SAMARPAN',
    registrationNo: '',
    darpanId: '',
    registrationAuthority: '',
    applicableAct: '',
    incorporationDate: '',
    trustDeedDate: '',
    reg12aNo: '',
    reg80gNo: '',
    csrNo: '',
    fcraNo: '',
    registeredAddress: 'Village Nipania, Post Office Road, Jharkhand, India',
    correspondenceAddress: '',
    district: 'Jharkhand',
    state: 'Jharkhand',
    pinCode: '854301',
    email: 'info@nipaniatrust.org',
    phone: '+91 98765 43210',
    altPhone: '',
    website: 'https://nipaniatrust.org',
    presidentName: 'Managing Trustee',
    presidentTitle: 'President / Managing Trustee',
    presidentSignature: '',
    presidentStamp: '',
    // SMTP Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    smtpSenderName: 'Nipania Vikash Seva Trust',
    smtpSenderEmail: 'info@nipaniatrust.org',
    // Payment Gateway & Fee Settings (INR Currency)
    paymentGatewayEnabled: false,
    paymentGatewayProvider: 'RAZORPAY',
    paymentGatewayMode: 'TEST',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    paymentCurrency: 'INR',
    membershipFeeEnabled: true,
    generalMemberFee: 500,
    lifeMemberFee: 5000,
    executiveMemberFee: 2100,
    patronMemberFee: 11000,
    accountName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
    isBankPublic: false,
    upiId: '',
    upiPayeeName: 'NIPANIA VIKASH SEVA TRUST',
    upiQrImage: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setForm((prev) => ({
            ...prev,
            ...data.settings,
            smtpPort: data.settings.smtpPort || 587,
          }));
          if (data.settings.smtpUser) {
            setTestEmail(data.settings.smtpUser);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  // Auto-format password (remove spaces from Google App Password pastes)
  const handlePasswordChange = (val: string) => {
    const sanitized = val.replace(/\s+/g, '');
    setForm((prev) => ({ ...prev, smtpPassword: sanitized }));
    setSmtpTestResult(null);
  };

  const handleApplyPreset = (preset: typeof SMTP_PRESETS[0]) => {
    setForm((prev) => ({
      ...prev,
      smtpHost: preset.host,
      smtpPort: preset.port,
      smtpSecure: preset.secure,
    }));
    setSmtpTestResult(null);
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSig(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, presidentSignature: data.url }));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setForm((prev) => ({ ...prev, presidentSignature: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, presidentSignature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingSig(false);
    }
  };

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStamp(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, presidentStamp: data.url }));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setForm((prev) => ({ ...prev, presidentStamp: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, presidentStamp: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingStamp(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, upiQrImage: data.url }));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setForm((prev) => ({ ...prev, upiQrImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, upiQrImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingQr(false);
    }
  };

  // Test SMTP connection before saving
  const handleTestSmtp = async () => {
    if (!form.smtpHost || !form.smtpUser || !form.smtpPassword) {
      setSmtpTestResult({
        success: false,
        message: 'Please fill in SMTP Host, Username, and Password before testing.',
      });
      return;
    }

    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: form.smtpHost,
          port: form.smtpPort,
          secure: form.smtpSecure,
          user: form.smtpUser,
          password: form.smtpPassword,
          senderName: form.smtpSenderName,
          senderEmail: form.smtpSenderEmail,
          testEmail: testEmail || form.smtpUser,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSmtpTestResult({
          success: true,
          message: data.message || 'SMTP verified and test email sent successfully!',
        });
      } else {
        setSmtpTestResult({
          success: false,
          message: data.error || 'SMTP verification failed. Please check your credentials.',
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Network error occurred while testing SMTP connection.',
      });
    } finally {
      setTestingSmtp(false);
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Trust Administration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Trust Settings & SMTP Mailer Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Configure automated email sending via Nodemailer SMTP, President signatures, and legal identity.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-gold-400" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Trust settings, SMTP credentials, and signatures successfully saved and synchronized!</span>
        </div>
      )}

      {/* 1. EMAIL & SMTP CONFIGURATION (NODEMAILER) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold-400/60 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-700 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 font-heading">
                Nodemailer SMTP Email Dispatcher
              </h3>
              <p className="text-xs text-slate-500">
                Configure your SMTP server to dispatch automated ID Cards, approval emails, and donation receipts.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-navy-950 text-gold-300 self-start sm:self-auto border border-gold-400/30">
            Nodemailer Engine
          </span>
        </div>

        {/* Quick Provider Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Quick Provider Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {SMTP_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.smtpHost === preset.host
                    ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* SMTP Configuration Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-gold-600" />
              <span>SMTP Host / Server <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="smtp.gmail.com"
              value={form.smtpHost || ''}
              onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-gold-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              SMTP Port <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                required
                placeholder="587"
                value={form.smtpPort || 587}
                onChange={(e) => setForm({ ...form, smtpPort: parseInt(e.target.value) || 587 })}
                className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-gold-500 font-medium"
              />
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={form.smtpSecure}
                  onChange={(e) => setForm({ ...form, smtpSecure: e.target.checked })}
                  className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                />
                <span>SSL / TLS (Port 465)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-600" />
              <span>SMTP Username / Email <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. your-email@gmail.com"
              value={form.smtpUser || ''}
              onChange={(e) => {
                setForm({ ...form, smtpUser: e.target.value });
                if (!testEmail) setTestEmail(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-gold-600" />
                <span>SMTP Password / App Password <span className="text-rose-500">*</span></span>
              </label>
              {form.smtpPassword && (
                <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {form.smtpPassword.length} chars (Auto-Sanitized)
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Google App Password (e.g. xxxx xxxx xxxx xxxx)"
                value={form.smtpPassword || ''}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-gold-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sender Name (From Header)
            </label>
            <input
              type="text"
              placeholder="Nipania Vikash Seva Trust"
              value={form.smtpSenderName || ''}
              onChange={(e) => setForm({ ...form, smtpSenderName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sender Email Address
            </label>
            <input
              type="email"
              placeholder="info@nipaniatrust.org"
              value={form.smtpSenderEmail || ''}
              onChange={(e) => setForm({ ...form, smtpSenderEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Live SMTP Connection Testing Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-warm-50 border border-gold-400/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-navy-950 font-heading">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Test SMTP Credentials Before Submitting</span>
            </div>
            <span className="text-[10px] text-slate-500">Instant Real-time Dispatch</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <input
                type="email"
                placeholder="Enter recipient email to receive test message..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 bg-white"
              />
            </div>

            <button
              type="button"
              disabled={testingSmtp || !form.smtpUser || !form.smtpPassword}
              onClick={handleTestSmtp}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testingSmtp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Server Connection...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status Feedback */}
          {smtpTestResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
              smtpTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {smtpTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold block">
                  {smtpTestResult.success ? 'SMTP Connection Succeeded!' : 'SMTP Connection Failed'}
                </span>
                <p className="text-[11px] leading-relaxed">{smtpTestResult.message}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 2. PRESIDENT / AUTHORIZED SIGNATURE SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-700 flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 font-heading">
                President / Authorized Signatory & Official Signature
              </h3>
              <p className="text-xs text-slate-500">
                This signature will automatically appear on all issued Single-Sided Volunteer, Member & Staff ID Cards.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gold-100 text-gold-800 border border-gold-300">
            ID Card Stamp
          </span>
        </div>

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Signature Upload & Preview */}
          <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-gold-400/50 space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-950 block">
                1. President / Managing Trustee Signature
              </span>
              <p className="text-[11px] text-slate-500">
                Rendered on Section 80G Tax Exemption Receipts, ID Cards, and certificates.
              </p>
            </div>

            <div className="relative w-56 h-28 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-3 shadow-xs overflow-hidden">
              {form.presidentSignature ? (
                <img
                  src={form.presidentSignature}
                  alt="President Signature"
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
              ) : (
                <div className="text-slate-400 text-center space-y-1">
                  <PenTool className="w-7 h-7 mx-auto opacity-50 text-gold-600" />
                  <span className="text-[10px] block font-medium">No signature uploaded yet</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                type="file"
                ref={sigFileInputRef}
                onChange={handleSignatureUpload}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingSig}
                onClick={() => sigFileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 flex items-center gap-2 transition-all shadow-xs"
              >
                {uploadingSig ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-400" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-gold-400" />
                )}
                <span>{uploadingSig ? 'Uploading...' : form.presidentSignature ? 'Change Signature' : 'Upload Signature'}</span>
              </button>

              {form.presidentSignature && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, presidentSignature: '' })}
                  className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Remove signature"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Recommended: PNG image with transparent background (under 2MB)</span>
          </div>

          {/* Card 2: Official Trust Seal / Stamp Upload & Preview */}
          <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-400/50 space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-950 block">
                2. Official Trust Seal / Stamp
              </span>
              <p className="text-[11px] text-slate-500">
                Official circular seal for statutory validation on 80G receipts and legal forms.
              </p>
            </div>

            <div className="relative w-28 h-28 bg-white rounded-full border-2 border-emerald-200 flex items-center justify-center p-2 shadow-xs overflow-hidden">
              {form.presidentStamp ? (
                <img
                  src={form.presidentStamp}
                  alt="Official Stamp"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-center space-y-1">
                  <ShieldCheck className="w-8 h-8 mx-auto opacity-50 text-emerald-600" />
                  <span className="text-[10px] block font-medium">No stamp uploaded yet</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                type="file"
                ref={stampFileInputRef}
                onChange={handleStampUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingStamp}
                onClick={() => stampFileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-2 transition-all shadow-xs"
              >
                {uploadingStamp ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingStamp ? 'Uploading...' : form.presidentStamp ? 'Change Stamp' : 'Upload Official Stamp'}</span>
              </button>

              {form.presidentStamp && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, presidentStamp: '' })}
                  className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Remove stamp"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Recommended: Circular stamp PNG with transparent background (under 2MB)</span>
          </div>
        </div>

        {/* Card 3: Signatory Information & Combined 80G Receipt Preview */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Signatory Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Managing Trustee"
                value={form.presidentName || ''}
                onChange={(e) => setForm({ ...form, presidentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 font-semibold text-navy-950 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Signatory Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. President / Managing Trustee"
                value={form.presidentTitle || ''}
                onChange={(e) => setForm({ ...form, presidentTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 font-semibold text-navy-950 bg-white"
              />
            </div>
          </div>

          {/* Live Combined 80G Receipt & ID Card Signature Block */}
          <div className="p-5 rounded-2xl bg-white border border-gold-400/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              {form.presidentStamp ? (
                <div className="w-16 h-16 relative shrink-0">
                  <img src={form.presidentStamp} alt="Trust Stamp" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                  No Seal
                </div>
              )}
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gold-700 font-bold block">
                  Live 80G Receipt & ID Card Signature Block
                </span>
                <h4 className="text-sm font-bold text-navy-950 uppercase">{form.name || 'Nipania Vikash Seva Trust'}</h4>
                <p className="text-[11px] text-slate-500">
                  {form.registeredAddress || 'Balrampur, Uttar Pradesh, India'}
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right min-w-[160px]">
              {form.presidentSignature ? (
                <div className="h-12 w-36 relative mx-auto sm:ml-auto flex items-center justify-center sm:justify-end">
                  <img
                    src={form.presidentSignature}
                    alt="Signature"
                    className="max-h-full max-w-full object-contain filter contrast-125"
                  />
                </div>
              ) : (
                <div className="font-serif italic text-gold-700 text-sm h-8 flex items-center justify-center sm:justify-end">
                  {form.presidentName || 'Managing Trustee'}
                </div>
              )}
              <div className="w-36 h-0.5 bg-gold-400/60 my-1 mx-auto sm:ml-auto" />
              <strong className="text-xs font-bold text-navy-950 block">
                {form.presidentName || 'Managing Trustee'}
              </strong>
              <span className="text-[10px] text-slate-500 block">
                {form.presidentTitle || 'President / Managing Trustee'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Signature...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Signature & Credentials</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* OFFICIAL TRUST BANK ACCOUNT & DIRECT UPI QR MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-50 border border-gold-200/60 text-gold-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 font-heading flex items-center gap-2">
                <span>Official Trust Bank Account & Direct UPI QR</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Direct Seva Transfer
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Official bank coordinates for RTGS, NEFT, IMPS donations and official UPI QR code for direct transfers.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isBankPublic}
              onChange={(e) => setForm({ ...form, isBankPublic: e.target.checked })}
              className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 border-slate-300"
            />
            <span>Show Bank Details Publicly</span>
          </label>
        </div>

        {/* Bank Account Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Bank Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. State Bank of India"
              value={form.bankName || ''}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Account Holder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. NIPANIA VIKASH SEVA TRUST"
              value={form.accountName || ''}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Account Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 38920194820"
              value={form.accountNumber || ''}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-gold-500 font-bold text-navy-950"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              IFSC Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SBIN0001234"
              value={form.ifscCode || ''}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-gold-500 font-bold uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Branch Name & Location
            </label>
            <input
              type="text"
              placeholder="e.g. Nipania Main Branch, Jharkhand"
              value={form.branchName || ''}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Primary Trust UPI ID / VPA <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. nipaniatrust@sbi or 9876543210@upi"
              value={form.upiId || ''}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-gold-500 font-bold text-navy-950"
            />
          </div>
        </div>

        {/* UPI QR Code & Payee Details */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Verified UPI Payee Name
              </label>
              <input
                type="text"
                placeholder="e.g. NIPANIA VIKASH SEVA TRUST"
                value={form.upiPayeeName || ''}
                onChange={(e) => setForm({ ...form, upiPayeeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Official name shown on BHIM, Google Pay, PhonePe, Paytm when donors scan the QR code.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-xs transition-all active:scale-98">
                <Upload className="w-3.5 h-3.5 text-gold-400" />
                <span>{uploadingQr ? 'Uploading QR...' : 'Upload Official QR Code'}</span>
                <input
                  type="file"
                  ref={qrFileInputRef}
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingQr}
                  onChange={handleQrUpload}
                />
              </label>

              {form.upiQrImage && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, upiQrImage: '' })}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Remove QR
                </button>
              )}
            </div>
          </div>

          {/* QR Code Preview Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-emerald-400 bg-white shrink-0 flex items-center justify-center shadow-xs">
              {form.upiQrImage ? (
                <img
                  src={form.upiQrImage}
                  alt="Official UPI QR Code"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="text-center p-2">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                    No QR Uploaded
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-block">
                LIVE DONATION PREVIEW
              </span>
              <p className="font-bold text-navy-950">
                {form.upiPayeeName || 'NIPANIA VIKASH SEVA TRUST'}
              </p>
              <p className="font-mono text-[11px] text-slate-600">
                UPI: {form.upiId || 'Not Configured'}
              </p>
              <p className="text-[11px] text-slate-400">
                This QR code appears directly on the public donation page and home page direct-transfer section.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Bank & UPI Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PAYMENT GATEWAY & MULTI-PROVIDER CONTROLS */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 border border-gold-400/40 shadow-xl text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-400/40 text-gold-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-heading">
                  Payment Gateway & Multi-Provider Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-400 text-navy-950">
                  INR ₹
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  form.paymentGatewayEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}>
                  {form.paymentGatewayEnabled ? 'ACTIVE / ONLINE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Supports 8 comprehensive payment channels: Razorpay, Cashfree, PhonePe, Paytm, Instamojo, CCAvenue, Stripe, and Direct UPI QR.
              </p>
            </div>
          </div>
          <Link
            href="/admin/payment-gateway"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 shadow-gold transition-all duration-200 shrink-0 active:scale-95"
          >
            <span>Open Dedicated Gateway Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Gateway Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Quick Enable Toggle */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <label className="text-slate-300 font-bold block">Gateway Status</label>
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold">
                {form.paymentGatewayEnabled ? 'Gateway Enabled' : 'Gateway Disabled'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paymentGatewayEnabled}
                  onChange={(e) => setForm({ ...form, paymentGatewayEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
              </label>
            </div>
          </div>

          {/* Quick Active Provider Selector */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <label className="text-slate-300 font-bold block">Active Provider</label>
            <select
              value={form.paymentGatewayProvider}
              onChange={(e) => setForm({ ...form, paymentGatewayProvider: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white font-semibold text-xs focus:ring-2 focus:ring-gold-500"
            >
              <option value="RAZORPAY">Razorpay (Cards, UPI, NetBanking)</option>
              <option value="CASHFREE">Cashfree Payments (Fast Settlements)</option>
              <option value="PHONEPE">PhonePe PG (Deep-link UPI)</option>
              <option value="PAYTM">Paytm Business (Wallet, Cards, UPI)</option>
              <option value="INSTAMOJO">Instamojo (Direct Links & UPI for NGOs)</option>
              <option value="CCAVENUE">CCAvenue (200+ Indian Payment Options)</option>
              <option value="STRIPE">Stripe Payments (Global Cards & Apple/Google Pay)</option>
              <option value="UPI_DIRECT">Direct UPI & Bank Transfer (0% Fee)</option>
            </select>
          </div>

          {/* Quick Environment Mode Selector */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <label className="text-slate-300 font-bold block">Environment Mode</label>
            <select
              value={form.paymentGatewayMode}
              onChange={(e) => setForm({ ...form, paymentGatewayMode: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white font-semibold text-xs focus:ring-2 focus:ring-gold-500"
            >
              <option value="TEST">TEST / SANDBOX MODE</option>
              <option value="LIVE">LIVE / PRODUCTION MODE</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Basic Organization Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-navy-950 font-heading pb-3 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gold-600" />
          General Organization Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Official Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-bold text-navy-950"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Motto / Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Official Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Helpline Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Registered Addresses */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-navy-950 font-heading pb-3 border-b border-slate-100">
          Location & Registered Office
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">Registered Address</label>
            <input
              type="text"
              value={form.registeredAddress}
              onChange={(e) => setForm({ ...form, registeredAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">District</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-gold transition-all disabled:opacity-50"
        >
          {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>Save All Settings, SMTP & Signatures</span>
        </button>
      </div>

    </div>
  );
}
