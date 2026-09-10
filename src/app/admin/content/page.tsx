'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminContentPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [heroTitle, setHeroTitle] = useState('Serving Communities. Building a Better Tomorrow.');
  const [heroSubtitle, setHeroSubtitle] = useState('Committed to Seva, Vikash and Samarpan through meaningful community development and social initiatives.');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((res) => res.json()),
      fetch('/api/content').then((res) => res.json()),
    ])
      .then(([statsData, contentData]) => {
        if (statsData.stats) setStats(statsData.stats);
        if (contentData.blocks) {
          const hero = contentData.blocks.find((b: any) => b.key === 'hero_title');
          if (hero) {
            if (hero.title) setHeroTitle(hero.title);
            if (hero.subtitle) setHeroSubtitle(hero.subtitle);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatChange = (index: number, field: string, val: any) => {
    const next = [...stats];
    next[index][field] = val;
    setStats(next);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setSaved(false);

    try {
      await Promise.all([
        fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stats }),
        }),
        fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'hero_title',
            title: heroTitle,
            subtitle: heroSubtitle,
          }),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            CMS & Live Impact Statistics
          </h1>
          <p className="text-xs text-slate-500">
            Edit homepage hero texts and verified impact metrics without editing source code
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-gold-400" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All CMS content and impact statistics saved successfully!</span>
        </div>
      )}

      {/* Hero Headline CMS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
        <h3 className="text-base font-bold text-navy-950 font-heading border-b border-slate-100 pb-2">
          Homepage Hero Headline & Subtitle
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hero Main Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-navy-950 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hero Subheading Text</label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-700 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Impact Counters Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
        <div>
          <h3 className="text-base font-bold text-navy-950 font-heading">
            Official Impact Counters
          </h3>
          <p className="text-xs text-slate-500">
            Set verified figures. Values default to 0+ if unverified.
          </p>
        </div>

        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div
              key={stat.id || idx}
              className="p-4 rounded-2xl bg-warm-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="w-full sm:w-1/3">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Metric Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-navy-950 bg-white"
                />
              </div>

              <div className="w-full sm:w-1/4">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Value (Number)</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-navy-950 bg-white"
                />
              </div>

              <div className="w-full sm:w-1/6">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Suffix</label>
                <input
                  type="text"
                  value={stat.suffix || ''}
                  onChange={(e) => handleStatChange(idx, 'suffix', e.target.value)}
                  placeholder="+"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                />
              </div>

              <div className="w-full sm:w-1/6 flex items-center sm:justify-center pt-3 sm:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={stat.isActive !== false}
                    onChange={(e) => handleStatChange(idx, 'isActive', e.target.checked)}
                    className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                  />
                  <span className="font-semibold text-slate-700 text-xs">Active</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
