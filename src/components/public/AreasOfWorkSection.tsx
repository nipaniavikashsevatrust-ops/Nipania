'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Stethoscope, 
  Users2, 
  Baby, 
  Briefcase, 
  Sprout, 
  TreePine, 
  HandHeart, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';

const WORK_AREAS = [
  {
    title: 'Education & Literacy',
    icon: BookOpen,
    desc: 'Empowering children with school supplies, remedial coaching, and digital learning opportunities.',
    color: 'from-amber-500/20 to-amber-700/10',
  },
  {
    title: 'Community Healthcare',
    icon: Stethoscope,
    desc: 'Conducting free rural health checkup camps, preventive diagnosis, and maternal wellness awareness.',
    color: 'from-blue-500/20 to-blue-700/10',
  },
  {
    title: 'Women Empowerment',
    icon: Users2,
    desc: 'Vocational tailoring, livelihood skills, and self-help group mentorship for rural women.',
    color: 'from-rose-500/20 to-rose-700/10',
  },
  {
    title: 'Child Welfare & Nutrition',
    icon: Baby,
    desc: 'Ensuring balanced nutrition, health supplements, and child rights protection in vulnerable hamlets.',
    color: 'from-emerald-500/20 to-emerald-700/10',
  },
  {
    title: 'Skill Development',
    icon: Briefcase,
    desc: 'Vocational training and youth capacity building to enable sustainable rural employment.',
    color: 'from-purple-500/20 to-purple-700/10',
  },
  {
    title: 'Rural & Community Welfare',
    icon: Sprout,
    desc: 'Grassroots infrastructure support, clean drinking water awareness, and village sanitation.',
    color: 'from-orange-500/20 to-orange-700/10',
  },
  {
    title: 'Environment & Afforestation',
    icon: TreePine,
    desc: 'Tree plantation drives, sustainable waste management, and renewable solar energy adoption.',
    color: 'from-teal-500/20 to-teal-700/10',
  },
  {
    title: 'Emergency & Relief Aid',
    icon: ShieldAlert,
    desc: 'Rapid disaster assistance, ration distribution, and rehabilitation during extreme weather events.',
    color: 'from-red-500/20 to-red-700/10',
  },
];

export default function AreasOfWorkSection() {
  return (
    <section className="py-20 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="title-ornament mb-3">
            <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
              What We Do
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight font-heading">
            Our Key Focus Areas
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Dedicated interventions designed to foster sustainable community progress, dignity, and self-reliance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORK_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-gold-400 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center mb-5 group-hover:bg-gold-500 transition-colors shadow-sm">
                    <Icon className="w-6 h-6 text-gold-400 group-hover:text-navy-950 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-950 mb-2 font-heading group-hover:text-navy-800">
                    {area.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {area.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/work"
                    className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all"
          >
            <span>Explore All Focus Programs</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </Link>
        </div>

      </div>
    </section>
  );
}
