'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CreditCard,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  QrCode,
  Upload,
  ArrowLeft,
  Sparkles,
  Zap,
  Building2,
  Wallet,
  Check,
  HelpCircle,
} from 'lucide-react';

interface GatewaySettings {
  paymentGatewayEnabled: boolean;
  paymentGatewayProvider: 'RAZORPAY' | 'CASHFREE' | 'PHONEPE' | 'PAYTM' | 'INSTAMOJO' | 'CCAVENUE' | 'STRIPE' | 'UPI_DIRECT';
  paymentGatewayMode: 'TEST' | 'LIVE';
  paymentCurrency: string;
  // Razorpay
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  // Cashfree
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  cashfreeApiVersion: string;
  // PhonePe
  phonepeMerchantId: string;
  phonepeSaltKey: string;
  phonepeSaltIndex: string;
  // Paytm
  paytmMerchantId: string;
  paytmMerchantKey: string;
  paytmWebsite: string;
  // Instamojo
  instamojoApiKey: string;
  instamojoAuthToken: string;
  instamojoSalt: string;
  // CCAvenue
  ccavenueMerchantId: string;
  ccavenueAccessCode: string;
  ccavenueWorkingKey: string;
  // Stripe
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  // Direct UPI & Bank Transfer
  upiId: string;
  upiPayeeName: string;
  upiQrImage: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  isBankPublic: boolean;
  // Membership Fee Controls
  membershipFeeEnabled: boolean;
  generalMemberFee: number;
  lifeMemberFee: number;
  executiveMemberFee: number;
  patronMemberFee: number;
}

const PROVIDERS = [
  {
    id: 'RAZORPAY',
    name: 'Razorpay',
    tagline: 'Cards, UPI, NetBanking, Wallets',
    badge: 'Popular in India',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Standard payment gateway supporting cards, instant UPI auto-collect, and all Indian banks.',
  },
  {
    id: 'CASHFREE',
    name: 'Cashfree Payments',
    tagline: 'Seamless UPI, Cards & NetBanking',
    badge: 'Fast Settlements',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Developer-friendly checkout with comprehensive Indian banking integrations.',
  },
  {
    id: 'PHONEPE',
    name: 'PhonePe PG',
    tagline: 'Direct UPI & Intent Flow',
    badge: 'High UPI Success',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Direct deep-link UPI payments optimized for mobile users across India.',
  },
  {
    id: 'PAYTM',
    name: 'Paytm Business',
    tagline: 'Paytm Wallet, UPI & Cards',
    badge: 'All-in-One',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Paytm merchant ecosystem with support for Paytm Wallet, UPI, and debit cards.',
  },
  {
    id: 'INSTAMOJO',
    name: 'Instamojo',
    tagline: 'Payment Links, Cards, UPI for NGOs',
    badge: 'Easy NGO Setup',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Popular Indian payment platform favored by non-profits and registered trusts.',
  },
  {
    id: 'CCAVENUE',
    name: 'CCAvenue',
    tagline: '200+ Indian Payment Options',
    badge: 'Institutional Trust',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'India\'s largest institutional payment gateway with multi-bank NetBanking and EMI support.',
  },
  {
    id: 'STRIPE',
    name: 'Stripe Payments',
    tagline: 'Global Cards, Apple & Google Pay',
    badge: 'International & India',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Worldwide checkout infrastructure supporting international donor cards and Indian domestic transactions.',
  },
  {
    id: 'UPI_DIRECT',
    name: 'Direct UPI & QR Code',
    tagline: 'Zero Gateway Fees (Direct Bank)',
    badge: '100% Free',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Direct VPA and QR code transfer directly to the Trust bank account with UTR verification.',
  },
];

