'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Layers,
  Filter,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SponsorshipItem {
  id: string;
  category: string;
  title: string;
  amount: number;
  monthlyAmount?: number | null;
  icon: string;
  unitLabel: string;
  description: string;
  impactMetrics: string[];
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, active: 0, featured: 0 });

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SponsorshipItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'MEALS',
    amount: '',
    monthlyAmount: '',
    icon: '🍱',
    unitLabel: '',
    description: '',
    impactMetricsText: '',
    isFeatured: false,
    isActive: true,
    order: 0,
  });

  const fetchSponsors = () => {
    setLoading(true);
    let url = '/api/sponsors?admin=true';
    if (categoryFilter !== 'ALL') url += `&category=${categoryFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.sponsors) setSponsors(data.sponsors);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error('Failed to load sponsors:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSponsors();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      title: '',
      category: 'MEALS',
      amount: '',
      monthlyAmount: '',
      icon: '🍱',
      unitLabel: 'people fed',
      description: '',
      impactMetricsText: 'Nutritious Hot Meal\nClean Drinking Water\nVerified Beneficiary',
      isFeatured: false,
      isActive: true,
      order: sponsors.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SponsorshipItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      amount: String(item.amount),
      monthlyAmount: item.monthlyAmount ? String(item.monthlyAmount) : String(item.amount),
      icon: item.icon || '🤝',
      unitLabel: item.unitLabel,
      description: item.description,
      impactMetricsText: (item.impactMetrics || []).join('\n'),
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      order: item.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(form.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid contribution amount.');
      return;
    }

    const parsedMonthly = form.monthlyAmount ? parseFloat(form.monthlyAmount) : parsedAmount;
    const metrics = form.impactMetricsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        amount: parsedAmount,
        monthlyAmount: parsedMonthly,
        icon: form.icon,
        unitLabel: form.unitLabel,
        description: form.description,
        impactMetrics: metrics,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        order: Number(form.order) || 0,
      };

      const url = '/api/sponsors';
      const method = editingItem ? 'PATCH' : 'POST';
      const body = editingItem ? JSON.stringify({ id: editingItem.id, ...payload }) : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sponsorship cause');
      }

      setFeedback({
        type: 'success',
        message: editingItem
          ? `Sponsorship cause "${form.title}" updated successfully!`
          : `New sponsorship cause "${form.title}" created successfully!`,
      });
      setIsModalOpen(false);
      setEditingItem(null);
      fetchSponsors();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error saving sponsorship cause');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async (item: SponsorshipItem) => {
    try {
      const res = await fetch('/api/sponsors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isFeatured: !item.isFeatured }),
      });
      if (res.ok) {
        setSponsors((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, isFeatured: !s.isFeatured } : s))
        );
      }
    } catch (e) {
      console.error('Failed to toggle featured:', e);
    }
  };

  const handleToggleActive = async (item: SponsorshipItem) => {
    try {
      const res = await fetch('/api/sponsors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      });
      if (res.ok) {
        setSponsors((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (e) {
      console.error('Failed to toggle active status:', e);
    }
  };

  const handleDelete = async (item: SponsorshipItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?\n\nThis cause will no longer be available on the public sponsorship page.`)) {
      return;
    }

    setIsDeletingId(item.id);
    try {
      const res = await fetch(`/api/sponsors?id=${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete sponsorship cause');

      setFeedback({
        type: 'success',
        message: `Sponsorship cause "${item.title}" deleted successfully.`,
      });
      setSponsors((prev) => prev.filter((s) => s.id !== item.id));
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error deleting sponsorship cause');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredSponsors = sponsors.filter((item) => {
    if (statusFilter === 'ACTIVE' && !item.isActive) return false;
    if (statusFilter === 'INACTIVE' && item.isActive) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.unitLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4 text-gold-600" />
            <span>Programs & Outreach</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Sponsorship Causes & Tiers
          </h1>
          <p className="text-xs text-slate-500">
            Manage public sponsorship causes (meals, menstrual hygiene, education, healthcare). All changes immediately sync with the public /sponsor directory and donation checkout.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>New Sponsor Cause</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sponsor Causes</div>
          <div className="text-3xl font-extrabold text-navy-950 mt-2 font-mono">{stats.total || sponsors.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Configured across all categories</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active on Website</div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">
            {sponsors.filter((s) => s.isActive).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Live for donors on /sponsor page</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-gold-600 uppercase tracking-wider">Featured Highlights</div>
          <div className="text-3xl font-extrabold text-gold-600 mt-2 font-mono">
            {sponsors.filter((s) => s.isFeatured).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Highlighted with gold priority badge</div>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-black/5 rounded-md text-slate-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description, or unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="MEALS">🍱 Meals & Langar</option>
              <option value="HYGIENE">🌸 Dignity & Hygiene</option>
              <option value="EDUCATION">🎒 Child Education</option>
              <option value="HEALTHCARE">🩺 Healthcare & Elders</option>
              <option value="EMERGENCY">🚨 Emergency Relief</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Hidden / Inactive</option>
            </select>
          </div>

          <button
            onClick={fetchSponsors}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Sponsorship Causes */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400">
          Loading sponsorship causes...
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <p>No sponsorship causes found matching your filter.</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800"
          >
            <Plus className="w-3.5 h-3.5 text-gold-400" />
            <span>Create First Cause</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSponsors.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all duration-200 p-6 flex flex-col justify-between ${
                item.isActive ? 'border-slate-200 shadow-card hover:border-gold-500/50' : 'border-slate-200 opacity-60 bg-slate-50/60'
              }`}
            >
              <div className="space-y-4">
                {/* Header with Icon, Category & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shrink-0">
                      {item.icon || '🤝'}
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <div className="text-[11px] text-slate-500 font-medium">{item.unitLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      title={item.isFeatured ? 'Featured on Website' : 'Not Featured (Click to Feature)'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.isFeatured
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Edit Cause"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isDeletingId === item.id}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                      title="Delete Cause"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-extrabold text-navy-950 font-heading line-clamp-1" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Amount Badges */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">One-Time Seva</span>
                    <span className="text-base font-extrabold text-emerald-700 font-mono">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  {item.monthlyAmount && (
                    <div className="text-right">
                      <span className="text-[10px] text-teal-600 uppercase font-bold block">Monthly Recurring</span>
                      <span className="text-sm font-bold text-navy-900 font-mono">
                        {formatCurrency(item.monthlyAmount)}/mo
                      </span>
                    </div>
                  )}
                </div>

                {/* Impact Metrics Pills */}
                {item.impactMetrics && item.impactMetrics.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Direct Deliverables
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.impactMetrics.slice(0, 3).map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60 flex items-center gap-1"
                        >
                          <span className="text-teal-600">✓</span>
                          <span>{m}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    item.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>{item.isActive ? 'Active on /sponsor' : 'Hidden from Donors'}</span>
                </button>

                <span className="text-[10px] text-slate-400 font-mono">Order: #{item.order}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy-950 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-gold-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  {editingItem ? `Edit Sponsorship Cause — ${editingItem.title}` : 'Create New Sponsorship Cause'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 min-h-0 flex-1 overflow-y-auto admin-modal-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cause Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Feed 6 Daily Wage Laborers, Sponsor School Bag..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden bg-white font-semibold"
                  >
                    <option value="MEALS">MEALS (Annapurna Seva)</option>
                    <option value="HYGIENE">HYGIENE (Women Dignity)</option>
                    <option value="EDUCATION">EDUCATION (Vidya Daan)</option>
                    <option value="HEALTHCARE">HEALTHCARE (Elder & Clinic)</option>
                    <option value="EMERGENCY">EMERGENCY (Disaster Relief)</option>
                    <option value="OTHER">OTHER COMMUNITY SEVA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🍱, 🌸, 🎒, 🩺"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden text-center text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    One-Time Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 500"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-bold font-mono text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Recurring (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g. 500"
                    value={form.monthlyAmount}
                    onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-bold font-mono text-navy-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit / Outcome Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6 people fed, 1 child supported, 1 student kit"
                    value={form.unitLabel}
                    onChange={(e) => setForm({ ...form, unitLabel: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Impact Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe exactly what this sponsorship accomplishes on the ground..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Deliverables (1 item per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Cooked Thali Meals&#10;Safe Potable Drinking Water&#10;Prepared by Trust Kitchen"
                    value={form.impactMetricsText}
                    onChange={(e) => setForm({ ...form, impactMetricsText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Each line appears as a verified bullet on the card.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                    />
                    <span>Highlight as Featured Cause</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Active (Display on Public /sponsor)</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-50 shadow-sm transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Cause...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Save Changes' : 'Create Cause'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
