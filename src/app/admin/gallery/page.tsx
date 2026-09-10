'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ExternalLink,
  Star,
  Search,
  Filter,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface GalleryDbItem {
  id: string;
  title: string;
  category: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  isFeatured: boolean;
  caption: string | null;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  'Relief Seva',
  'Healthcare Camps',
  'Education Support',
  'Clean Water',
  'Women Empowerment',
  'Environment & Greenery',
  'Community Work',
  'Events & Celebrations',
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryDbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, photos: 0, videos: 0, featured: 0 });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMediaType, setSelectedMediaType] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryDbItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Relief Seva');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaType, setFormMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formCaption, setFormCaption] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery?admin=true');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Relief Seva');
    setFormCustomCategory('');
    setFormMediaUrl('');
    setFormMediaType('IMAGE');
    setFormIsFeatured(false);
    setFormCaption('');
    setMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryDbItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    if (CATEGORY_OPTIONS.includes(item.category)) {
      setFormCategory(item.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('OTHER');
      setFormCustomCategory(item.category);
    }
    setFormMediaUrl(item.mediaUrl);
    setFormMediaType(item.mediaType);
    setFormIsFeatured(item.isFeatured);
    setFormCaption(item.caption || '');
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setFormMediaUrl(data.url);
      } else {
        // Fallback to FileReader base64 preview if local upload failed
        const reader = new FileReader();
        reader.onload = () => {
          setFormMediaUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title for the media item.' });
      return;
    }
    if (!formMediaUrl.trim()) {
      setMessage({ type: 'error', text: 'Please provide an image URL or upload a file.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const finalCategory =
      formCategory === 'OTHER' && formCustomCategory.trim()
        ? formCustomCategory.trim()
        : formCategory;

    const payload = {
      title: formTitle.trim(),
      category: finalCategory,
      mediaUrl: formMediaUrl.trim(),
      mediaType: formMediaType,
      isFeatured: formIsFeatured,
      caption: formCaption.trim() || null,
      ...(editingItem ? { id: editingItem.id } : {}),
    };

    try {
      const url = '/api/gallery';
      const method = editingItem ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save media item' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (item: GalleryDbItem) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isFeatured: !item.isFeatured,
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isFeatured: !i.isFeatured } : i))
        );
        setStats((prev) => ({
          ...prev,
          featured: item.isFeatured ? prev.featured - 1 : prev.featured + 1,
        }));
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the gallery?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchItems();
      } else {
        alert('Failed to delete gallery item');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filtered list
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesType =
      selectedMediaType === 'ALL' || item.mediaType === selectedMediaType;

    const matchesFeatured = !onlyFeatured || item.isFeatured;

    return matchesSearch && matchesCategory && matchesType && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gold-600 font-bold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Public Media & Evidence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-heading">
            Photo & Video Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload on-ground relief photos, camp documentation, and drive videos. Updates reflect instantly on public pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
          >
            <span>Live Gallery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold text-xs shadow-gold transition-all duration-200 active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload New Media</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Uploads</p>
              <h3 className="text-2xl font-black text-navy-950 font-heading mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Active in Trust database</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">High-Res Photos</p>
              <h3 className="text-2xl font-black text-navy-950 font-heading mt-1">{stats.photos}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">On-ground seva documentation</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Video Stories</p>
              <h3 className="text-2xl font-black text-navy-950 font-heading mt-1">{stats.videos}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Field reels & short videos</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Featured On Homepage</p>
              <h3 className="text-2xl font-black text-gold-600 font-heading mt-1">{stats.featured}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600">
              <Star className="w-5 h-5 fill-gold-500 text-gold-500" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Pinned to front showcase</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, description or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-gold-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Media Type Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setSelectedMediaType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedMediaType === 'ALL'
                  ? 'bg-white text-navy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedMediaType('IMAGE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedMediaType === 'IMAGE'
                  ? 'bg-white text-navy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Photos Only
            </button>
            <button
              onClick={() => setSelectedMediaType('VIDEO')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedMediaType === 'VIDEO'
                  ? 'bg-white text-navy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Videos Only
            </button>
          </div>

          {/* Featured Filter Toggle */}
          <button
            onClick={() => setOnlyFeatured(!onlyFeatured)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              onlyFeatured
                ? 'bg-gold-500 text-navy-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFeatured ? 'fill-navy-950 text-navy-950' : ''}`} />
            <span>Featured ({stats.featured})</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-navy-950 text-gold-400 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-navy-950 text-gold-400 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid of Gallery Items */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading gallery database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-navy-950">
              {items.length === 0 ? 'No Media Uploaded to Database Yet' : 'No Items Match Your Filters'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {items.length === 0
                ? 'The public gallery is currently displaying default curated initiatives. Click the button below to upload your first real-time on-ground photo or video.'
                : 'Try adjusting your search query, clearing category filters, or showing all media types.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-950 text-gold-400 hover:bg-navy-900 text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Media Item</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e: any) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-950/80 text-white backdrop-blur-xs border border-white/20 shadow-xs">
                    {item.category}
                  </span>
                  {item.mediaType === 'VIDEO' && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/90 text-white flex items-center gap-1 shadow-xs">
                      <Video className="w-3 h-3" />
                      <span>Video</span>
                    </span>
                  )}
                </div>

                {/* Star / Featured Button */}
                <button
                  onClick={() => handleToggleFeatured(item)}
                  title={item.isFeatured ? 'Featured on Homepage (Click to Unpin)' : 'Click to Feature on Homepage'}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 shadow-sm ${
                    item.isFeatured
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-950/50 text-white/70 hover:text-white hover:bg-navy-950/80'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-navy-950' : ''}`} />
                </button>

                {/* Quick Expand Button */}
                <a
                  href={item.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-navy-950/60 hover:bg-navy-950 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                  title="View Full Resolution"
                >
                  <Eye className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-navy-950 text-sm line-clamp-1 group-hover:text-gold-600 transition-colors">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently Added'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload & Edit Modal Dialog */}
      {isModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-400/40 text-gold-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    {editingItem ? 'Edit Media Details' : 'Upload On-Ground Media'}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    Nipania Trust Humanitarian Archive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 min-h-0 flex-1 overflow-y-auto admin-modal-scroll space-y-4 text-xs">
              {message && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    message.type === 'error'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Media Title / Cause Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Eye Checkup & Spectacle Camp in Village"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
                />
              </div>

              {/* Category & Media Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-gold-500 font-medium"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER">Other Custom Category...</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Media Type</label>
                  <select
                    value={formMediaType}
                    onChange={(e) => setFormMediaType(e.target.value as 'IMAGE' | 'VIDEO')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-gold-500 font-medium"
                  >
                    <option value="IMAGE">Photo / Still Image</option>
                    <option value="VIDEO">Video Story / Reel</option>
                  </select>
                </div>
              </div>

              {/* Custom Category Input if OTHER selected */}
              {formCategory === 'OTHER' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enter Custom Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Animal Welfare Seva"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 font-medium"
                  />
                </div>
              )}

              {/* Media Upload & URL Section */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Media Image / Video Source <span className="text-rose-500">*</span>
                </label>

                {/* Media Preview if provided */}
                {formMediaUrl && (
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-2">
                    <img
                      src={formMediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormMediaUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Paste image URL (Unsplash, Cloudinary, etc.)"
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5 text-gold-600" />
                    <span>{uploadingMedia ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingMedia}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports JPG, PNG, WebP up to 5MB, or any public media URL.
                </p>
              </div>

              {/* Caption / Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Caption / Story Narrative (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the initiative, beneficiaries helped, and village location..."
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 leading-relaxed font-medium"
                />
              </div>

              {/* Feature Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gold-50/60 border border-gold-200/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 border-slate-300"
                />
                <div>
                  <span className="font-bold text-navy-950 block">Feature on Public Homepage</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays this item in the top hero showcase on the website.
                  </span>
                </div>
              </label>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingMedia}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold shadow-gold transition-all disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Update Media' : 'Save & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
