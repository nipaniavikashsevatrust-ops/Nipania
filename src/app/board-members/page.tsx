import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import prisma from '@/lib/prisma';
import { Users, ShieldCheck, Quote, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BoardMembersPage() {
  const members = await prisma.boardMember.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* Header Hero - Enhanced Design */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-warm-50 py-20 sm:py-28 overflow-hidden border-b border-slate-100">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-amber-900 text-sm font-bold uppercase tracking-wider mb-6 shadow-md">
              <ShieldCheck className="w-4 h-4" />
              Governance & Leadership
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-heading text-navy-950 leading-[1.1]">
              Board of Trustees
              <span className="block mt-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                & Leadership Council
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Meet the distinguished governing council and leadership guiding Nipania Vikash Seva Trust towards its mission of Seva, Vikash, and Samarpan.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
              <div>
                <div className="text-3xl font-black text-navy-950">{members.length}</div>
                <div className="text-sm text-slate-600">Board Members</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <div className="text-3xl font-black text-navy-950">100%</div>
                <div className="text-sm text-slate-600">Transparent</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <div className="text-3xl font-black text-navy-950">24/7</div>
                <div className="text-sm text-slate-600">Governance</div>
              </div>
            </div>
          </div>
        </section>

        {/* Board Members Section - Enhanced Grid */}
        <section className="py-20 sm:py-24 bg-gradient-to-b from-white via-warm-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {members.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-12 border-2 border-slate-200 shadow-xl">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy-950 mb-2">Board Directory Updating</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Our trustee and leadership directory is currently being synchronized.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {members.map((member) => {
                  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                  const displayImage = member.image || defaultPhoto;

                  return (
                    <div
                      key={member.id}
                      className="group bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 flex flex-col justify-between hover:-translate-y-2 hover:border-amber-400"
                    >
                      <div>
                        {/* High-Impact Portrait Photography Header - Significantly Increased Height */}
                        <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full bg-gradient-to-br from-navy-950 to-navy-900 overflow-hidden">
                          {/* Enhanced Background Glow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/40 to-transparent z-10" />
                          
                          <Image
                            src={displayImage}
                            alt={member.name}
                            fill
                            unoptimized={true}
                            className="object-cover object-top group-hover:scale-110 transition-transform duration-1000 filter brightness-90 group-hover:brightness-100"
                          />
                          
                          {/* Official Trust Badge / Category Ribbon - Enhanced */}
                          <div className="absolute top-5 left-5 z-20">
                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-navy-950/95 to-navy-900/95 backdrop-blur-md text-gold-300 border-2 border-gold-400/60 text-xs font-extrabold uppercase px-4 py-2 rounded-full shadow-2xl">
                              <Sparkles className="w-4 h-4 text-gold-400 drop-shadow-glow" />
                              <span>{member.category}</span>
                            </span>
                          </div>

                          {/* Tenure / Role Pill - Enhanced */}
                          {member.tenure && (
                            <div className="absolute top-5 right-5 z-20">
                              <span className="bg-white/95 backdrop-blur-md text-navy-950 text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-amber-200">
                                {member.tenure}
                              </span>
                            </div>
                          )}

                          {/* Name Overlay inside gradient - Enhanced Typography */}
                          <div className="absolute bottom-6 left-6 right-6 z-20 space-y-1.5 text-left">
                            <span className="text-xs font-extrabold text-gold-300 uppercase tracking-[0.15em] block font-heading drop-shadow-md">
                              {member.designation}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading leading-tight drop-shadow-2xl">
                              {member.name}
                            </h3>
                          </div>
                        </div>

                        {/* Content & Bio Section - Enhanced */}
                        <div className="p-7 space-y-5">
                          {member.quote && (
                            <div className="relative bg-gradient-to-br from-warm-50 via-amber-50/40 to-orange-50/20 p-5 rounded-2xl border-2 border-amber-200/70 text-sm text-slate-700 italic leading-relaxed shadow-md">
                              <Quote className="w-5 h-5 text-amber-500 shrink-0 mb-2 opacity-70" />
                              <p className="font-serif relative z-10">"{member.quote}"</p>
                            </div>
                          )}

                          {member.roleDetails && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {member.roleDetails}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Badge - Enhanced */}
                      <div className="px-7 py-4 bg-gradient-to-br from-slate-50 to-warm-50 border-t-2 border-slate-100 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-600">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Trust Board Council</span>
                        </span>
                        <span className="font-bold text-navy-950 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                          Nipania Trust
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trust Governance Banner - Enhanced */}
            <div className="mt-20 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-10 sm:p-14 text-center border-3 border-gold-400/50 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-gold-400/20 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tl from-emerald-400/15 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-gold-400/25 to-amber-400/20 text-gold-200 text-sm font-bold mb-8 border-2 border-gold-400/50 shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-gold-300" />
                  <span>ETHICAL GOVERNANCE & STATUTORY INTEGRITY</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-black mb-4 font-heading text-white drop-shadow-lg">
                  Governed with Transparency and Compassion
                </h2>
                
                <p className="text-blue-100/90 max-w-3xl mx-auto mb-10 leading-relaxed text-base">
                  Our board operates under the registered Trust Deed with audited utilization and compliance as a Public Charitable Trust.
                </p>

                <div className="flex flex-wrap justify-center gap-4 relative z-10">
                  <Link
                    href="/about"
                    className="px-8 py-3.5 rounded-full text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black hover:from-gold-400 hover:to-amber-400 transition-all shadow-xl shadow-gold-500/30 active:scale-95"
                  >
                    Explore Trust Mission
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-3.5 rounded-full text-sm font-bold border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors shadow-lg backdrop-blur-sm"
                  >
                    Contact Trust Office
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
