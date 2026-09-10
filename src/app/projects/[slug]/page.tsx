import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import prisma from '@/lib/prisma';
import { Heart, MapPin, Calendar, Users, CheckCircle2, ArrowLeft, Share2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      updates: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const percentage = project.targetAmount > 0
    ? Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100))
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all projects</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
                
                {/* Banner */}
                <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                  <Image
                    src={project.bannerImage || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80'}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-4 left-4 bg-navy-900/90 text-gold-300 text-xs font-bold px-3 py-1 rounded-full border border-gold-400/40">
                    {project.category}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold-600" />
                        <span>Started: {formatDate(project.startDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gold-600" />
                      <span>{project.beneficiariesCount} Direct Beneficiaries</span>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
                    {project.title}
                  </h1>

                  <p className="text-base text-slate-700 font-medium leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="text-lg font-bold text-navy-950 font-heading">Project Overview & Objectives</h3>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-4">
                    {project.description}
                  </div>
                </div>

              </div>

              {/* Project Updates Section */}
              {project.updates && project.updates.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
                  <h3 className="text-xl font-bold text-navy-950 font-heading">
                    Field Progress & Updates
                  </h3>
                  <div className="space-y-6">
                    {project.updates.map((update) => (
                      <div key={update.id} className="border-l-2 border-gold-400 pl-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-bold text-navy-950 text-sm">{update.title}</span>
                          <span>{formatDate(update.date)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {update.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Donation & Action Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6 sticky top-24">
                <h3 className="text-lg font-bold text-navy-950 font-heading">
                  Support this Initiative
                </h3>

                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gold-500 to-gold-400 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-bold text-gold-700">{percentage}% Raised</span>
                    <span className="text-slate-500 font-mono">
                      Target: {formatCurrency(project.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="bg-warm-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-500 block">Total Contributions</span>
                  <span className="text-2xl font-extrabold text-navy-950 font-mono">
                    {formatCurrency(project.raisedAmount)}
                  </span>
                </div>

                <Link
                  href={`/donate?project=${project.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold bg-gold-400 hover:bg-gold-500 text-navy-950 shadow-gold transition-all"
                >
                  <Heart className="w-4 h-4 fill-navy-950" />
                  <span>Donate to this Project</span>
                </Link>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Instant Digital Receipt Generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Direct Community Program Allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Managed under Registered Trust Governance</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/volunteer"
                    className="text-xs font-semibold text-gold-700 hover:underline"
                  >
                    Want to volunteer for this project instead?
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
