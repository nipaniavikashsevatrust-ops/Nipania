'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  Calendar,
  Layers,
  Utensils,
  BookOpen,
  Activity,
  Droplet,
  Users,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SponsorshipTier {
  id: string;
  category: 'MEALS' | 'HYGIENE' | 'EDUCATION' | 'HEALTHCARE';
  title: string;
  amount: number;
  monthlyAmount?: number;
  icon: string;
  unitLabel: string;
  description: string;
  impactMetrics: string[];
  isFeatured?: boolean;
}

const SPONSORSHIP_DATA: SponsorshipTier[] = [
  // MEALS & RATION (Annapurna Seva)
  {
    id: 'meals-6',
    category: 'MEALS',
    title: 'Feed 6 Daily Wage Laborers',
    amount: 500,
    monthlyAmount: 500,
    icon: '🍱',
    unitLabel: '6 people fed',
    description: 'Hot, freshly cooked wholesome afternoon meals served with dignity to day-laborers and homeless individuals.',
    impactMetrics: ['6 Cooked Thali Meals', 'Fresh Dal, Roti & Sabzi', 'Safe Potable Drinking Water'],
    isFeatured: false,
  },
  {
    id: 'meals-12',
    category: 'MEALS',
    title: 'Feed 12 People Group',
    amount: 1000,
    monthlyAmount: 1000,
    icon: '🍲',
    unitLabel: '12 people fed',
    description: 'A small-group sponsorship — twelve people nourished with nutritious hot food in riverside rural pockets.',
    impactMetrics: ['12 Wholesome Meal Servings', 'Nutritional Balance', 'Prepared by Trust Kitchen'],
    isFeatured: false,
  },
  {
    id: 'meals-30',
    category: 'MEALS',
    title: 'Sponsor Community Langar (30 People)',
    amount: 2500,
    monthlyAmount: 2500,
    icon: '🥘',
    unitLabel: '30 people fed',
    description: 'Nourish thirty elderly, disabled, and flood-impacted villagers during weekly community feeding drives.',
    impactMetrics: ['30 Hot Meals with Sweet Dish', 'Special Focus on Elders & Children', 'Zero Waste Seva Protocol'],
    isFeatured: false,
  },
  {
    id: 'meals-kitchen-day',
    category: 'MEALS',
    title: 'Sponsor a Seva Kitchen for 1 Full Day',
    amount: 15000,
    monthlyAmount: 15000,
    icon: '🏠',
    unitLabel: '1 full kitchen day',
    description: 'Fund all raw grains, lentils, fresh seasonal vegetables, cooking oil, clean gas cylinder, and volunteer logistics to feed 200+ individuals.',
    impactMetrics: ['200+ Beneficiaries Served', 'Full Day Kitchen Fuel & Supplies', 'Dedicated Field Volunteer Team'],
    isFeatured: true,
  },

  // DIGNITY & HYGIENE (Women's Health)
  {
    id: 'hygiene-1',
    category: 'HYGIENE',
    title: 'Hygiene & Dignity Kit for 1 Person',
    amount: 250,
    monthlyAmount: 250,
    icon: '🧼',
    unitLabel: '1 person supported',
    description: 'Essential personal hygiene kit including antiseptic soap, biodegradable sanitary pads, and wellness guidelines.',
    impactMetrics: ['Sanitary Napkin Packets', 'Antiseptic Bathing Soap', 'Health Advisory Booklet'],
    isFeatured: false,
  },
  {
    id: 'hygiene-3',
    category: 'HYGIENE',
    title: 'Hygiene & Dignity Kit for 3 Women',
    amount: 600,
    monthlyAmount: 600,
    icon: '🌸',
    unitLabel: '3 women supported',
    description: 'Quarterly supply of certified sanitary pads, hygiene towels, and disinfectant essentials for 3 rural women.',
    impactMetrics: ['3 Months Supply of Pads', 'Personal Care Wellness Pouch', 'Prevents Chronic Reproductive Infections'],
    isFeatured: false,
  },
  {
    id: 'hygiene-family',
    category: 'HYGIENE',
    title: 'Family Sanitation Kit (8 People)',
    amount: 1500,
    monthlyAmount: 1500,
    icon: '🚿',
    unitLabel: '8 people supported',
    description: 'Comprehensive household water-purification tablets, disinfectant wash, soaps, mosquito repellents, and hygiene supplies.',
    impactMetrics: ['Complete Family Sanitation Pack', 'Chlorine Safe Water Tablets', 'Emergency Antiseptic First Aid'],
    isFeatured: false,
  },
  {
    id: 'hygiene-village-drive',
    category: 'HYGIENE',
    title: 'Sponsor a Village Menstrual Health Drive',
    amount: 15000,
    monthlyAmount: 15000,
    icon: '🌺',
    unitLabel: '1 entire village drive',
    description: 'Organize a doctor-guided awareness workshop, destigmatize menstrual health, and provide 100+ girls with 6-month hygiene packs.',
    impactMetrics: ['100+ Adolescent Girls & Women', 'Licensed Female Doctor Session', '6-Month Supply of Dignity Kits'],
    isFeatured: true,
  },

  // CHILD EDUCATION (Vidya Daan)
  {
    id: 'edu-books',
    category: 'EDUCATION',
    title: 'Sponsor School Bag & Stationeries',
    amount: 600,
    monthlyAmount: 600,
    icon: '🎒',
    unitLabel: '1 student kit',
    description: 'Waterproof school bag, notebooks, geometry instrument box, pens, pencils, and color sets for an underprivileged student.',
    impactMetrics: ['Durable Canvas School Bag', '6 Ruled Notebooks & Geometry Box', 'Writing Stationery Pack'],
    isFeatured: false,
  },
  {
    id: 'edu-uniform',
    category: 'EDUCATION',
    title: 'Sponsor Stitched Uniforms & Shoes',
    amount: 1200,
    monthlyAmount: 1200,
    icon: '👟',
    unitLabel: '1 student uniform set',
    description: 'Two sets of tailored school uniforms, pairs of socks, and sturdy all-weather leather school shoes.',
    impactMetrics: ['2 Sets Stitched Uniform', 'All-Weather School Shoes', 'Restores Dignity & Attendance'],
    isFeatured: false,
  },
  {
    id: 'edu-annual-scholarship',
    category: 'EDUCATION',
    title: "Sponsor a Child's Full Year Education",
    amount: 3600,
    monthlyAmount: 300,
    icon: '🎓',
    unitLabel: '1 child annual scholarship',
    description: 'Complete annual tuition assistance, supplementary remedial evening coaching, notebooks, and digital learning modules.',
    impactMetrics: ['12 Months Tuition & Exam Fees', 'Daily Remedial Center Access', 'Personal Progress Report Card'],
    isFeatured: true,
  },
  {
    id: 'edu-smart-class',
    category: 'EDUCATION',
    title: 'Sponsor a Village Smart Learning Unit',
    amount: 25000,
    monthlyAmount: 25000,
    icon: '💻',
    unitLabel: '1 village school unit',
    description: 'Install an audio-visual interactive projector, offline syllabus tablet, and solar charging hub in a remote primary school.',
    impactMetrics: ['120+ Rural Students Empowered', 'Interactive STEM & Language Content', 'Solar Inverter Backup Battery'],
    isFeatured: false,
  },

  // HEALTHCARE & ELDER CARE
  {
    id: 'health-elder-kit',
    category: 'HEALTHCARE',
    title: 'Elder Healthcare & Chronic Medicine Kit',
    amount: 1000,
    monthlyAmount: 1000,
    icon: '🩺',
    unitLabel: '1 elderly patient',
    description: 'One month supply of vital hypertension, diabetes, and joint arthritis medications for an impoverished senior citizen.',
    impactMetrics: ['Prescribed Chronic Medicines', 'Blood Glucose & BP Monitoring', 'Doctor Review Consultation'],
    isFeatured: false,
  },
  {
    id: 'health-eye-care',
    category: 'HEALTHCARE',
    title: 'Eye Screening & Free Spectacles (2 Patients)',
    amount: 1800,
    monthlyAmount: 1800,
    icon: '👓',
    unitLabel: '2 patients supported',
    description: 'Comprehensive ophthalmic checkup, refraction test, and anti-glare prescription spectacles for 2 elderly rural weavers or farmers.',
    impactMetrics: ['Certified Optometrist Test', '2 Prescription Glasses with Cases', 'Restores Independent Daily Vision'],
    isFeatured: false,
  },
  {
    id: 'health-mobile-camp',
    category: 'HEALTHCARE',
    title: 'Sponsor a Full Day Rural Mobile Health Camp',
    amount: 20000,
    monthlyAmount: 20000,
    icon: '🚑',
    unitLabel: '1 village medical camp',
    description: 'Deploy 2 certified MBBS doctors, nursing staff, emergency diagnostics (ECG, glucose, vitals), and free prescription medicines for 150+ villagers.',
    impactMetrics: ['150+ Patients Examined', 'Free Diagnostic Tests & Medicines', 'Specialist Maternal & Pediatric Care'],
    isFeatured: true,
  },
];

