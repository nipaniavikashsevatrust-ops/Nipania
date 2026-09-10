'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Heart, Users, CheckCircle2, ShieldCheck, ArrowRight, Upload, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

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

const AVAILABILITY_OPTIONS = [
  'Weekends Only',
  'Weekdays (Morning)',
  'Weekdays (Evening)',
  'Full Time / Flexible',
  'Event-Based / On Call',
];

export default function VolunteerPage() {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  
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
    education: '',
    occupation: '',
    category: 'Community Volunteer',
    skills: '',
    areasOfInterest: '',
    availability: 'Weekends Only',
    preferredLocation: '',
    emergencyContact: '',
    photoUrl: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Photo size should be under 5MB.';
      setError(msg);
      showError(msg);
      return;
    }

    setUploadingPhoto(true);
    setError('');
    showInfo('Uploading photo...');

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
        showSuccess('Photo uploaded successfully!');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
          showInfo('Photo loaded locally');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
        showInfo('Photo loaded locally');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      const msg = 'Please agree to the volunteer declaration and ethical code.';
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    setError('');
    showInfo('Submitting your volunteer application...');

    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.volunteer) {
        setSuccessData(data.volunteer);
        showSuccess('Volunteer application submitted successfully!');
      } else {
        const msg = data.error || 'Failed to submit registration. Please try again.';
        setError(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = 'Network error occurred. Please try again.';
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="title-ornament mb-2">
              <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                Join Our Team of Change Makers
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
              Become a Volunteer
            </h1>
            <p className="text-sm text-slate-600">
              Dedicate your passion, skills, and time to impactful social initiatives. Every registered volunteer receives an official trackable Volunteer ID.
            </p>
          </div>

          {successData ? (
            /* Success Card */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-gold-400 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
                  Volunteer Application Submitted!
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Thank you, <strong className="text-navy-950">{successData.fullName}</strong>. Your volunteer application has been received and is pending administrative approval.
                </p>
              </div>

              {/* Unique Generated Volunteer ID Card Highlight */}
              <div className="max-w-sm mx-auto bg-navy-950 text-white rounded-2xl p-6 border border-gold-400/50 shadow-2xl space-y-3 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white p-0.5 relative">
                      <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold-400 block leading-tight">Nipania Trust</span>
                      <span className="text-[8px] text-slate-400 block">VOLUNTEER APPLICATION</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-400 text-navy-950">
                    PENDING REVIEW
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-18 rounded-xl overflow-hidden border border-gold-400/60 bg-navy-900 shrink-0 flex items-center justify-center">
                    {successData.photoUrl ? (
                      <Image src={successData.photoUrl} alt={successData.fullName} fill className="object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-gold-400/70" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Assigned Volunteer ID:</span>
                    <span className="text-lg font-bold font-mono text-gold-300 tracking-wider">
                      {successData.volunteerId}
                    </span>
                    <p className="text-xs font-bold text-white leading-tight">{successData.fullName}</p>
                    <p className="text-[11px] text-gold-400">{successData.category}</p>
                  </div>
                </div>

                <div className="text-[11px] pt-1 border-t border-navy-900 text-slate-300">
                  <p><strong>Location:</strong> {successData.district || 'Jharkhand'}, {successData.state}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once verified by the Trust Administration, your official single-sided PVC ID card will be activated and accessible at <Link href={`/verify/${successData.volunteerId}`} className="text-gold-600 underline font-mono">{successData.volunteerId}</Link>.
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/projects"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Explore Ongoing Projects
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
                        Passport-Size Photo (For Official PVC ID Card)
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-100 px-2.5 py-0.5 rounded-full self-start xs:self-auto">
                      ID Card Credential
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="relative w-24 h-28 rounded-2xl overflow-hidden border-2 border-gold-400 bg-navy-950 shrink-0 shadow-md flex items-center justify-center">
                      {formData.photoUrl ? (
                        <Image
                          src={formData.photoUrl}
                          alt="Volunteer Photo Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Users className="w-8 h-8 text-gold-400/80 mx-auto mb-1" />
                          <span className="text-[8px] text-slate-300 font-semibold block">Photo Preview</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <p className="text-xs text-slate-600">
                        Upload a clear front-facing passport photograph with plain background. This will be printed on your official trust badge.
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
                
                {/* 1. Personal Information */}
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-heading mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs flex items-center justify-center font-bold">1</span>
                    Personal Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="As per Government ID"
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

                {/* 2. Contact & Address */}
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-heading mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs flex items-center justify-center font-bold">2</span>
                    Contact & Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Residential Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Village / Street, Post Office, Landmark"
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
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jharkhand"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="Contact number of family/friend"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Skills & Preferences */}
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-heading mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-400 text-xs flex items-center justify-center font-bold">3</span>
                    Skills, Background & Volunteering Area
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Educational Qualification
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Graduate, 12th Pass, Diploma"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Current Occupation / Profession
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Student, Teacher, Self-employed"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Volunteer Role <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                      >
                        {VOLUNTEER_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Availability
                      </label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                      >
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Special Skills / Relevant Experience
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Teaching math, medical first aid, photography, social media management, community mobilization"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Consent & Declaration */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                    />
                    <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                      I hereby declare that the details furnished above are true and correct to the best of my knowledge. I commit to adhere to the core values of <strong>Seva, Vikash, and Samarpan</strong> and the ethical guidelines of <strong>Nipania Vikash Seva Trust</strong>.
                    </label>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="text-center pt-2">
                  {(() => {
                    const isFormComplete = Boolean(
                      formData.fullName.trim() &&
                      formData.dob &&
                      formData.mobile.trim().length >= 10 &&
                      formData.email.trim() &&
                      formData.email.includes('@') &&
                      formData.address.trim() &&
                      formData.district.trim() &&
                      formData.pincode.trim().length >= 6 &&
                      formData.consent
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
                            <span>Registering Application...</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4" />
                            <span>Submit Volunteer Application</span>
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
