'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Users, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  location?: string | null;
  targetAmount: number;
  raisedAmount: number;
  beneficiariesCount: number;
  bannerImage?: string | null;
}

interface Props {
  projects?: ProjectItem[];
}

export default function FeaturedProjectsSection({ projects = [] }: Props) {
  if (projects.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="title-ornament justify-start mb-2">
              <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                Direct Grassroots Action
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight font-heading">
              Featured Initiatives & Projects
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Support targeted social welfare programs designed to create long-term impact for families and children.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-bold text-navy-900 hover:text-gold-600 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const percentage = project.targetAmount > 0 
              ? Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100))
              : 0;

            return (
              <div
                key={project.id}
                className="bg-warm-50 rounded-2xl overflow-hidden border border-slate-200/80 hover:border-gold-400 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col group"
              >
                {/* Banner Image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={project.bannerImage || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-navy-900/90 backdrop-blur-md text-gold-300 text-[11px] font-bold px-3 py-1 rounded-full border border-gold-400/30">
                    {project.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {project.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-navy-950 font-heading leading-snug group-hover:text-gold-700 transition-colors">
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  {/* Funding Progress Bar */}
                  <div className="space-y-3 pt-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gold-500 to-gold-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block">Raised:</span>
                        <span className="font-bold text-navy-950 font-mono">
                          {formatCurrency(project.raisedAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block">Target:</span>
                        <span className="font-bold text-slate-700 font-mono">
                          {formatCurrency(project.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-xs font-semibold text-slate-700 hover:text-navy-950 underline underline-offset-4"
                      >
                        Read Details
                      </Link>

                      <Link
                        href={`/donate?project=${project.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gold-400 hover:bg-gold-500 text-navy-950 transition-colors shadow-sm"
                      >
                        <Heart className="w-3.5 h-3.5 fill-navy-950" />
                        <span>Support Project</span>
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
