'use client';

import React from 'react';
import Image from 'next/image';
import { Target, Compass, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export default function MissionVisionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="title-ornament mb-2">
            <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
              Our Core Purpose
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
            Guided by Compassion, Driven by Service
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The philosophical pillars steering every initiative, volunteer drive, and community relief program at Nipania Vikash Seva Trust.
          </p>
        </div>

        {/* Dual Purpose Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <div className="relative bg-gradient-to-br from-amber-600 via-gold-600 to-amber-700 text-white rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="absolute inset-0 bg-navy-950/20" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold border border-white/30">
                <Target className="w-7 h-7" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                Our Mission
              </h3>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                To provide prompt humanitarian aid, free medical support, quality primary learning opportunities, and sustainable livelihood support to underprivileged rural communities with empathy, dignity, and absolute transparency.
              </p>

              <ul className="space-y-3 pt-4 text-xs sm:text-sm text-white/95 font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>Rapid community mobilization in rural clusters</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>Dignified on-ground seva without discrimination</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>100% transparent and accountable fund allocation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Vision Card */}
          <div className="relative bg-gradient-to-br from-[#0c2340] via-[#0f2e54] to-[#123966] text-white rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl border-2 border-gold-400/40 flex flex-col justify-between group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-300 flex items-center justify-center font-bold border border-gold-400/40">
                <Compass className="w-7 h-7 text-gold-400" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Our Vision
              </h3>

              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
                An inclusive, self-reliant, and compassionate society where every child receives education, every vulnerable family has access to healthcare, and no rural household is left without support in times of crisis.
              </p>

              <ul className="space-y-3 pt-4 text-xs sm:text-sm text-slate-200 font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gold-400 shrink-0" />
                  <span>Regional network of dedicated, verified volunteers</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gold-400 shrink-0" />
                  <span>Empowered rural youth leading community development</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gold-400 shrink-0" />
                  <span>Technology-driven transparency and verification</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
