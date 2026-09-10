'use client';

import React from 'react';
import { ShieldAlert, Users, Truck, HeartHandshake, Clock, CheckCircle2 } from 'lucide-react';

const STAGES = [
  {
    step: '1',
    title: 'Alert & Assess',
    timeline: '≤ 2 Hours',
    icon: ShieldAlert,
    color: 'amber',
    desc: 'Real-time monitoring of community distress, localized flood alerts, and instant on-ground rapid needs assessment.',
  },
  {
    step: '2',
    title: 'Mobilize Teams',
    timeline: '≤ 8 Hours',
    icon: Users,
    color: 'navy',
    desc: 'Activate verified regional volunteer cadres and coordinate logistics for ration kits, clean water, blankets, and first aid.',
  },
  {
    step: '3',
    title: 'Immediate Relief',
    timeline: '≤ 24 Hours',
    icon: Truck,
    color: 'amber',
    desc: 'Direct distribution of cooked meals, dry food packets, medical consultations, and emergency rescue assistance on site.',
  },
  {
    step: '4',
    title: 'Rehabilitation',
    timeline: 'Ongoing',
    icon: HeartHandshake,
    color: 'navy',
    desc: 'Long-term support including village medical camps, school education kits, rural livelihood revival, and community empowerment.',
  },
];

export default function CrisisResponseProcess() {
  return (
    <section className="py-20 bg-warm-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="title-ornament mb-2">
            <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
              Our Emergency Framework
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
            How We Respond to Crisis & Community Need
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            A battle-tested 4-stage emergency response and community seva framework, ensuring prompt, transparent, and dignified assistance.
          </p>
        </div>

        {/* Process Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isGold = stage.color === 'amber';

            return (
              <div
                key={stage.step}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Number & Icon */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
                      isGold
                        ? 'bg-gold-500/20 text-gold-700 border border-gold-400/40 group-hover:bg-gold-500 group-hover:text-navy-950'
                        : 'bg-navy-950 text-gold-300 border border-navy-800 group-hover:bg-navy-900 group-hover:text-white'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-2xl font-black font-mono text-slate-200 group-hover:text-gold-400 transition-colors">
                      0{stage.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-950 font-heading leading-tight">
                      {stage.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gold-600 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{stage.timeline}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                {/* Bottom Step Indicator */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Stage {stage.step} of 4</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
