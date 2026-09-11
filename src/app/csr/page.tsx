'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import {
  Building2,
  ShieldCheck,
  Award,
  CheckCircle2,
  FileCheck,
  Send,
  Loader2,
  HeartHandshake,
  Users,
  GraduationCap,
  HeartPulse,
  Sprout,
  Droplets,
  Coins,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Target,
  Briefcase,
  FileText,
  Globe,
  Lightbulb,
  BarChart3,
  Calendar,
  Video,
  Download,
  ExternalLink,
  Clock,
  IndianRupee,
  CircleDot
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';

// CSR Partnership Benefits
const PARTNERSHIP_BENEFITS = [
  {
    icon: ShieldCheck,
    title: '100% Tax Compliance',
    description: 'Section 80G, 12A certification with instant Form 10BD generation and CA-certified audit reports.',
  },
  {
    icon: FileCheck,
    title: 'Complete Documentation',
    description: 'MoA, utilization certificates, milestone reports, and geotagged photo/video evidence.',
  },
  {
    icon: Target,
    title: 'Measurable Impact',
    description: 'Real-time dashboard tracking, beneficiary data, and transparent fund utilization metrics.',
  },
  {
    icon: Users,
    title: 'Corporate Volunteering',
    description: 'Employee engagement opportunities through field visits and hands-on CSR activities.',
  },
];

// Schedule VII Focus Areas with enhanced data
const FOCUS_AREAS = [
  {
    id: 'healthcare',
    title: 'Healthcare & Wellness',
    icon: HeartPulse,
    schedule: 'Schedule VII (i)',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    desc: 'Mobile medical units, free health camps, maternal care, diagnostic screenings, and medicine distribution.',
    impact: '15,000+ patients treated annually',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'education',
    title: 'Education & Skill Development',
    icon: GraduationCap,
    schedule: 'Schedule VII (ii)',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    desc: 'Smart classrooms, learning kits, scholarships, vocational training, and school infrastructure.',
    impact: '8,000+ students supported',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'women-empowerment',
    title: 'Women Empowerment',
    icon: Users,
    schedule: 'Schedule VII (iii)',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    desc: 'SHG formation, vocational training, micro-entrepreneurship, and financial literacy programs.',
    impact: '2,500+ women trained',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'environment',
    title: 'Environmental Sustainability',
    icon: Sprout,
    schedule: 'Schedule VII (iv)',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    desc: 'Tree plantation, solar installations, water conservation, and sustainable sanitation facilities.',
    impact: '50,000+ trees planted',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'nutrition',
    title: 'Hunger & Nutrition Relief',
    icon: HeartHandshake,
    schedule: 'Schedule VII (i)',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    desc: 'Community kitchens, supplemental nutrition, ration distribution, and meal programs.',
    impact: '25,000+ meals served monthly',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rural-development',
    title: 'Rural Infrastructure',
    icon: Building2,
    schedule: 'Schedule VII (x)',
    color: 'from-slate-600 to-slate-800',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    desc: 'Community centers, solar lighting, disaster relief, and basic infrastructure development.',
    impact: '120+ villages reached',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
  },
];

// CSR Process Steps
const CSR_PROCESS = [
  {
    step: '01',
    title: 'Initial Consultation',
    description: 'Submit enquiry and schedule a detailed discussion with our CSR team within 24-48 hours.',
    icon: Phone,
  },
  {
    step: '02',
    title: 'Proposal & Site Visit',
    description: 'Receive customized project proposal, budget breakdown, and arrange field visit if required.',
    icon: FileText,
  },
  {
    step: '03',
    title: 'MoA & Implementation',
    description: 'Sign Memorandum of Agreement and begin project execution with milestone tracking.',
    icon: Briefcase,
  },
  {
    step: '04',
    title: 'Reporting & Impact',
    description: 'Receive quarterly progress reports, fund utilization certificates, and impact assessment.',
    icon: BarChart3,
  },
];

