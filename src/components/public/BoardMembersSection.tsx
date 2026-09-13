'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Award, Heart, User, CheckCircle2, Quote } from 'lucide-react';

const BOARD_LEADERS = [
  {
    name: 'Raj Kumar Mahato',
    designation: 'President & Managing Trustee',
    category: 'Executive Leadership',
    image: '/uploads/1789276540887-cropped-image.jpg',
    quote: '"Selfless service to the underserved is the highest form of social responsibility and spiritual dedication."',
    roleDetails: 'Steering trust governance, statutory compliance, and strategic grassroots development programs.',
    tenure: 'Founding Trustee',
  },
  {
    name: 'General Secretary',
    designation: 'General Secretary & Field Director',
    category: 'Operations & Community',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    quote: '"Real transformation starts when village youth and families are empowered with education and healthcare."',
    roleDetails: 'Leading community mobilization, volunteer coordination, and regional health camp execution.',
    tenure: 'Executive Trustee',
  },
  {
    name: 'Treasurer & Compliance Trustee',
    designation: 'Treasurer & Financial Controller',
    category: 'Finance & Governance',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    quote: '"Every single rupee donated is held in sacred trust and directed transparently for verified social impact."',
    roleDetails: 'Managing financial audits, statutory accounts, donor receipts, and statutory compliance filings.',
    tenure: 'Trustee',
  },
  {
    name: 'Advisory Council & Welfare Panel',
    designation: 'Social Advisory Board',
    category: 'Advisory Panel',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    quote: '"Providing expert guidance in rural schooling pedagogy, primary diagnostic standards, and women livelihood."',
    roleDetails: 'Composed of seasoned educationists, legal advocates, and medical doctors guiding outreach policy.',
    tenure: 'Honorary Council',
  },
];

export default function BoardMembersSection() {
  const [boardList, setBoardList] = React.useState<any[]>(BOARD_LEADERS);

  React.useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch('/api/board-members', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await res.json();
        const membersList = data.boardMembers || (Array.isArray(data) ? data : null);
        if (membersList && membersList.length > 0) {
          setBoardList(membersList);
        }
      } catch (e) {
        // Fallback to initial list
      }
    }
    loadMembers();
  }, []);

  return (
    <section className="py-20 bg-warm-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="title-ornament mb-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            Leadership & Governance
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-navy-950 font-heading tracking-tight">
          Board of Trustees & Leadership
        </h2>
        <p className="text-base text-slate-600 leading-relaxed">
          The governing council of Nipania Vikash Seva Trust, committed to ethical administration, transparent fund management, and grassroots social development.
        </p>
      </div>

        {/* Board Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardList.map((leader: any) => (
            <div
              key={leader.name}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-gold-400 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                {/* Photo Frame - Significantly Enlarged Size */}
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto mt-1">
                  <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-gold-400 shadow-lg bg-navy-950 flex items-center justify-center relative ring-4 ring-gold-400/20">
                    <Image
                      src={leader.image || '/uploads/1789276540887-cropped-image.jpg'}
                      alt={leader.name}
                      fill
                      unoptimized={true}
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 p-2 rounded-full bg-navy-900 border-2 border-gold-400 text-gold-400 shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                {/* Identity */}
                <div className="text-center space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gold-50 text-gold-800 border border-gold-200/80 uppercase tracking-wider">
                    {leader.category}
                  </span>
                  <h3 className="text-base font-bold text-navy-950 font-heading leading-tight pt-0.5">
                    {leader.name}
                  </h3>
                  <p className="text-xs font-semibold text-gold-600 font-heading">
                    {leader.designation}
                  </p>
                </div>

                {/* Quote / Mission */}
                <div className="bg-warm-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed text-center relative">
                  <Quote className="w-3 h-3 text-gold-400 inline-block mr-1 opacity-60 -mt-1" />
                  <span>{leader.quote}</span>
                </div>

                {/* Role Details */}
                <p className="text-xs text-slate-600 leading-relaxed text-center">
                  {leader.roleDetails}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Designation:</span>
                <span className="font-semibold text-navy-950">{leader.tenure}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
