'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, MapPin, Users } from 'lucide-react';

const CAMPAIGNS = [
  {
    id: 'flood-relief',
    category: 'Emergency Relief',
    title: 'Jharkhand Community & Emergency Relief 2026',
    desc: 'Supporting vulnerable families affected by seasonal distress and remote hardship. Our teams are actively distributing food grain kits, safe drinking water, emergency medical supplies, and shelter kits directly to displaced households.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    location: 'Jharkhand & Remote Tribal Belts',
    target: '₹5,00,000',
    achieved: '68%',
    actionText: 'Support Emergency Relief',
  },
  {
    id: 'health-on-wheels',
    category: 'Healthcare Seva',
    title: 'Mobile Health Clinics & Diagnostic Camps',
    desc: 'Bringing essential medical checkups, free medicines, pediatric screening, and eye care directly to remote villages where primary health centers are out of reach.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    location: 'Rural Villages & Panchayats',
    target: '₹3,50,000',
    achieved: '74%',
    actionText: 'Fund a Health Camp',
  },
  {
    id: 'vidya-daan',
    category: 'Education Support',
    title: 'Project Vidya Daan: School Kits & Tutoring',
    desc: 'Equipping underprivileged students with textbooks, school bags, stationery, and daily remedial tutoring to prevent school dropouts and foster bright futures.',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    location: 'Community Centers & Primary Schools',
    target: '₹2,50,000',
    achieved: '82%',
    actionText: 'Sponsor a Child Education',
  },
  {
    id: 'farmer-livelihood',
    category: 'Rural Welfare',
    title: 'Kisan Kalyan: Marginal Farmer Assistance',
    desc: 'Supporting marginal farmers with organic seed kits, climate-resilient farming inputs, and community water management tools to secure rural livelihoods.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    location: 'Agricultural Clusters',
    target: '₹4,00,000',
    achieved: '60%',
    actionText: 'Support Small Farmers',
  },
];

export default function CampaignsShowcase({
  dbCampaigns,
}: {
  dbCampaigns?: any[];
}) {
  const [activeTab, setActiveTab] = useState(0);

  const campaignList =
    dbCampaigns && dbCampaigns.length > 0
      ? dbCampaigns.map((p) => ({
          id: p.id,
          category: p.category || 'Seva Drive',
          title: p.title,
          desc: p.summary || p.description,
          image:
            p.bannerImage ||
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
          location: p.location || 'Jharkhand & Rural Villages',
          target: `₹${(p.targetAmount || 200000).toLocaleString('en-IN')}`,
          achieved: `${Math.min(
            100,
            Math.round(((p.raisedAmount || 0) / (p.targetAmount || 1)) * 100)
          )}%`,
          actionText: `Support ${p.title.length > 22 ? p.title.slice(0, 22) + '...' : p.title}`,
        }))
      : CAMPAIGNS;

  const activeIndex = Math.min(activeTab, campaignList.length - 1);
  const activeCampaign = campaignList[activeIndex] || campaignList[0];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Make an Immediate Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
            Current Community Campaigns & Seva Drives
          </h2>
          <p className="text-sm text-slate-600">
            Choose a social cause close to your heart and help us serve vulnerable families with dignity and immediate impact.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {campaignList.map((cmp, idx) => (
            <button
              key={cmp.id}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === idx
                  ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40 font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              {cmp.category}
            </button>
          ))}
        </div>

        {/* Interactive Showcase Card */}
        <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  {activeCampaign.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {activeCampaign.location}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
                {activeCampaign.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {activeCampaign.desc}
              </p>

              {/* Progress Metric */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>Drive Goal: {activeCampaign.target}</span>
                  <span className="text-amber-700 font-extrabold">{activeCampaign.achieved} Funded</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: activeCampaign.achieved }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  href={`/donate?campaign=${encodeURIComponent(activeCampaign.title)}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500 hover:from-amber-600 hover:to-gold-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all duration-200 active:scale-95"
                >
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>{activeCampaign.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/campaigns"
                  className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full text-xs font-bold border border-slate-300 text-slate-700 hover:bg-white hover:border-amber-400 hover:text-amber-800 transition-all active:scale-95"
                >
                  <span>Explore All Campaigns</span>
                </Link>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-6 relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <Image
                src={activeCampaign.image}
                alt={activeCampaign.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-sm text-[11px] font-bold text-gold-300 border border-gold-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                  <span>100% Verified Community Seva</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
