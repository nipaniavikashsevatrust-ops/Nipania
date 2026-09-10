'use client';

import React from 'react';
import { Users, Heart, FolderKanban, Calendar, MapPin, Sparkles } from 'lucide-react';

interface ImpactStatItem {
  id: string;
  label: string;
  value: string;
  prefix?: string | null;
  suffix?: string | null;
}

interface ImpactSectionProps {
  stats?: ImpactStatItem[];
}

const STAT_ICONS: Record<string, React.ElementType> = {
  'Lives Impacted': Heart,
  'Active Volunteers': Users,
  'Active Members': Users,
  'Projects Initiated': FolderKanban,
  'Villages & Communities': MapPin,
  'Events Conducted': Calendar,
};

export default function ImpactSection({ stats = [] }: ImpactSectionProps) {
  // Default fallback if DB is initially empty
  const displayStats = stats.length > 0 ? stats : [
    { id: '1', label: 'Lives Impacted', value: '0', prefix: '', suffix: '+' },
    { id: '2', label: 'Active Volunteers', value: '0', prefix: '', suffix: '+' },
    { id: '3', label: 'Active Members', value: '0', prefix: '', suffix: '+' },
    { id: '4', label: 'Projects Initiated', value: '0', prefix: '', suffix: '' },
    { id: '5', label: 'Villages & Communities', value: '0', prefix: '', suffix: '+' },
    { id: '6', label: 'Events Conducted', value: '0', prefix: '', suffix: '+' },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-slate-50 via-warm-50/60 to-white border-y border-slate-200/80 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="title-ornament mb-3">
            <span className="text-xs uppercase tracking-widest text-amber-700 bg-amber-100/80 border border-amber-300/60 px-3 py-1 rounded-full font-bold">
              Transparent & Verified
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 mt-2">
            Our Growing Impact & Outreach
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Real metrics updated directly from Trust field programs and verified social initiatives.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {displayStats.map((stat) => {
            const Icon = STAT_ICONS[stat.label] || Sparkles;
            const fullValue = `${stat.prefix || ''}${stat.value}${stat.suffix || ''}`;

            return (
              <div
                key={stat.id || stat.label}
                className="relative bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col items-center justify-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mb-3 group-hover:bg-amber-500 transition-colors">
                  <Icon className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading group-hover:text-amber-600 transition-colors">
                  {fullValue}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <span>* Figures reflect verified on-ground operational records managed through the administrative system.</span>
        </div>

      </div>
    </section>
  );
}
