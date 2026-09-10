import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import EmergencyBanner from '@/components/public/EmergencyBanner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import DirectDonationSection from '@/components/public/DirectDonationSection';
import prisma from '@/lib/prisma';
import {
  Heart,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Flame,
  Droplet,
  Utensils,
  GraduationCap,
  Activity,
  Trees,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 0;

export const metadata = {
  title: 'Current Campaigns & Seva Drives — Nipania Vikash Seva Trust',
  description:
    'Discover our ongoing humanitarian campaigns, flood relief efforts, community kitchens, rural healthcare clinics, and child education drives across Uttar Pradesh & India.',
};

const CAMPAIGNS_DATA = [
  {
    id: 'flood-relief-2026',
    slug: 'flood-relief-2026',
    category: 'Emergency Response',
    title: 'Emergency Flood & Disaster Relief 2026',
    tagline: 'Rapid deployment of ration kits, safe drinking water & shelter kits to submerged rural villages.',
    description:
      'Torrential rains and overflowing rivers have triggered devastating flash floods across vulnerable riverside hamlets. Entire communities are cut off without access to clean drinking water, dry rations, or urgent medical care. Nipania Trust volunteer teams are actively deploying motorized boats, dry food packs, and emergency first aid on the ground.',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    location: 'Riverside Hamlets, Balrampur & UP Terai',
    targetAmount: 500000,
    raisedAmount: 345000,
    metrics: [
      { icon: '⏱️', label: 'Team Response Time', value: '≤ 6 Hours' },
      { icon: '👥', label: 'Volunteers On Ground', value: '45+ Active' },
      { icon: '🍲', label: 'Ration Kits Dispatched', value: '2,400+ Kits' },
      { icon: '💧', label: 'Water Bottles Provided', value: '45,000+ Liters' },
    ],
    status: 'ACTIVE',
    urgency: 'HIGH PRIORITY',
  },
  {
    id: 'annapurna-food-seva',
    slug: 'annapurna-food-seva',
    category: 'Food Security & Langar',
    title: 'Project Annapurna: Daily Community Food Kitchen',
    tagline: 'Hot, nutritious meals served with dignity to destitute elderly, daily wagers, and children.',
    description:
      'Inspired by the timeless tradition of selfless Seva, our community kitchens cook fresh, wholesome meals every day. We ensure no child goes to bed on an empty stomach and elderly individuals without family support receive warm, nutritious sustenance with absolute respect and hygiene.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
    location: 'Rural Balrampur & Outreach Centers',
    targetAmount: 400000,
    raisedAmount: 310000,
    metrics: [
      { icon: '🍽️', label: 'Meals Served To Date', value: '50,000+ Meals' },
      { icon: '🌾', label: 'Monthly Grain Utilized', value: '4.5 Tons' },
      { icon: '👨‍👩‍👦', label: 'Families Nourished', value: '1,800+ Families' },
      { icon: '🤝', label: 'Seva Volunteers', value: '80+ Dedicated' },
    ],
    status: 'ACTIVE',
    urgency: 'ONGOING MISSION',
  },
  {
    id: 'health-on-wheels',
    slug: 'health-on-wheels',
    category: 'Healthcare Seva',
    title: 'Health on Wheels: Rural Mobile Medical Clinic',
    tagline: 'Bringing doctors, free diagnostic tests, and critical medicines to remote doorsteps.',
    description:
      'In many remote villages, the nearest primary health center is 30 km away over unpaved roads. Our equipped Mobile Healthcare Unit visits 12 isolated panchayats each week, providing blood sugar testing, pediatric care, prenatal guidance, and free life-saving medications to patients who cannot travel.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    location: 'Remote Panchayats & Tribal Belts',
    targetAmount: 450000,
    raisedAmount: 380000,
    metrics: [
      { icon: '🩺', label: 'Patients Consulted', value: '12,500+ Patients' },
      { icon: '💊', label: 'Free Medicine Value', value: '₹14+ Lakhs' },
      { icon: '🚑', label: 'Camps Conducted', value: '38 Medical Camps' },
      { icon: '👁️', label: 'Eye Screenings Done', value: '1,200+ Screened' },
    ],
    status: 'ACTIVE',
    urgency: 'CRITICAL HEALTHCARE',
  },
  {
    id: 'vidya-daan-education',
    slug: 'vidya-daan-education',
    category: 'Child Education',
    title: 'Project Vidya Daan: Girl Child Education & Learning Kits',
    tagline: 'School uniforms, bags, books, and remedial coaching to keep rural children in school.',
    description:
      'Poverty should never force a child out of the classroom. Project Vidya Daan identifies children at risk of dropping out—especially young girls—and provides complete educational kits, solar study lamps, and after-school remedial tutoring to bridge foundational learning gaps.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    location: 'Government Primary Schools & Hamlets',
    targetAmount: 300000,
    raisedAmount: 260000,
    metrics: [
      { icon: '📚', label: 'Children Supported', value: '1,200+ Students' },
      { icon: '👧', label: 'Girl Children Enrolled', value: '65% Beneficiaries' },
      { icon: '🎒', label: 'School Kits Gifted', value: '2,500+ Kits' },
      { icon: '🏫', label: 'Learning Centers', value: '8 Village Centers' },
    ],
    status: 'ACTIVE',
    urgency: 'EDUCATION EMPOWERMENT',
  },
  {
    id: 'kisan-kalyan-farmer-support',
    slug: 'kisan-kalyan-farmer-support',
    category: 'Farmer Welfare',
    title: 'Kisan Kalyan: Marginal Farmer Livelihood Drive',
    tagline: 'High-yield organic seeds, climate-smart drip tools & micro-irrigation support for rural growers.',
    description:
      'Marginal smallholders face erratic rainfall, expensive inputs, and debt cycles. We support farmers with native non-GMO seeds, natural bio-fertilizers, shared community water pumps, and direct technical guidance to protect rural farmer livelihoods with self-respect and dignity.',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
    location: 'Agricultural Clusters, Eastern UP',
    targetAmount: 350000,
    raisedAmount: 215000,
    metrics: [
      { icon: '🌾', label: 'Farmers Benefited', value: '850+ Smallholders' },
      { icon: '🌱', label: 'Organic Seeds Given', value: '12+ Metric Tons' },
      { icon: '💧', label: 'Community Borewells', value: '14 Installed' },
      { icon: '📈', label: 'Income Yield Gain', value: '+35% Average' },
    ],
    status: 'ACTIVE',
    urgency: 'SUSTAINABLE LIVELIHOODS',
  },
  {
    id: 'winter-warmth-blanket-seva',
    slug: 'winter-warmth-blanket-seva',
    category: 'Seasonal Seva',
    title: 'Winter Warmth: Heavy Blanket & Woolen Distribution',
    tagline: 'Shielding homeless, elderly, and rural families from biting winter cold across Northern India.',
    description:
      'When temperatures plummet during harsh winter months, thousands of vulnerable rural laborers and unhoused citizens endure freezing nights without warm coverings. Our volunteers conduct midnight distribution drives handing thick thermal blankets directly to those sleeping on station platforms and in open mud huts.',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    location: 'Transit Points, Slums & Remote Villages',
    targetAmount: 250000,
    raisedAmount: 220000,
    metrics: [
      { icon: '🧥', label: 'Blankets Distributed', value: '15,000+ Units' },
      { icon: '👨‍👩‍👧', label: 'Families Protected', value: '8,200+ Households' },
      { icon: '🌙', label: 'Night Seva Drives', value: '42 Operations' },
      { icon: '🧣', label: 'Woolen Caps & Socks', value: '5,000+ Distributed' },
    ],
    status: 'ACTIVE',
    urgency: 'WINTER DRIVE',
  },
];

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string };
}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const activeTab = resolvedParams?.tab === 'past' ? 'past' : 'current';

  let activeCampaigns = CAMPAIGNS_DATA;
  let pastCampaigns: any[] = [];

  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (dbProjects && dbProjects.length > 0) {
      const activeDb = dbProjects
        .filter((p) => p.status === 'ACTIVE')
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          category: p.category,
          title: p.title,
          tagline: p.summary || p.description.slice(0, 120),
          description: p.description,
          image:
            p.bannerImage ||
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
          location: p.location || 'Jharkhand & Rural Hamlets',
          targetAmount: p.targetAmount || 200000,
          raisedAmount: p.raisedAmount || 0,
          metrics: [
            { icon: '👥', label: 'Beneficiaries Reach', value: `${p.beneficiariesCount || 100}+ People` },
            { icon: '📍', label: 'Field Location', value: p.location || 'Rural Hamlets' },
            { icon: '🎯', label: 'Funding Target', value: formatCurrency(p.targetAmount || 200000) },
            { icon: '💚', label: 'Funds Mobilized', value: formatCurrency(p.raisedAmount || 0) },
          ],
          status: 'ACTIVE',
          urgency: 'VERIFIED ON-GROUND',
        }));

      const pastDb = dbProjects
        .filter((p) => p.status === 'COMPLETED')
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          category: p.category,
          title: p.title,
          tagline: p.summary || p.description.slice(0, 120),
          description: p.description,
          image:
            p.bannerImage ||
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
          location: p.location || 'Jharkhand & Rural Hamlets',
          targetAmount: p.targetAmount || 200000,
          raisedAmount: p.raisedAmount || 0,
          metrics: [
            { icon: '👥', label: 'Beneficiaries Reach', value: `${p.beneficiariesCount || 100}+ People` },
            { icon: '📍', label: 'Field Location', value: p.location || 'Rural Hamlets' },
            { icon: '🎯', label: 'Funding Target', value: formatCurrency(p.targetAmount || 200000) },
            { icon: '💚', label: 'Funds Mobilized', value: formatCurrency(p.raisedAmount || 0) },
          ],
          status: 'COMPLETED',
          urgency: 'MISSION ACCOMPLISHED',
        }));

      // Display strictly database campaigns so admin edits and deletions are fully respected
      activeCampaigns = activeDb;
    }
  } catch (err) {
    console.error('Error fetching dynamic campaigns:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <AnnouncementBar />
      <EmergencyBanner />
      <Navbar />

      <main className="flex-1">
        
        {/* 1. Page Hero Banner (SikhAid Inspired) */}
        <section className="relative bg-gradient-to-b from-amber-50/70 via-warm-50/80 to-white text-slate-800 py-16 sm:py-24 overflow-hidden border-b border-slate-200/70">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Nipania Trust Humanitarian Initiatives</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-slate-900 max-w-4xl mx-auto">
              Current Campaigns & Relief Missions
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Every cause needs hands. Every act counts. Choose how you want to bring compassion, nutrition, health, and dignity to vulnerable rural families.
            </p>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs text-amber-800 font-bold uppercase tracking-wider">
              <span>100% Direct Relief</span>
              <span>&bull;</span>
              <span>Section 80G Tax Exemption</span>
              <span>&bull;</span>
              <span>Instant Digital PDF Receipt</span>
            </div>
          </div>
        </section>

        {/* 2. Interactive Tab Toggle (Current vs Past) */}
        <section className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center gap-2 py-3">
              <Link
                href="/campaigns"
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'current'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Current Active Campaigns ({activeCampaigns.length})
              </Link>
              <Link
                href="/campaigns?tab=past"
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'past'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Past Completed Missions ({pastCampaigns.length > 0 ? pastCampaigns.length : 12})
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Campaigns Grid Section */}
        <section className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {activeTab === 'current' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {activeCampaigns.map((cmp) => {
                  const percent = Math.min(
                    100,
                    Math.round((cmp.raisedAmount / cmp.targetAmount) * 100)
                  );

                  return (
                    <article
                      key={cmp.id}
                      className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 flex flex-col justify-between group"
                    >
                      {/* Image Top */}
                      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                        <Image
                          src={cmp.image}
                          alt={cmp.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Badges on Image */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <span className="bg-navy-950/90 backdrop-blur-md text-gold-300 text-xs font-black uppercase px-3 py-1 rounded-full shadow-md border border-gold-400/30">
                            {cmp.category}
                          </span>
                          <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>ONGOING</span>
                          </span>
                        </div>

                        {/* Location bottom left */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1 font-semibold text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-gold-400" />
                            <span>{cmp.location}</span>
                          </span>
                          <span className="text-[11px] font-bold text-amber-300 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-amber-400/30">
                            {cmp.urgency}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-3">
                          <h2 className="text-xl sm:text-2xl font-black text-navy-950 font-heading leading-tight group-hover:text-gold-700 transition-colors">
                            {cmp.title}
                          </h2>
                          <p className="text-xs font-semibold text-gold-900 uppercase tracking-wide">
                            {cmp.tagline}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {cmp.description}
                          </p>
                        </div>

                        {/* KPI Metric Chips Grid (SikhAid inspired) */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                          {cmp.metrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2"
                            >
                              <span className="text-base">{m.icon}</span>
                              <div className="min-w-0 flex-1">
                                <strong className="text-xs font-extrabold text-navy-950 block truncate">
                                  {m.value}
                                </strong>
                                <span className="text-[10px] text-slate-500 font-medium block truncate">
                                  {m.label}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Progress Bar & Financials */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-bold text-navy-950">
                              Raised: <strong className="text-emerald-700 text-sm">{formatCurrency(cmp.raisedAmount)}</strong>
                            </span>
                            <span className="text-slate-500 font-medium">
                              Target: {formatCurrency(cmp.targetAmount)} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 flex flex-col sm:flex-row gap-3">
                          <Link
                            href={`/donate?campaign=${encodeURIComponent(cmp.title)}&amount=1500`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md transition-all active:scale-95"
                          >
                            <Heart className="w-4 h-4 fill-gold-400 text-gold-400" />
                            <span>Support This Campaign</span>
                          </Link>

                          <Link
                            href={`/projects?category=${encodeURIComponent(cmp.category)}`}
                            className="inline-flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 text-navy-950 hover:bg-slate-100 transition-colors"
                          >
                            <span>Know More</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : pastCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {pastCampaigns.map((cmp) => (
                  <article
                    key={cmp.id}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200 flex flex-col justify-between opacity-95"
                  >
                    <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                      <Image
                        src={cmp.image}
                        alt={cmp.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-navy-950/90 text-gold-300 text-xs font-black uppercase px-3 py-1 rounded-full border border-gold-400/30">
                          {cmp.category}
                        </span>
                        <span className="bg-slate-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                          COMPLETED
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-gold-400" />
                          <span>{cmp.location}</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 bg-black/40 px-2 py-0.5 rounded">
                          MISSION ACCOMPLISHED
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-navy-950">{cmp.title}</h2>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cmp.description}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 pt-3 border-t border-slate-100 font-semibold">
                        <span>Mobilized: <strong className="text-emerald-700">{formatCurrency(cmp.raisedAmount)}</strong></span>
                        <span>Target: {formatCurrency(cmp.targetAmount)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-navy-950">12 Completed Community Missions</h3>
                <p className="text-sm text-slate-600 max-w-xl mx-auto">
                  Over the past years, Nipania Vikash Seva Trust has completed emergency flood rescues, pandemic medical supply relief, rural school library setups, and thousands of blanket distributions across Eastern UP and Jharkhand.
                </p>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800"
                >
                  <span>View Impact Photo Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>
        </section>

        {/* 4. Direct UPI QR & Instant Bank Transfer Section (SikhAid inspired) */}
        <DirectDonationSection />

        {/* 5. Join Our Mission / Call to Action */}
        <section className="py-20 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
              Collective Seva
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">
              Join Hands With Us as a Volunteer or Monthly Supporter
            </h2>
            <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Whether on the field during crises or through steady monthly contributions, every act of kindness protects lives and restores human dignity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold bg-gold-400 hover:bg-gold-300 text-navy-950 shadow-gold transition-all"
              >
                <Heart className="w-4 h-4 fill-navy-950 text-navy-950" />
                <span>Donate to Active Campaigns</span>
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold border-2 border-white/40 text-white hover:bg-white/10 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Join Volunteer Corps</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
