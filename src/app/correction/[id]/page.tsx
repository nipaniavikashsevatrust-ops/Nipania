'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import {
  FileEdit,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Heart,
  ChevronLeft,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const VOLUNTEER_CATEGORIES = [
  'Community Volunteer',
  'Education Volunteer',
  'Healthcare Support',
  'Event Volunteer',
  'Field Volunteer',
  'Digital Volunteer',
  'Fundraising Volunteer',
  'Social Media Volunteer',
  'Other Social Support',
];

const MEMBER_CATEGORIES = [
  'General Member',
  'Life Member',
  'Executive Member',
  'Patron Member',
];

const AVAILABILITY_OPTIONS = [
  'Weekends Only',
  'Weekdays (Morning)',
  'Weekdays (Evening)',
  'Full Time / Flexible',
  'Event-Based / On Call',
];

export default function ApplicationCorrectionPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Application Data & Form State
  const [appType, setAppType] = useState<'VOLUNTEER' | 'MEMBER'>('VOLUNTEER');
  const [originalData, setOriginalData] = useState<any>(null);

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
    category: '',
    // Volunteer specific:
    education: '',
    skills: '',
    areasOfInterest: '',
    availability: 'Weekends Only',
    preferredLocation: '',
    emergencyContact: '',
    // Photo:
    photoUrl: '',
  });

  useEffect(() => {
    if (!idParam) return;
    fetchApplicationDetails();
  }, [idParam]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`/api/correction/${encodeURIComponent(idParam)}`);
      const data = await res.json();

      if (res.ok && data.found) {
        setAppType(data.type);
        setOriginalData(data.application);

        setFormData({
          fullName: data.application.fullName || '',
          guardianName: data.application.guardianName || '',
          dob: data.application.dob || '',
          gender: data.application.gender || 'Male',
          mobile: data.application.mobile || '',
          email: data.application.email || '',
          address: data.application.address || '',
          district: data.application.district || '',
          state: data.application.state || 'Jharkhand',
          pincode: data.application.pincode || '',
          occupation: data.application.occupation || '',
          category: data.application.category || (data.type === 'VOLUNTEER' ? 'Community Volunteer' : 'General Member'),
          education: data.application.education || '',
          skills: data.application.skills || '',
          areasOfInterest: data.application.areasOfInterest || '',
          availability: data.application.availability || 'Weekends Only',
          preferredLocation: data.application.preferredLocation || '',
          emergencyContact: data.application.emergencyContact || '',
          photoUrl: data.application.photoUrl || '',
        });
      } else {
        setFetchError(data.error || 'Could not find the requested application.');
      }
    } catch (err: any) {
      setFetchError('Network error while retrieving application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Photo file size should be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setSubmitError('');

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
        // Fallback to base64
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim()) {
      setSubmitError('Full Legal Name, Mobile Number, and Email are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`/api/correction/${encodeURIComponent(idParam)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(data.error || 'Failed to submit application corrections. Please check your inputs.');
      }
    } catch (err) {
      setSubmitError('Network error while submitting corrections. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/correction"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Correction Desk</span>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-card text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-navy-950">Loading application details...</p>
              <p className="text-xs text-slate-400">Fetching records for reference: {idParam}</p>
            </div>
          )}

          {/* Error / Not Found State */}
          {!loading && fetchError && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-card text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-navy-950">Application Not Found</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{fetchError}</p>
              </div>
              <div className="pt-2 flex justify-center gap-4">
                <Link
                  href="/correction"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-all"
                >
                  Search Another ID
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2.5 rounded-full text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Contact Helpdesk
                </Link>
              </div>
            </div>
          )}

          {/* Success State After Submission */}
          {!loading && submittedSuccess && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-400 shadow-card text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="title-ornament mb-1">
                  <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
                    Corrections Submitted Successfully
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
                  Application Updated & Resubmitted!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong>{formData.fullName}</strong>. Your updated details and photograph have been saved and your application status has been returned to <strong>Pending Review</strong>.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-2 text-xs text-emerald-950">
                <div className="flex justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-emerald-700 font-medium">Application Reference:</span>
                  <span className="font-mono font-bold">{originalData?.referenceId}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-emerald-700 font-medium">Application Type:</span>
                  <span className="font-bold">{appType === 'VOLUNTEER' ? 'Volunteer Registration' : 'Membership Application'}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-emerald-700 font-medium">New Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">PENDING REVIEW</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-emerald-700 font-medium">Next Action:</span>
                  <span className="text-slate-700 font-medium">Administrative verification & ID issue</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all"
                >
                  Return to Trust Homepage
                </Link>
                <button
                  onClick={() => {
                    setSubmittedSuccess(false);
                    fetchApplicationDetails();
                  }}
                  className="px-6 py-3 rounded-full text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Review Submitted Details
                </button>
              </div>
            </div>
          )}

          {/* Main Correction Form */}
          {!loading && !fetchError && !submittedSuccess && originalData && (
            <div className="space-y-8">
              
              {/* Header Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-navy-100 text-navy-800">
                        {appType === 'VOLUNTEER' ? 'Volunteer Application' : 'Membership Application'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        Ref: {originalData.referenceId}
                      </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
                      Correction & Update Portal
                    </h1>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      originalData.status === 'NEEDS_CORRECTION'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : originalData.status === 'APPROVED' || originalData.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {originalData.status === 'NEEDS_CORRECTION' && <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />}
                      {originalData.status === 'NEEDS_CORRECTION' ? 'Action Required' : originalData.status}
                    </span>
                  </div>
                </div>

                {/* If Already Approved Notice */}
                {(originalData.status === 'APPROVED' || originalData.status === 'ACTIVE') && (
                  <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-900 space-y-1">
                      <p className="font-bold text-sm">This application has already been approved!</p>
                      <p>
                        Your official identity card is active. You can verify and preview your active credentials anytime at{' '}
                        <Link href={`/verify/${originalData.referenceId}`} className="font-bold underline text-emerald-800">
                          /verify/{originalData.referenceId}
                        </Link>.
                      </p>
                    </div>
                  </div>
                )}

                {/* PROMINENT ADMIN REMARKS BANNER */}
                {originalData.adminRemarks && (
                  <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>Administrator Remarks & Required Modifications:</span>
                    </div>

                    <div className="bg-white/90 p-4 rounded-xl border border-orange-200 shadow-inner">
                      <p className="text-xs sm:text-sm font-semibold text-orange-950 whitespace-pre-wrap leading-relaxed">
                        "{originalData.adminRemarks}"
                      </p>
                    </div>

                    <p className="text-[11px] text-orange-800 font-medium">
                      💡 Please review the administrator remarks above, make the necessary corrections in the form below, and click <strong>Submit Corrected Application</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Correction Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Section 1: Photograph */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-base text-navy-950 font-heading">
                      1. Identity Photograph
                    </h3>
                    <p className="text-xs text-slate-500">
                      If requested by admin, upload a clear, front-facing passport photograph with a plain background.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-32 h-40 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 shadow-sm">
                      {formData.photoUrl ? (
                        <Image
                          src={formData.photoUrl}
                          alt="Applicant Photo"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-400">
                          <User className="w-10 h-10 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">No photo uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <div>
                        <span className="text-xs font-bold text-navy-950 block">Upload New / Replacement Photo</span>
                        <span className="text-[11px] text-slate-500 block">
                          Supports JPG, PNG, WEBP (Max 5MB). Photo will be printed on your official PVC ID card.
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                        <label className="cursor-pointer px-4 py-2.5 rounded-full text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white flex items-center gap-2 shadow-sm transition-all">
                          {uploadingPhoto ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-gold-400" />
                              <span>Choose New Image</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                        </label>

                        {formData.photoUrl && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Photo Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Details */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-base text-navy-950 font-heading">
                      2. Personal Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ensure your legal name matches your official Aadhaar or Government ID.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Father's / Guardian's Name
                      </label>
                      <input
                        type="text"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Residential Address */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-base text-navy-950 font-heading">
                      3. Residential Address
                    </h3>
                    <p className="text-xs text-slate-500">
                      Provide your full street address and 6-digit postal code.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Street Address / Village / Locality <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="e.g. Chatra, Ranchi, Hazaribagh"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="e.g. 825403"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Role & Organization Details */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-base text-navy-950 font-heading">
                      4. Role & Background Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update your role category, occupation, or availability.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Category / Role
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium bg-white"
                      >
                        {appType === 'VOLUNTEER'
                          ? VOLUNTEER_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))
                          : MEMBER_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Occupation / Profession
                      </label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="e.g. Student, Teacher, Social Worker, Business"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>

                    {appType === 'VOLUNTEER' && (
                      <>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Availability
                          </label>
                          <select
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium bg-white"
                          >
                            {AVAILABILITY_OPTIONS.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Emergency Contact Number
                          </label>
                          <input
                            type="tel"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Skills & Areas of Interest
                          </label>
                          <input
                            type="text"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="e.g. Teaching, First Aid, Medical Camps, Event Coordination"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Action Box */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 text-center sm:text-left">
                    <p className="font-bold text-navy-950 text-sm">Ready to resubmit?</p>
                    <p>
                      Submitting will update your application and set status to <strong>Pending Review</strong> for prompt administrative re-evaluation.
                    </p>
                  </div>

                  {(() => {
                    const isFormComplete = Boolean(
                      formData.fullName.trim() &&
                      formData.dob &&
                      formData.mobile.trim().length >= 10 &&
                      formData.email.trim() &&
                      formData.email.includes('@') &&
                      formData.address.trim() &&
                      formData.district.trim() &&
                      formData.pincode.trim().length >= 6
                    );

                    return (
                      <button
                        type="submit"
                        disabled={submitting || uploadingPhoto || !isFormComplete}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600 shrink-0"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Resubmitting Application...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Corrected Application</span>
                            <ArrowRight className="w-4 h-4 text-white" />
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