// FAQs
const CSR_FAQS = [
  {
    q: 'Is your organization eligible to receive CSR funds under Section 135?',
    a: 'Yes. Nipania Vikash Seva Trust is a registered non-profit charitable trust operating in full compliance with Section 135 of the Companies Act, 2013, with valid 12A and 80G certifications.',
  },
  {
    q: 'What documentation do you provide for compliance and audit?',
    a: 'We furnish comprehensive documentation including signed MoA, project work plan, 80G receipts, Form 10BD acknowledgment, quarterly progress reports, geotagged media, fund utilization certificates, and CA-certified audit reports.',
  },
  {
    q: 'Can we customize the CSR project scope and budget?',
    a: 'Absolutely. Every partnership is co-designed to match your ESG priorities, budget allocation, timeline, and geographical focus areas. We offer complete flexibility.',
  },
  {
    q: 'Do you allow corporate employees to visit project sites?',
    a: 'Yes! We actively encourage and coordinate Corporate Volunteer Days, site inspections, and inaugural ceremonies where your team can participate in on-ground activities.',
  },
  {
    q: 'What is your typical project implementation timeline?',
    a: 'Implementation timelines vary by project scope. Small initiatives (₹5-15L) typically take 3-6 months, while comprehensive programs (₹50L+) span 12-24 months with phased milestones.',
  },
  {
    q: 'How do you ensure transparency and fund utilization tracking?',
    a: 'We provide real-time project dashboards, monthly expense statements, third-party audit verification, geotagged beneficiary photos/videos, and direct access to our CSR manager throughout the project lifecycle.',
  },
];

