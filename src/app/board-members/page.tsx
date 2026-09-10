import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import prisma from '@/lib/prisma';
import { Users, ShieldCheck, Quote, Sparkles } from 'lucide-react';

export const revalidate = 60;

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
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-amber-50/70 via-warm-50/80 to-white text-slate-800 py-16 sm:py-24 relative overflow-hidden border-b border-slate-200/70">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="title-ornament mb-3">
              <span className="text-xs uppercase tracking-widest text-amber-700 bg-amber-100/80 border border-amber-300/60 px-3 py-1 rounded-full font-bold">
                Governance & Leadership
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-heading text-slate-900 mt-3">
              Board of Trustees
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Meet the distinguished governing council and leadership guiding Nipania Vikash Seva Trust towards its mission of Seva, Vikash, and Samarpan.
            </p>
          </div>
        </section>

        {/* Board Members Section */}
        <section className="py-20 bg-warm-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {members.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-12 border border-slate-200">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy-950 mb-2">Board Directory Updating</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Our trustee and leadership directory is currently being synchronized.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {members.map((member) => {
                  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                  const displayImage = member.image || defaultPhoto;

                  return (
                    <div
                      key={member.id}
                      className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5"
                    >
                      <div>
                        {/* High-Impact Portrait Photography Header */}
                        <div className="relative h-72 sm:h-80 w-full bg-navy-950 overflow-hidden">
                          {/* Background Glow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent z-10" />
                          
                          <Image
                            src={displayImage}
                            alt={member.name}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
                          />
                          
                          {/* Official Trust Badge / Category Ribbon */}
                          <div className="absolute top-4 left-4 z-20">
                            <span className="inline-flex items-center gap-1.5 bg-navy-950/90 backdrop-blur-md text-gold-400 border border-gold-400/50 text-[10px] font-extrabold uppercase px-3.5 py-1.5 rounded-full shadow-lg">
                              <Sparkles className="w-3 h-3 text-gold-400" />
                              <span>{member.category}</span>
                            </span>
                          </div>

                          {/* Tenure / Role Pill */}
                          {member.tenure && (
                            <div className="absolute top-4 right-4 z-20">
                              <span className="bg-white/90 backdrop-blur-md text-navy-950 text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                                {member.tenure}
                              </span>
                            </div>
                          )}

                          {/* Name Overlay inside gradient for striking visual hierarchy */}
                          <div className="absolute bottom-4 left-5 right-5 z-20 space-y-0.5 text-left">
                            <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block font-heading">
                              {member.designation}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading leading-tight drop-shadow-md">
                              {member.name}
                            </h3>
                          </div>
                        </div>

                        {/* Content & Bio Section */}
                        <div className="p-6 space-y-4">
                          {member.quote && (
                            <div className="relative bg-gradient-to-br from-warm-50 to-amber-50/40 p-4 rounded-2xl border border-gold-200/50 text-xs text-slate-700 italic leading-relaxed shadow-xs">
                              <Quote className="w-4 h-4 text-gold-500 shrink-0 mb-1 opacity-80" />
                              <p className="font-serif">"{member.quote}"</p>
                            </div>
                          )}

                          {member.roleDetails && (
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                              {member.roleDetails}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Badge */}
                      <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                          <span>Trust Board Council</span>
                        </span>
                        <span className="font-bold text-navy-950 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                          Nipania Trust
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trust Governance Banner */}
            <div className="mt-16 bg-gradient-to-r from-[#0c2340] via-[#0f2e54] to-[#0c2340] text-white rounded-3xl p-8 sm:p-12 text-center border-2 border-gold-400/40 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/20 text-gold-300 text-xs font-bold mb-6 border border-gold-400/40">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>ETHICAL GOVERNANCE & STATUTORY INTEGRITY</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 font-heading text-white">
                Governed with Transparency and Compassion
              </h2>
              
              <p className="text-blue-100/90 max-w-3xl mx-auto mb-8 leading-relaxed text-sm">
                Our board operates under the registered Trust Deed with audited utilization and compliance as a Public Charitable Trust.
              </p>

              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <Link
                  href="/about"
                  className="px-6 py-3 rounded-full text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-black hover:brightness-110 transition-all shadow-md active:scale-95"
                >
                  Explore Trust Mission
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-full text-xs font-bold border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors shadow-xs backdrop-blur-sm"
                >
                  Contact Trust Office
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
