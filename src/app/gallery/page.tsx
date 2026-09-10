'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { 
  CURATED_GALLERY_STORIES, 
  GALLERY_CATEGORIES, 
  type GalleryStory 
} from '@/lib/gallery';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Heart, 
  Share2, 
  Check, 
  Compass,
  ArrowRight,
  ShieldCheck,
  Users
} from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryStory[]>(CURATED_GALLERY_STORIES);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch updated gallery from API (DB + curated fallback)
  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch (err) {
        console.warn('Using curated gallery items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  // Filtered stories based on category slug & search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = 
        activeCategorySlug === 'all' || 
        item.categorySlug === activeCategorySlug;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.highlight && item.highlight.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategorySlug, searchQuery]);

  // Current active story for lightbox
  const currentStory = selectedStoryIndex !== null ? filteredItems[selectedStoryIndex] : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedStoryIndex === null) return;
      if (e.key === 'Escape') setSelectedStoryIndex(null);
      if (e.key === 'ArrowRight' && selectedStoryIndex < filteredItems.length - 1) {
        setSelectedStoryIndex(selectedStoryIndex + 1);
      }
      if (e.key === 'ArrowLeft' && selectedStoryIndex > 0) {
        setSelectedStoryIndex(selectedStoryIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStoryIndex, filteredItems.length]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-warm-50 text-slate-900 selection:bg-gold-500/20 selection:text-gold-900">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Banner with Modern Deep Midnight & Gold Accent */}
        <section className="relative bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Ground Verifiable Seva Archive</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Our On-Ground Seva <span className="text-gradient-gold">In Action</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Every photograph captures genuine grassroots devotion—from life-saving flood relief kits and emergency blood camps to digital literacy and women empowerment workshops in remote villages.
            </p>

            {/* Quick Metrics Strip */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-gold-400 font-heading">50,000+</span>
                <span className="text-xs text-slate-300 font-medium">Lives Touched</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-heading">120+</span>
                <span className="text-xs text-slate-300 font-medium">Villages Served</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-gold-400 font-heading">45+</span>
                <span className="text-xs text-slate-300 font-medium">Medical Camps</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-heading">100%</span>
                <span className="text-xs text-slate-300 font-medium">Verifiable Seva</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 sm:p-6 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by initiative, village, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Verified Badge indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 self-start lg:self-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All visual media verified with timestamp & GPS field logs</span>
              </div>
            </div>

            {/* Category Pills with smooth horizontal scrolling */}
            <div className="mt-4 pt-4 border-t border-slate-100 relative">
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none touch-pan-x overscroll-x-contain">
                {GALLERY_CATEGORIES.map((cat) => {
                  const count = cat.slug === 'all'
                    ? items.length
                    : items.filter(i => i.categorySlug === cat.slug).length;
                  const isSelected = activeCategorySlug === cat.slug;

                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategorySlug(cat.slug)}
                      className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-md border-2 border-amber-500 ring-2 ring-amber-400/25 font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                        isSelected ? 'bg-amber-700/60 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">No Records Found</h3>
              <p className="text-xs text-slate-500 mt-2">
                We couldn&apos;t find any initiatives matching &quot;{searchQuery || activeCategorySlug}&quot;. Try adjusting your search keywords or switching category filters.
              </p>
              <button
                onClick={() => {
                  setActiveCategorySlug('all');
                  setSearchQuery('');
                }}
                className="mt-6 px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map((story, index) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStoryIndex(index)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-950/80 backdrop-blur-md text-gold-400 border border-gold-500/30">
                        {story.category}
                      </span>
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Bottom Metadata floating */}
                    <div className="absolute bottom-3 left-4 right-4 text-white text-xs flex items-center justify-between pointer-events-none">
                      {story.location && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-200 bg-navy-950/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                          <MapPin className="w-3 h-3 text-gold-400" />
                          <span className="truncate max-w-[180px]">{story.location}</span>
                        </div>
                      )}
                      {story.beneficiaries && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-navy-950/60 backdrop-blur-sm px-2.5 py-1 rounded-md font-semibold">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>{story.beneficiaries}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-navy-950 font-heading group-hover:text-gold-600 transition-colors leading-snug">
                        {story.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {story.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-900 group-hover:text-gold-600 flex items-center gap-1 transition-colors">
                        Inspect Seva Media
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {story.highlight || 'Field Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Seva Callout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-8 sm:p-12 text-white border border-gold-500/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 text-gold-400 text-xs font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 fill-gold-400" />
                Join The Movement
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Be The Reason A Village Family Smiles Today
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your donation directly funds verified on-ground camps, educational kits for rural children, and emergency ration relief kits with 100% transparent audit reporting.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link
                href="/donate"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-gold text-navy-950 font-bold text-sm shadow-gold hover:shadow-gold-hover hover:scale-[1.02] transition-all text-center"
              >
                Donate for Seva (80G Tax Exemption)
              </Link>
              <Link
                href="/volunteer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all text-center"
              >
                Join As Ground Volunteer
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modern High-End Lightbox Modal */}
      {currentStory && (
        <div 
          className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedStoryIndex(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-navy-900 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-navy-950/80">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  {currentStory.category}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">
                  {selectedStoryIndex! + 1} / {filteredItems.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleShare}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs flex items-center gap-1.5 transition-colors"
                  title="Copy Page Link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
                <button
                  onClick={() => setSelectedStoryIndex(null)}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 text-white hover:bg-red-500/80 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Modal Media Body */}
            <div className="relative flex-1 bg-black min-h-[220px] sm:min-h-[440px] max-h-[50vh] sm:max-h-[60vh] flex items-center justify-center overflow-hidden">
              <Image
                src={currentStory.image}
                alt={currentStory.title}
                fill
                className="object-contain"
                priority
              />

              {/* Prev / Next Nav Buttons */}
              {selectedStoryIndex! > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStoryIndex(selectedStoryIndex! - 1);
                  }}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-navy-950/75 hover:bg-navy-950 text-white border border-white/20 transition-all backdrop-blur-md"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {selectedStoryIndex! < filteredItems.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStoryIndex(selectedStoryIndex! + 1);
                  }}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-navy-950/75 hover:bg-navy-950 text-white border border-white/20 transition-all backdrop-blur-md"
                  aria-label="Next story"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Modal Details Footer */}
            <div className="p-4 sm:p-6 bg-navy-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 overflow-y-auto max-h-[35vh]">
              <div className="space-y-1.5 max-w-2xl">
                <h3 className="text-base sm:text-xl font-bold font-heading text-white">
                  {currentStory.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {currentStory.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 pt-1">
                  {currentStory.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      {currentStory.location}
                    </span>
                  )}
                  {currentStory.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {currentStory.date}
                    </span>
                  )}
                  {currentStory.beneficiaries && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Users className="w-3.5 h-3.5" />
                      {currentStory.beneficiaries}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/donate"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-gold text-navy-950 font-bold text-xs shadow-gold hover:shadow-gold-hover transition-all text-center"
                >
                  Support This Cause
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
