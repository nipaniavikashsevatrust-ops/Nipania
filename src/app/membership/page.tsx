'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import {
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Award,
  Upload,
  CreditCard,
  IndianRupee,
  QrCode,
  Sparkles,
  Mail,
  Printer,
  Copy,
  Check,
} from 'lucide-react';

const MEMBERSHIP_CATEGORIES = [
  {
    name: 'General Member',
    validity: 'Annual Renewal',
    desc: 'Participate in community meetings, volunteer programs, and trust initiatives.',
  },
  {
    name: 'Life Member',
    validity: 'Lifetime Association',
    desc: 'Permanent association with advisory and developmental inputs for social projects.',
  },
  {
    name: 'Executive Member',
    validity: 'Active Term',
    desc: 'Direct responsibility in program execution and regional chapter coordination.',
  },
  {
    name: 'Patron Member',
    validity: 'Honorary / Sustaining',
    desc: 'Distinguished supporters steering strategic growth and large community campaigns.',
  },
];

export default function MembershipPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    guardianName: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    email: '',
    address: '',
    district: '',
    state: 'Jharkhand',
    pincode: '',
    occupation: '',
    category: 'General Member',
    photoUrl: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  // Payment & Membership Fee Configuration (INR)
  const [paymentConfig, setPaymentConfig] = useState({
    membershipFeeEnabled: true,
    currencySymbol: '₹',
    currency: 'INR',
    fees: {
      'General Member': 500,
      'Life Member': 5000,
      'Executive Member': 2100,
      'Patron Member': 11000,
    } as Record<string, number>,
    gatewayEnabled: false,
    provider: 'RAZORPAY',
    upiId: 'nipaniatrust@upi',
    upiQrImage: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_GATEWAY' | 'UPI_QR' | 'SIMULATED'>('ONLINE_GATEWAY');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const copyUpiId = () => {
    if (paymentConfig.upiId) {
      navigator.clipboard.writeText(paymentConfig.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 3000);
    }
  };

  useEffect(() => {
    fetch('/api/payment')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setPaymentConfig((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch((err) => console.warn('Could not load payment settings, using defaults:', err));
  }, []);

  const currentFee = paymentConfig.membershipFeeEnabled
    ? (paymentConfig.fees[formData.category] ?? 500)
    : 0;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size should be under 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, photoUrl: data.url }));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const submitMembershipRecord = async (payId: string | null, method: string) => {
    const payload = {
      ...formData,
      feeAmount: currentFee,
      paymentStatus: currentFee > 0 ? 'PAID' : 'FREE',
      paymentMethod: method,
      paymentId: payId,
    };

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.member) {
      setSuccessData(data.member);
    } else {
      setError(data.error || 'Failed to submit membership application. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setError('Please agree to the membership constitution and declaration.');
      return;
    }

    if (currentFee > 0 && paymentMethod === 'UPI_QR' && !utrNumber.trim()) {
      setError('Please enter your 12-digit UPI UTR / Transaction Reference Number after completing payment.');
      return;
    }

    setLoading(true);
    setError('');

    // Flow 1: Direct UPI QR
    if (currentFee > 0 && paymentMethod === 'UPI_QR') {
      try {
        await submitMembershipRecord(utrNumber.trim(), 'DIRECT_UPI_QR');
      } catch (err) {
        setError('Network error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Flow 2: Free / Complimentary Registration
    if (currentFee <= 0) {
      try {
        await submitMembershipRecord(null, 'FREE');
      } catch (err) {
        setError('Network error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Flow 3: Online Gateway (Razorpay)
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentFee,
          donorName: formData.fullName,
          donorEmail: formData.email,
          donorPhone: formData.mobile,
          purpose: `Membership Fee - ${formData.category}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway.');
      }

      // If simulated or keys unconfigured, submit directly
      if (orderData.isSimulated && !orderData.keyId?.startsWith('rzp_')) {
        await submitMembershipRecord(`SIM_PAY_${Date.now()}`, 'ONLINE (TEST GATEWAY)');
        setLoading(false);
        return;
      }

      // Load Razorpay Script if needed
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load secure payment script.'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Nipania Vikash Seva Trust',
        description: `Membership Registration (${formData.category})`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: { color: '#0B192C' },
        handler: async function (response: any) {
          try {
            await submitMembershipRecord(response.razorpay_payment_id, 'ONLINE (RAZORPAY)');
          } catch (e) {
            setError('Failed to record membership after payment. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment checkout cancelled. You can retry whenever ready.');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="title-ornament mb-2">
              <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                Join the Trust Community
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
              Become a Member
            </h1>
            <p className="text-sm text-slate-600">
              Join Nipania Vikash Seva Trust as an official member to support governance, community welfare projects, and strategic outreach.
            </p>
          </div>

          {/* Membership Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {MEMBERSHIP_CATEGORIES.map((cat) => {
              const isSelected = formData.category === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => setFormData({ ...formData, category: cat.name })}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-gold-500 bg-white ring-2 ring-gold-400 shadow-md'
                      : 'border-slate-200 bg-white hover:border-gold-300'
                  }`}
                >
                  <Award className={`w-6 h-6 mb-2 ${isSelected ? 'text-gold-600' : 'text-slate-400'}`} />
                  <h4 className="font-bold text-sm text-navy-950">{cat.name}</h4>
                  <span className="text-[10px] font-semibold text-gold-700 block mt-0.5">{cat.validity}</span>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>

          {successData ? (
            /* Success View */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-gold-400 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
                  Membership Application Received!
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Thank you, <strong className="text-navy-950">{successData.fullName}</strong>. Your membership enrollment is submitted and awaiting verification.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Registration & Fee Receipt PDF has been dispatched to <strong>{successData.email}</strong>.</span>
                </div>
              </div>

              <div className="max-w-sm mx-auto bg-navy-950 text-white rounded-2xl p-6 border border-gold-400/50 shadow-2xl space-y-3 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white p-0.5 relative">
                      <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold-400 block leading-tight">Nipania Trust</span>
                      <span className="text-[8px] text-slate-400 block">MEMBERSHIP PASS</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-400 text-navy-950">
                    PENDING APPROVAL
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-18 rounded-xl overflow-hidden border border-gold-400/60 bg-navy-900 shrink-0 flex items-center justify-center">
                    {successData.photoUrl ? (
                      <Image src={successData.photoUrl} alt={successData.fullName} fill className="object-cover" />
                    ) : (
                      <Award className="w-8 h-8 text-gold-400/70" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Assigned Member ID:</span>
                    <span className="text-lg font-bold font-mono text-gold-300 tracking-wider">
                      {successData.memberId}
                    </span>
                    <p className="text-xs font-bold text-white leading-tight">{successData.fullName}</p>
                    <p className="text-[11px] text-gold-400">{successData.category}</p>
                  </div>
                </div>

                <div className="text-[11px] pt-1 border-t border-navy-900 text-slate-300">
                  <p><strong>District:</strong> {successData.district || 'Jharkhand'}, {successData.state}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once reviewed and approved by the Board of Trustees, your verified single-sided PVC membership card will be activated at <Link href={`/verify/${successData.memberId}`} className="text-gold-600 underline font-mono">{successData.memberId}</Link>.
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Contact Trust Office
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-white rounded-3xl p-4 sm:p-10 border border-slate-200 shadow-card">
              
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Photo Upload Section for Official ID Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-warm-50 border border-gold-400/40 shadow-xs space-y-3">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-navy-950 text-xs flex items-center justify-center font-bold shrink-0">★</span>
                      <h3 className="text-xs sm:text-sm font-bold text-navy-950 font-heading">
                        Passport-Size Photo (For Official PVC Member Card)
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-100 px-2.5 py-0.5 rounded-full self-start xs:self-auto">
                      Member Credential
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="relative w-24 h-28 rounded-2xl overflow-hidden border-2 border-gold-400 bg-navy-950 shrink-0 shadow-md flex items-center justify-center">
                      {formData.photoUrl ? (
                        <Image
                          src={formData.photoUrl}
                          alt="Member Photo Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Award className="w-8 h-8 text-gold-400/80 mx-auto mb-1" />
                          <span className="text-[8px] text-slate-300 font-semibold block">Photo Preview</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <p className="text-xs text-slate-600">
                        Upload a front-facing formal passport photograph. This photo will be embedded into your official verified Trust Membership Card.
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white transition-all flex items-center gap-2 shadow-xs">
                          {uploadingPhoto ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-400" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-gold-400" />
                          )}
                          <span>{uploadingPhoto ? 'Processing Photo...' : 'Upload Passport Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>

                        {formData.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photoUrl: '' })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">Accepted formats: JPG, PNG, WebP (Max 5MB)</span>
                    </div>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-heading mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs flex items-center justify-center font-bold">1</span>
                    Applicant Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="As per legal records"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Father / Guardian / Spouse Name
                      </label>
                      <input
                        type="text"
                        placeholder="Guardian Full Name"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & Residential */}
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-heading mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs flex items-center justify-center font-bold">2</span>
                    Contact & Professional Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Current Profession / Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Advocate, Teacher, Business, Social Leader"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Membership Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                      >
                        {MEMBERSHIP_CATEGORIES.map((cat) => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Residential Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Street address, City/Town"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ranchi / Dhanbad"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="854301"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Membership Contribution & Payment (INR ₹) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-navy-950 font-heading flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-gold-600" />
                        <span>Membership Contribution & Registration Charge</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official contribution for {formData.category} tier in Indian Rupees (INR ₹).
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-800 border border-gold-300">
                      {currentFee > 0 ? `₹${currentFee.toLocaleString('en-IN')} INR` : 'FREE / COMPLIMENTARY'}
                    </span>
                  </div>

                  {currentFee > 0 ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-warm-50 border border-gold-400/40 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-500 block">Selected Membership Cadre:</span>
                          <span className="font-bold text-navy-950 text-sm">{formData.category}</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-slate-500 block">Applicable Fee Amount:</span>
                          <span className="font-bold font-mono text-emerald-700 text-base">
                            ₹{currentFee.toLocaleString('en-IN')} INR
                          </span>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Choose Payment Method:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <label className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-2.5 ${
                            paymentMethod === 'ONLINE_GATEWAY'
                              ? 'border-gold-500 bg-gold-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}>
                            <input
                              type="radio"
                              name="payMethod"
                              checked={paymentMethod === 'ONLINE_GATEWAY'}
                              onChange={() => setPaymentMethod('ONLINE_GATEWAY')}
                              className="mt-0.5 text-gold-600"
                            />
                            <div>
                              <span className="font-bold text-navy-950 block">Online Payment Gateway</span>
                              <span className="text-[11px] text-slate-500">
                                {paymentConfig.provider
                                  ? `Instant checkout via ${paymentConfig.provider.replace('_', ' ')} (UPI, Cards, NetBanking)`
                                  : 'Instant UPI, Debit/Credit Card, NetBanking'}
                              </span>
                            </div>
                          </label>

                          <label className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-2.5 ${
                            paymentMethod === 'UPI_QR'
                              ? 'border-gold-500 bg-gold-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}>
                            <input
                              type="radio"
                              name="payMethod"
                              checked={paymentMethod === 'UPI_QR'}
                              onChange={() => setPaymentMethod('UPI_QR')}
                              className="mt-0.5 text-gold-600"
                            />
                            <div>
                              <span className="font-bold text-navy-950 block">Direct UPI QR Scan</span>
                              <span className="text-[11px] text-slate-500">Pay via Google Pay, PhonePe, Paytm & enter UTR</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* If Direct UPI QR selected */}
                      {paymentMethod === 'UPI_QR' && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4 animate-in fade-in-50 text-xs">
                          {paymentConfig.upiQrImage && (
                            <div className="text-center">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-2">
                                Scan Trust Official UPI QR Code:
                              </span>
                              <div className="inline-block p-2 bg-white rounded-2xl border border-amber-300 shadow-md">
                                <img
                                  src={paymentConfig.upiQrImage}
                                  alt="Trust UPI QR Code"
                                  className="w-40 h-40 object-contain mx-auto"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Trust UPI ID:</span>
                              <span className="font-mono font-bold text-navy-950 text-sm">
                                {paymentConfig.upiId || 'nipaniatrust@upi'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                            >
                              {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>

                          <div>
                            <label className="block text-amber-950 font-bold mb-1">
                              Transaction Reference ID / UTR Number (12 Digits) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 423190823412 or Bank Ref No."
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Enter the 12-digit UPI UTR or bank transaction reference after making the transfer on your UPI app.
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>All contributions are accounted for under charitable compliance with instant registration receipt.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Complimentary Registration: Zero fee required for this application cycle.</span>
                    </div>
                  )}
                </div>

                {/* Declaration */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="member-consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                    />
                    <label htmlFor="member-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                      I accept the objectives, rules, and constitution of <strong>Nipania Vikash Seva Trust</strong>. I agree to contribute constructively to the Trust's social mission under the motto <em>Seva, Vikash, and Samarpan</em>.
                    </label>
                  </div>
                </div>

                <div className="text-center pt-2">
                  {(() => {
                    const isFormComplete = Boolean(
                      formData.fullName.trim() &&
                      formData.dob &&
                      formData.mobile.trim().length >= 10 &&
                      formData.email.trim() &&
                      formData.email.includes('@') &&
                      formData.occupation.trim() &&
                      formData.address.trim() &&
                      formData.district.trim() &&
                      formData.pincode.trim().length >= 6 &&
                      formData.consent &&
                      (!paymentConfig.membershipFeeEnabled || paymentMethod !== 'UPI_QR' || utrNumber.trim().length >= 6)
                    );

                    return (
                      <button
                        type="submit"
                        disabled={loading || !isFormComplete}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-navy-950 shadow-gold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-gold-500 disabled:hover:to-gold-500"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Submit Membership Application</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>

              </form>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