export default function CsrPage() {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    focusArea: 'Healthcare & Wellness',
    budgetRange: '₹5 Lakhs - ₹15 Lakhs',
    locationPreference: 'Jharkhand (Chatra / Dhanbad)',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showInfo('Submitting your CSR partnership enquiry...');

    try {
      const res = await fetch('/api/csr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        showSuccess('CSR enquiry submitted successfully! Our team will connect within 24-48 hours.');
      } else {
        showError(data.error || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err: any) {
      showError('Network error. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION - Modern Clean Design */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-warm-50 py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-slate-100">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold">
                    <Building2 className="w-4 h-4" />
                    Corporate Social Responsibility
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-navy-950 tracking-tight leading-[1.1]">
                    Partner for
                    <span className="block mt-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                      Sustainable Impact
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                    Deploy measurable, Schedule VII-aligned CSR projects with 100% compliance, verified impact, and complete transparency.
                  </p>
                </div>

                {/* Trust Credentials */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium mb-1">Tax Exemption</div>
                    <div className="text-sm font-bold text-navy-950">80G Certified</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium mb-1">Darpan ID</div>
                    <div className="text-sm font-bold text-navy-950 font-mono">UP/2021/0295112</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium mb-1">Trust Reg.</div>
                    <div className="text-sm font-bold text-navy-950 font-mono">IV-120/2022</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#enquiry-form"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold shadow-lg shadow-amber-600/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Submit CSR Enquiry</span>
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="#focus-areas"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-400 text-navy-950 font-bold transition-all"
                  >
                    <span>Explore Projects</span>
                  </a>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-8 pt-4">
                  <div>
                    <div className="text-3xl font-black text-navy-950">50,000+</div>
                    <div className="text-sm text-slate-600">Lives Impacted</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-navy-950">120+</div>
                    <div className="text-sm text-slate-600">Villages Covered</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-navy-950">100%</div>
                    <div className="text-sm text-slate-600">Compliance</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80"
                    alt="CSR Partnership"
                    width={600}
                    height={700}
                    className="w-full h-auto"
                  />
                  {/* Floating badge */}
                  <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-amber-200 shadow-lg">
                    <div className="flex items-center gap-2 text-sm font-bold text-navy-950">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Companies Act Compliant</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PARTNERSHIP BENEFITS */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-navy-950 font-heading mb-4">
                Why Partner With Us?
              </h2>
              <p className="text-lg text-slate-600">
                Guaranteed regulatory integrity, measurable social impact, and seamless project execution.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PARTNERSHIP_BENEFITS.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-gradient-to-br from-warm-50 to-white border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-950 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOCUS AREAS - Interactive Grid */}
        <section id="focus-areas" className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-sm font-semibold mb-4">
                <Award className="w-4 h-4" />
                Schedule VII Approved Domains
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-navy-950 font-heading mb-4">
                Ready-to-Deploy CSR Projects
              </h2>
              <p className="text-lg text-slate-600">
                Choose from our portfolio of impactful initiatives or co-create a custom program.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FOCUS_AREAS.map((area) => {
                const Icon = area.icon;
                const isSelected = selectedArea === area.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedArea(isSelected ? null : area.id)}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-amber-400 shadow-xl shadow-amber-500/20' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={area.image}
                        alt={area.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Icon badge */}
                      <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${area.color} text-white flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Schedule badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-navy-950">
                        {area.schedule}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-white">
                      <h3 className="text-xl font-bold text-navy-950 mb-2">
                        {area.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        {area.desc}
                      </p>
                      
                      {/* Impact metric */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${area.bgColor} ${area.borderColor} border text-xs font-semibold`}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{area.impact}</span>
                      </div>

                      {/* Select button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((prev) => ({ ...prev, focusArea: area.title }));
                          window.location.href = '#enquiry-form';
                        }}
                        className="mt-4 w-full py-2.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-navy-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Select This Area</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CSR PROCESS - Timeline */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-navy-950 font-heading mb-4">
                Our CSR Partnership Process
              </h2>
              <p className="text-lg text-slate-600">
                Simple, transparent, and milestone-driven project execution.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {CSR_PROCESS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative">
                    {/* Connector line */}
                    {idx < CSR_PROCESS.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-gradient-to-r from-amber-300 to-slate-200" />
                    )}
                    
                    <div className="relative text-center">
                      {/* Step number */}
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl font-black mb-4 shadow-lg">
                        {step.step}
                      </div>
                      
                      {/* Icon */}
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-700 mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-navy-950 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ENQUIRY FORM */}
        <section id="enquiry-form" className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-navy-950 font-heading mb-4">
                Start Your CSR Partnership
              </h2>
              <p className="text-lg text-slate-600">
                Share your objectives and we'll prepare a customized proposal with complete compliance documentation.
              </p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
              
              {submitted ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-950 mb-4">
                    Enquiry Received Successfully!
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Thank you for your interest. Our CSR team will reach out to <strong>{form.email}</strong> within 24-48 business hours with a detailed proposal.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        companyName: '',
                        contactPerson: '',
                        email: '',
                        phone: '',
                        focusArea: 'Healthcare & Wellness',
                        budgetRange: '₹5 Lakhs - ₹15 Lakhs',
                        locationPreference: 'Jharkhand (Chatra / Dhanbad)',
                        message: '',
                      });
                    }}
                    className="px-6 py-3 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-semibold transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 sm:p-12">
                  <div className="space-y-6">
                    
                    {/* Company Details */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-navy-950 mb-2">
                          Organization Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Tata Steel Ltd."
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-navy-950 mb-2">
                          Contact Person & Designation <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Priya Sharma (CSR Head)"
                          value={form.contactPerson}
                          onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-navy-950 mb-2">
                          Official Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="csr@company.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-navy-950 mb-2">
                          Contact Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-navy-950 mb-2">
                          Primary Focus Area
                        </label>
                        <select
                          value={form.focusArea}
                          onChange={(e) => setForm({ ...form, focusArea: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm bg-white"
                        >
                          {FOCUS_AREAS.map((a) => (
                            <option key={a.id} value={a.title}>
                              {a.title}
                            </option>
                          ))}
                          <option value="Multi-Domain Integrated Project">Multi-Domain Integrated Project</option>
                          <option value="Disaster Relief & Emergency Response">Disaster Relief & Emergency Response</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-navy-950 mb-2">
                          Estimated Budget Range
                        </label>
                        <select
                          value={form.budgetRange}
                          onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm bg-white"
                        >
                          <option value="Under ₹5 Lakhs">Under ₹5 Lakhs</option>
                          <option value="₹5 Lakhs - ₹15 Lakhs">₹5 Lakhs - ₹15 Lakhs</option>
                          <option value="₹15 Lakhs - ₹50 Lakhs">₹15 Lakhs - ₹50 Lakhs</option>
                          <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                          <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                          <option value="To be determined">To be determined</option>
                        </select>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-navy-950 mb-2">
                        Preferred Implementation Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Dhanbad / Jharkhand / Pan-India"
                        value={form.locationPreference}
                        onChange={(e) => setForm({ ...form, locationPreference: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-navy-950 mb-2">
                        CSR Objectives & Requirements <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Describe your company's CSR mandate, target beneficiaries, expected deliverables, timelines, and any specific requirements..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit CSR Enquiry</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                      All information is handled under strict confidentiality and used only for CSR partnership discussion.
                    </p>
                  </div>
                </form>
              )}

            </div>

            {/* Contact Info */}
            <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200 flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <a href="mailto:info@nipaniatrust.org" className="text-navy-950 font-semibold hover:text-amber-600">
                  info@nipaniatrust.org
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600" />
                <a href="tel:+919876543210" className="text-navy-950 font-semibold hover:text-amber-600">
                  +91 9876543210
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="text-slate-600">Nipania, Dhanbad, Jharkhand – 828201</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-navy-950 font-heading mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600">
                Common queries about our CSR partnership program.
              </p>
            </div>

            <div className="space-y-4">
              {CSR_FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                    >
                      <span className="flex items-start gap-3 text-base sm:text-lg font-semibold text-navy-950 pr-4">
                        <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