export default function AdminPaymentGatewayPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // Testing Gateway states
  const [testingGateway, setTestingGateway] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [form, setForm] = useState<GatewaySettings>({
    paymentGatewayEnabled: false,
    paymentGatewayProvider: 'RAZORPAY',
    paymentGatewayMode: 'TEST',
    paymentCurrency: 'INR',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayWebhookSecret: '',
    cashfreeAppId: '',
    cashfreeSecretKey: '',
    cashfreeApiVersion: '2023-08-01',
    phonepeMerchantId: '',
    phonepeSaltKey: '',
    phonepeSaltIndex: '1',
    paytmMerchantId: '',
    paytmMerchantKey: '',
    paytmWebsite: 'DEFAULT',
    instamojoApiKey: '',
    instamojoAuthToken: '',
    instamojoSalt: '',
    ccavenueMerchantId: '',
    ccavenueAccessCode: '',
    ccavenueWorkingKey: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    upiId: 'nipaniatrust@upi',
    upiPayeeName: 'Nipania Vikash Seva Trust',
    upiQrImage: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    isBankPublic: true,
    membershipFeeEnabled: true,
    generalMemberFee: 500,
    lifeMemberFee: 5000,
    executiveMemberFee: 2100,
    patronMemberFee: 11000,
  });

  useEffect(() => {
    fetch('/api/payment')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setForm((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch((err) => console.error('Failed to load payment gateway settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaved(false);
    setTestResult(null);

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_SETTINGS',
          ...form,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        alert(data.error || 'Failed to save payment settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestCredentials = async () => {
    setTestingGateway(true);
    setTestResult(null);

    try {
      const payload: any = {
        action: 'TEST_GATEWAY',
        provider: form.paymentGatewayProvider,
        mode: form.paymentGatewayMode,
      };

      if (form.paymentGatewayProvider === 'RAZORPAY') {
        payload.keyId = form.razorpayKeyId;
        payload.keySecret = form.razorpayKeySecret;
      } else if (form.paymentGatewayProvider === 'CASHFREE') {
        payload.appId = form.cashfreeAppId;
        payload.secretKey = form.cashfreeSecretKey;
      } else if (form.paymentGatewayProvider === 'PHONEPE') {
        payload.merchantId = form.phonepeMerchantId;
        payload.saltKey = form.phonepeSaltKey;
        payload.saltIndex = form.phonepeSaltIndex;
      } else if (form.paymentGatewayProvider === 'PAYTM') {
        payload.merchantId = form.paytmMerchantId;
        payload.merchantKey = form.paytmMerchantKey;
      } else if (form.paymentGatewayProvider === 'INSTAMOJO') {
        payload.apiKey = form.instamojoApiKey;
        payload.authToken = form.instamojoAuthToken;
      } else if (form.paymentGatewayProvider === 'CCAVENUE') {
        payload.merchantId = form.ccavenueMerchantId;
        payload.accessCode = form.ccavenueAccessCode;
        payload.workingKey = form.ccavenueWorkingKey;
      } else if (form.paymentGatewayProvider === 'STRIPE') {
        payload.publishableKey = form.stripePublishableKey;
        payload.secretKey = form.stripeSecretKey;
      } else if (form.paymentGatewayProvider === 'UPI_DIRECT') {
        payload.upiId = form.upiId;
      }

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Credentials validated successfully.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Validation failed. Please verify the credentials.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Could not connect to validation server.',
      });
    } finally {
      setTestingGateway(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Payment Gateway Settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="text-xs font-bold text-slate-500 hover:text-navy-950 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trust Settings</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">
              Payment Gateway Studio
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-gold-600" />
            <span>Payment Gateway & Donation Settings</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure Indian payment processors (Razorpay, Cashfree, PhonePe, Paytm, Direct UPI QR) and bank settlement accounts for donations in INR (₹).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-gold-400" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">
            Payment Gateway configuration saved successfully in INR (₹)!
          </div>
        </div>
      )}

      {/* 1. MASTER CONTROL & ENVIRONMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-heading">
              1. Master Gateway Activation & Environment
            </h3>
            <p className="text-xs text-slate-500">
              Control global online payment acceptance and switch between Sandbox (Test) and Production (Live).
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>INR (₹) Standard</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Master Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-navy-950 block">Payment Acceptance</label>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentGatewayEnabled: !form.paymentGatewayEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.paymentGatewayEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.paymentGatewayEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-700">
                {form.paymentGatewayEnabled ? 'ONLINE PAYMENTS ACTIVE' : 'GATEWAY DISABLED'}
              </span>
            </div>
          </div>

          {/* Environment Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <label className="text-xs font-bold text-navy-950 block">Transaction Environment</label>
            <select
              value={form.paymentGatewayMode}
              onChange={(e) => setForm({ ...form, paymentGatewayMode: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-gold-500"
            >
              <option value="TEST">TEST / SANDBOX (Mock & Simulated Cards)</option>
              <option value="LIVE">LIVE / PRODUCTION (Real Banking Transactions)</option>
            </select>
          </div>

          {/* Currency Standard */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <label className="text-xs font-bold text-navy-950 block">Mandatory Currency</label>
            <input
              type="text"
              disabled
              value="INR (₹ Indian Rupee) - Mandatory"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 2. CHOOSE GATEWAY PROVIDER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div>
          <h3 className="text-base font-bold text-navy-950 font-heading">
            2. Select Payment Gateway Provider
          </h3>
          <p className="text-xs text-slate-500">
            Choose your payment service provider. The credential fields below will automatically adjust according to the selected provider.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PROVIDERS.map((prov) => {
            const isSelected = form.paymentGatewayProvider === prov.id;
            return (
              <div
                key={prov.id}
                onClick={() => {
                  setForm({ ...form, paymentGatewayProvider: prov.id as any });
                  setTestResult(null);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-gold-500 bg-gold-50/20 ring-2 ring-gold-400 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-navy-950 font-heading">
                      {prov.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${prov.badgeColor}`}>
                      {prov.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-gold-700 block">
                    {prov.tagline}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    {prov.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-400">
                    {isSelected ? 'Selected Provider' : 'Click to Select'}
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-gold-500 border-gold-500 text-navy-950' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC CREDENTIALS FORM (CHANGES ACCORDING TO SELECTED PROVIDER) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 font-mono">
                Provider Credentials
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-navy-950 text-white">
                {form.paymentGatewayProvider}
              </span>
            </div>
            <h3 className="text-base font-bold text-navy-950 font-heading mt-0.5">
              3. Configure {PROVIDERS.find((p) => p.id === form.paymentGatewayProvider)?.name} ({form.paymentGatewayMode} Mode)
            </h3>
          </div>

          <button
            type="button"
            disabled={testingGateway}
            onClick={handleTestCredentials}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            {testingGateway ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            )}
            <span>Test {form.paymentGatewayProvider} Keys</span>
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 border ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="text-xs leading-relaxed font-semibold">{testResult.message}</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 1: RAZORPAY */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'RAZORPAY' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <strong>Razorpay Setup Guide:</strong> Obtain your Key ID and Key Secret from the Razorpay Dashboard &gt; Settings &gt; API Keys. Test keys start with <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">rzp_test_</code> and Live keys start with <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">rzp_live_</code>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Razorpay Key ID ({form.paymentGatewayMode} Mode) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={form.paymentGatewayMode === 'TEST' ? 'rzp_test_XXXXXXXXXXXXXX' : 'rzp_live_XXXXXXXXXXXXXX'}
                  value={form.razorpayKeyId}
                  onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Razorpay Key Secret <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter Razorpay Secret..."
                    value={form.razorpayKeySecret}
                    onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Webhook Secret (Optional, for instant server verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. whsec_XXXXXXXXXXXXXXXXXXXXXXXX"
                  value={form.razorpayWebhookSecret}
                  onChange={(e) => setForm({ ...form, razorpayWebhookSecret: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 2: CASHFREE */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'CASHFREE' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
              <strong>Cashfree Setup Guide:</strong> Obtain your App ID and Secret Key from Cashfree Merchant Dashboard &gt; Payment Gateway &gt; Credentials.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cashfree App ID ({form.paymentGatewayMode} Mode) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CFXXXXXXXXXXX"
                  value={form.cashfreeAppId}
                  onChange={(e) => setForm({ ...form, cashfreeAppId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cashfree Secret Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter Cashfree Secret Key..."
                    value={form.cashfreeSecretKey}
                    onChange={(e) => setForm({ ...form, cashfreeSecretKey: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  API Version
                </label>
                <input
                  type="text"
                  value={form.cashfreeApiVersion}
                  onChange={(e) => setForm({ ...form, cashfreeApiVersion: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 3: PHONEPE */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'PHONEPE' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <strong>PhonePe Setup Guide:</strong> Obtain your Merchant ID (MID), Salt Key, and Salt Index from PhonePe Business Merchant Portal.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  PhonePe Merchant ID (MID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MERCHANTECOMM"
                  value={form.phonepeMerchantId}
                  onChange={(e) => setForm({ ...form, phonepeMerchantId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Salt Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter Salt Key..."
                    value={form.phonepeSaltKey}
                    onChange={(e) => setForm({ ...form, phonepeSaltKey: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Salt Index
                </label>
                <input
                  type="text"
                  placeholder="1"
                  value={form.phonepeSaltIndex}
                  onChange={(e) => setForm({ ...form, phonepeSaltIndex: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 4: PAYTM */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'PAYTM' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200 text-xs text-cyan-900 leading-relaxed">
              <strong>Paytm Setup Guide:</strong> Obtain your Merchant ID (MID) and Merchant Key from Paytm for Business &gt; API Keys.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Paytm Merchant ID (MID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIY1234567890"
                  value={form.paytmMerchantId}
                  onChange={(e) => setForm({ ...form, paytmMerchantId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Paytm Merchant Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter Paytm Merchant Key..."
                    value={form.paytmMerchantKey}
                    onChange={(e) => setForm({ ...form, paytmMerchantKey: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Paytm Website Name
                </label>
                <input
                  type="text"
                  placeholder="DEFAULT or WEBSTAGING"
                  value={form.paytmWebsite}
                  onChange={(e) => setForm({ ...form, paytmWebsite: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 5: INSTAMOJO */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'INSTAMOJO' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Instamojo Setup Guide:</strong> Obtain your API Key, Auth Token, and Private Salt from Instamojo Dashboard &gt; Settings &gt; API & Plugins.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Instamojo API Key ({form.paymentGatewayMode} Mode) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. app_XXXXXXXXXXXXX or test_XXXXXXXXXXXXX"
                  value={form.instamojoApiKey}
                  onChange={(e) => setForm({ ...form, instamojoApiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Auth Token <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter Instamojo Auth Token..."
                    value={form.instamojoAuthToken}
                    onChange={(e) => setForm({ ...form, instamojoAuthToken: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Private Salt (Optional, for webhook verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={form.instamojoSalt}
                  onChange={(e) => setForm({ ...form, instamojoSalt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 6: CCAVENUE */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'CCAVENUE' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
              <strong>CCAvenue Setup Guide:</strong> Obtain your Merchant ID, Access Code, and Working Key from CCAvenue Portal &gt; Settings &gt; API Keys.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  CCAvenue Merchant ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={form.ccavenueMerchantId}
                  onChange={(e) => setForm({ ...form, ccavenueMerchantId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Access Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AVXXXXXXXXXX"
                  value={form.ccavenueAccessCode}
                  onChange={(e) => setForm({ ...form, ccavenueAccessCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Working Key (Encryption Key) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter CCAvenue Working Key..."
                    value={form.ccavenueWorkingKey}
                    onChange={(e) => setForm({ ...form, ccavenueWorkingKey: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 7: STRIPE */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'STRIPE' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 text-xs text-sky-900 leading-relaxed">
              <strong>Stripe Setup Guide:</strong> Obtain your Publishable Key and Secret Key from Stripe Dashboard &gt; Developers &gt; API keys. Test keys start with <code className="bg-sky-100 px-1 py-0.5 rounded font-mono">pk_test_</code> / <code className="bg-sky-100 px-1 py-0.5 rounded font-mono">sk_test_</code> and Live keys start with <code className="bg-sky-100 px-1 py-0.5 rounded font-mono">pk_live_</code> / <code className="bg-sky-100 px-1 py-0.5 rounded font-mono">sk_live_</code>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Stripe Publishable Key ({form.paymentGatewayMode} Mode) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={form.paymentGatewayMode === 'TEST' ? 'pk_test_XXXXXXXXXXXXXX' : 'pk_live_XXXXXXXXXXXXXX'}
                  value={form.stripePublishableKey}
                  onChange={(e) => setForm({ ...form, stripePublishableKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Stripe Secret Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder={form.paymentGatewayMode === 'TEST' ? 'sk_test_XXXXXXXXXXXXXX' : 'sk_live_XXXXXXXXXXXXXX'}
                    value={form.stripeSecretKey}
                    onChange={(e) => setForm({ ...form, stripeSecretKey: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Webhook Signing Secret (Optional)
                </label>
                <input
                  type="text"
                  placeholder="whsec_XXXXXXXXXXXXXXXXXXXXXXXX"
                  value={form.stripeWebhookSecret}
                  onChange={(e) => setForm({ ...form, stripeWebhookSecret: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 8: DIRECT UPI & QR CODE */}
        {/* ============================================================ */}
        {form.paymentGatewayProvider === 'UPI_DIRECT' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <strong>Direct UPI Setup:</strong> Funds are paid directly into the Trust bank account via UPI Apps (Google Pay, PhonePe, Paytm, BHIM) with zero gateway commission fees. Applicants manually enter their 12-digit UTR number for verification.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Trust UPI VPA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. nipaniatrust@upi or 9431123456@sbi"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payee Account Name (Verified VPA Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NIPANIA VIKASH SEVA TRUST"
                  value={form.upiPayeeName}
                  onChange={(e) => setForm({ ...form, upiPayeeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Trust Official UPI QR Code Image
                </label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-400 bg-white shrink-0 flex items-center justify-center shadow-xs">
                    {form.upiQrImage ? (
                      <img
                        src={form.upiQrImage}
                        alt="UPI QR Code"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <QrCode className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-navy-950 text-white hover:bg-navy-900 shadow-xs transition-all active:scale-98">
                        <Upload className="w-3.5 h-3.5 text-gold-400" />
                        <span>{uploadingQr ? 'Uploading...' : 'Upload Official QR'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          ref={qrInputRef}
                          className="hidden"
                          disabled={uploadingQr}
                          onChange={handleQrUpload}
                        />
                      </label>
                      {form.upiQrImage && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, upiQrImage: '' })}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Remove QR
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload your bank-issued UPI QR code (JPG or PNG). This will be shown to applicants and donors during checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked Bank Account Details for NEFT / RTGS / Direct Transfers */}
              <div className="sm:col-span-2 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-navy-950 text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gold-600" />
                      <span>Linked Official Bank Account Coordinates</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      These details are displayed on the public direct donation panel for bank transfers.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={form.isBankPublic}
                      onChange={(e) => setForm({ ...form, isBankPublic: e.target.checked })}
                      className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 border-slate-300"
                    />
                    <span>Show Bank Info Publicly</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. NIPANIA VIKASH SEVA TRUST"
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 38920194820"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-gold-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={form.ifscCode}
                      onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-gold-500 font-bold uppercase"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Branch Name & Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Nipania Main Branch, Jharkhand"
                      value={form.branchName}
                      onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating / Sticky Save Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Selected Gateway: <strong className="text-navy-950">{form.paymentGatewayProvider}</strong> ({form.paymentGatewayMode}) • Status: <strong className={form.paymentGatewayEnabled ? 'text-emerald-600' : 'text-slate-400'}>{form.paymentGatewayEnabled ? 'Active' : 'Disabled'}</strong>
        </div>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-400" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-gold-400" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
