'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FolderKanban, Plus, Edit, Trash2, Eye, X, RefreshCw, CheckCircle, Upload } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Education',
    summary: '',
    description: '',
    location: 'Nipania & Surroundings',
    targetAmount: 200000,
    raisedAmount: 0,
    beneficiariesCount: 100,
    status: 'ACTIVE',
    bannerImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
  });

  const fetchProjects = () => {
    setLoading(true);
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProject(null);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setForm({ ...form, bannerImage: data.url });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setForm({ ...form, bannerImage: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm({ ...form, bannerImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Campaigns & Social Drives
          </h1>
          <p className="text-xs text-slate-500">
            Create, manage targets, and track emergency appeals and community welfare campaigns
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setForm({
              title: '',
              category: 'Education',
              summary: '',
              description: '',
              location: 'Nipania & Surroundings',
              targetAmount: 200000,
              raisedAmount: 0,
              beneficiariesCount: 100,
              status: 'ACTIVE',
              bannerImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>New Campaign / Drive</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400">No projects found.</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-gold-100 text-gold-800">
                    {p.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                    {p.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-950 font-heading leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{p.summary}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Raised / Target:</span>
                  <span className="font-mono font-bold text-navy-950">
                    {formatCurrency(p.raisedAmount)} / {formatCurrency(p.targetAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditingProject(p);
                      setForm({
                        title: p.title,
                        category: p.category,
                        summary: p.summary,
                        description: p.description,
                        location: p.location || '',
                        targetAmount: p.targetAmount,
                        raisedAmount: p.raisedAmount,
                        beneficiariesCount: p.beneficiariesCount,
                        status: p.status,
                        bannerImage: p.bannerImage || '',
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 my-auto max-h-[92vh] overflow-y-auto admin-modal-scroll animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy-950 font-heading">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Environment">Environment</option>
                    <option value="Community Development">Community Development</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PLANNING">PLANNING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary (Short)</label>
                <input
                  type="text"
                  required
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Amount (INR)</label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Raised Amount (INR)</label>
                  <input
                    type="number"
                    value={form.raisedAmount}
                    onChange={(e) => setForm({ ...form, raisedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Banner Image</label>
                <div className="space-y-3">
                  {/* Banner Preview */}
                  <div className="relative w-full h-40 rounded-xl border-2 border-slate-300 bg-slate-50 overflow-hidden">
                    {form.bannerImage ? (
                      <Image
                        src={form.bannerImage}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <div className="text-center">
                          <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <span className="text-xs">No banner image</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={bannerFileInputRef}
                      onChange={handleBannerUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingBanner}
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploadingBanner ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Banner Image</span>
                        </>
                      )}
                    </button>
                    {form.bannerImage && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, bannerImage: '' })}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Recommended: 1200x600px landscape image (JPG, PNG, WebP)
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800"
                >
                  Save Project
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
