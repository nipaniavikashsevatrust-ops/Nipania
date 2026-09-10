'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Camera, 
  ArrowRight, 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  Maximize2, 
  X, 
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Tag
} from 'lucide-react';
import { GalleryStory, GALLERY_CATEGORIES, CURATED_GALLERY_STORIES } from '@/lib/gallery';

export default function ImpactGallerySection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedStory, setSelectedStory] = useState<GalleryStory | null>(null);
  const [stories, setStories] = useState<GalleryStory[]>(CURATED_GALLERY_STORIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stories && data.stories.length > 0) {
          setStories(data.stories);
        }
      })
      .catch((err) => console.error('Error loading dynamic gallery:', err));
  }, []);

  const filteredStories = activeCategory === 'all'
    ? stories.slice(0, 8)
    : stories.filter((s) => s.categorySlug === activeCategory).slice(0, 8);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Indian Charitable Heritage Styling */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 mb-4 shadow-xs">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span className="text-xs uppercase tracking-wider text-gold-800 font-bold">
                Stories From Ground
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-heading mb-3 leading-tight">
              Our On-Ground <span className="text-gradient-gold">Seva</span> in Action
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Transparent visual proof of compassionate service. Every picture reflects transformed families, restored health, empowered women, and educated children across rural India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 shadow-sm hover:shadow-md transition-all group border border-slate-300"
            >
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Full Media Archive</span>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-900 shadow-md hover:shadow-lg transition-all font-heading"
            >
              <Heart className="w-4 h-4 fill-slate-900 text-slate-900" />
              <span>Support This Seva</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Category Filter Pills - Touch-Optimized Horizontal Scroller */}
        <div className="relative w-full mb-8 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-2 scrollbar-none overscroll-x-contain touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {GALLERY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap select-none active:scale-95 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md border-2 border-amber-500 ring-2 ring-amber-400/25'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300/80 shadow-xs'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Balanced Modern Grid - Zero Empty Slots across all screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-gold-400/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
            >
              {/* Photo Area with Vignette and Floating Badges */}
              <div className="relative w-full h-56 overflow-hidden bg-slate-900 shrink-0">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Subtle dark vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-black/20" />

                {/* Category Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-navy-950/90 text-gold-300 border border-gold-400/40 shadow-sm backdrop-blur-md">
                    {story.category}
                  </span>
                </div>

                {/* Beneficiaries Pill */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                    <Heart className="w-3 h-3 fill-white" />
                    <span>{story.beneficiaries}</span>
                  </span>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-navy-950 font-bold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5 text-gold-600" />
                    <span>View Story</span>
                  </span>
                </div>

                {/* Location & Date Bar */}
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1 text-slate-200 text-[11px] font-medium truncate drop-shadow">
                    <MapPin className="w-3.5 h-3.5 text-gold-300 shrink-0" />
                    <span className="truncate">{story.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 text-[10px] shrink-0 drop-shadow">
                    <Calendar className="w-3 h-3 text-gold-300" />
                    <span>{story.date}</span>
                  </div>
                </div>
              </div>

              {/* Card Body with High-Contrast Typography */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                <div>
                  {story.highlight && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{story.highlight}</span>
                    </div>
                  )}
                  <h3 className="text-base font-bold text-navy-950 font-heading leading-snug group-hover:text-gold-700 transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-navy-900 group-hover:text-gold-600 flex items-center gap-1 transition-colors">
                    <span>Read Full Impact</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Verified Drive
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Organizational Impact Stats Strip - Deep Sapphire & Teal Jewel Accent */}
        <div className="mt-16 bg-gradient-to-r from-[#0c2847] via-[#093548] to-[#0a2844] rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div className="text-center p-4 rounded-2xl bg-white/10 border border-white/15 hover:border-gold-400/50 transition-all">
              <Heart className="w-7 h-7 text-gold-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-heading">50,000+</div>
              <div className="text-xs text-gold-300 font-bold uppercase tracking-wider mt-1">Lives Touched</div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/10 border border-white/15 hover:border-emerald-400/50 transition-all">
              <Users className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-heading">200+</div>
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider mt-1">Active Volunteers</div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/10 border border-white/15 hover:border-gold-400/50 transition-all">
              <Camera className="w-7 h-7 text-gold-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-heading">45+</div>
              <div className="text-xs text-gold-300 font-bold uppercase tracking-wider mt-1">Ground Campaigns</div>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/10 border border-white/15 hover:border-emerald-400/50 transition-all">
              <MapPin className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-heading">15+</div>
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider mt-1">Districts Reached</div>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Story Detail Lightbox Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-[#0c2340]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gold-400/50 relative my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-navy-950/80 hover:bg-navy-950 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Header */}
            <div className="relative w-full h-72 sm:h-80 bg-slate-900">
              <Image
                src={selectedStory.image}
                alt={selectedStory.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-gold-500 text-navy-950 font-heading">
                    {selectedStory.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white">
                    {selectedStory.beneficiaries}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white leading-tight drop-shadow-md">
                  {selectedStory.title}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Metadata strip */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <MapPin className="w-4 h-4 text-gold-600" />
                  <span>{selectedStory.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>Conducted: {selectedStory.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{selectedStory.highlight}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-navy-950 font-heading uppercase tracking-wide">
                  About This Initiative
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedStory.description}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All humanitarian initiatives by Nipania Vikash Seva Trust are funded through community donations and implemented by verified grassroots volunteers with complete transparent accountability.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href="/donate"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-navy-950 shadow-gold transition-all font-heading"
                >
                  <Heart className="w-4 h-4 fill-navy-950 text-navy-950" />
                  <span>Donate to Support Similar Drives</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