const CATEGORIES = [
  { id: 'ALL', label: 'All Causes', icon: Layers },
  { id: 'MEALS', label: 'Meals & Ration', icon: Utensils },
  { id: 'HYGIENE', label: 'Dignity & Hygiene', icon: Droplet },
  { id: 'EDUCATION', label: 'Child Education', icon: BookOpen },
  { id: 'HEALTHCARE', label: 'Rural Healthcare', icon: Activity },
];

export default function SponsorTiersClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [frequency, setFrequency] = useState<'ONE_TIME' | 'MONTHLY'>('ONE_TIME');
  const [tiers, setTiers] = useState<SponsorshipTier[]>(SPONSORSHIP_DATA);

  React.useEffect(() => {
    fetch('/api/sponsors')
      .then((res) => res.json())
      .then((data) => {
        if (data.sponsors && data.sponsors.length > 0) {
          setTiers(data.sponsors);
        }
      })
      .catch((err) => console.warn('Could not fetch dynamic sponsors, using fallback:', err));
  }, []);

  const filteredTiers = useMemo(() => {
    if (selectedCategory === 'ALL') return tiers;
    return tiers.filter((t) => t.category === selectedCategory);
  }, [selectedCategory, tiers]);

  return (
    <div className="space-y-8">
      {/* Category Pills & Frequency Selector Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-slate-200">
        
        {/* Category Pills with smooth horizontal scrolling */}
        <div className="w-full lg:w-auto overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x overscroll-x-contain">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white text-slate-700 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 shadow-xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequency Switcher: One-Time vs Monthly */}
        <div className="flex items-center justify-center bg-slate-100 p-1 rounded-full border border-slate-200 shrink-0 shadow-inner self-center sm:self-auto">
          <button
            onClick={() => setFrequency('ONE_TIME')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              frequency === 'ONE_TIME'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            One-Time
          </button>
          <button
            onClick={() => setFrequency('MONTHLY')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              frequency === 'MONTHLY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Seva</span>
          </button>
        </div>
      </div>

      {/* Grid of Sponsorship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTiers.map((tier) => {
          const displayAmount =
            frequency === 'MONTHLY' && tier.monthlyAmount
              ? tier.monthlyAmount
              : tier.amount;

          const sponsorshipCause = `Sponsorship: ${tier.title}`;
          const donateHref = `/donate?campaign=${encodeURIComponent(
            sponsorshipCause
          )}&sponsorshipTitle=${encodeURIComponent(
            tier.title
          )}&amount=${displayAmount}&type=${frequency}&category=${tier.category}&isSponsorship=true`;

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${
                tier.isFeatured
                  ? 'bg-gradient-to-b from-amber-50/60 via-white to-orange-50/25 border-2 border-amber-400 shadow-xl ring-1 ring-amber-400/30'
                  : 'bg-white border border-slate-200 hover:border-amber-400/80 shadow-md hover:shadow-xl'
              }`}
            >
              {/* Featured Badge */}
              {tier.isFeatured && (
                <div className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold shadow-md tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 fill-white" />
                  <span>High Impact Seva</span>
                </div>
              )}

              <div>
                {/* Header: Icon & Outcome Unit */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs group-hover:scale-110 transition-transform">
                    {tier.icon}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tier.unitLabel}</span>
                  </span>
                </div>

                {/* Price Display */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                      {formatCurrency(displayAmount)}
                    </span>
                    {frequency === 'MONTHLY' && (
                      <span className="text-xs font-semibold text-slate-500">
                        / month
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    100% Eligible for 80G Tax Exemption
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors mb-2">
                  {tier.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {tier.description}
                </p>

                {/* Tangible Impact Checklist */}
                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  {tier.impactMetrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={donateHref}
                  className={`w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md ${
                    tier.isFeatured
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-gold'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>
                    {frequency === 'MONTHLY' ? 'Sponsor Monthly' : 'Sponsor Now'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Need Custom Sponsorship / CSR Tier */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 border border-amber-300 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Corporate CSR &amp; Custom Seva</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
            Looking to sponsor a custom drive or adopt a complete village?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We collaborate with individual patrons, philanthropic foundations, and corporate CSR partners to design tailored on-ground development drives with formal 80G receipts, utilization certificates, and impact audit reports.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors"
          >
            Contact Trustees
          </Link>
          <Link
            href="/donate"
            className="px-6 py-3 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-gold transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Custom Donation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
