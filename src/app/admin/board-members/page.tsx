'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Eye, 
  Sparkles,
  ArrowUpDown,
  UserCheck,
  Building
} from 'lucide-react';

interface BoardMember {
  id: string;
  name: string;
  designation: string;
  category: string;
  image: string;
  quote?: string | null;
  roleDetails?: string | null;
  tenure?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  'Executive Leadership',
  'Board of Trustees',
  'Advisory Council',
  'Patron & Founder',
  'Honorary Member',
];

export default function AdminBoardMembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    category: 'Board of Trustees',
    image: '',
    quote: '',
    roleDetails: '',
    tenure: 'Trustee',
    order: 0,
    isActive: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/board-members');
      const data = await res.json();
      if (data.boardMembers) {
        setMembers(data.boardMembers);
      }
    } catch (err) {
      console.error('Error fetching board members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      category: 'Board of Trustees',
      image: '',
      quote: '',
      roleDetails: '',
      tenure: 'Trustee',
      order: members.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: BoardMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      category: member.category || 'Board of Trustees',
      image: member.image,
      quote: member.quote || '',
      roleDetails: member.roleDetails || '',
      tenure: member.tenure || 'Trustee',
      order: member.order,
      isActive: member.isActive,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image must be under 5MB.' });
      return;
    }

    setUploadingImage(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        setFeedback({ type: 'success', message: 'Photo uploaded successfully!' });
      } else {
        // Fallback to FileReader base64
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Fallback to FileReader base64 on error
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation) {
      setFeedback({ type: 'error', message: 'Name and Designation are required.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const url = editingMember ? `/api/board-members/${editingMember.id}` : '/api/board-members';
      const method = editingMember ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ 
          type: 'success', 
          message: editingMember ? 'Board member updated successfully!' : 'Board member added successfully!' 
        });
        setIsModalOpen(false);
        fetchMembers();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save changes.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the Board of Trustees?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/board-members/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: `"${name}" removed from Board of Trustees.` });
        fetchMembers();
      } else {
        const data = await res.json();
        setFeedback({ type: 'error', message: data.error || 'Failed to delete.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error occurred.' });
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.designation.toLowerCase().includes(search.toLowerCase()) ||
      (m.roleDetails && m.roleDetails.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Governance & Trust Leadership</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Board Members & Trustees
          </h1>
          <p className="text-xs text-slate-500">
            Super Admin portal to manage executive leadership, trustees, and advisory council displayed across the official website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all self-start sm:self-auto border border-navy-700"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add New Trustee / Leader</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between border mb-6 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between mb-6">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-navy-950 text-gold-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({members.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = members.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-navy-950 text-gold-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Members Grid / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading Board Members directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-950">No Board Members found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by adding trustees, founder members, and executive leaders to represent the Trust.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Board Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Header & Banner */}
                <div className="h-20 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 relative p-3 flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
                    {member.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-[10px] text-slate-300 font-semibold">
                      {member.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Profile Photo & Info */}
                <div className="px-5 pt-0 pb-4 relative">
                  <div className="-mt-10 mb-3 flex items-end justify-between">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-3 border-white shadow-lg bg-slate-100">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-navy-900 text-gold-400">
                          <Users className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Order: #{member.order}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-950 font-heading leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-gold-600 mt-0.5">
                    {member.designation}
                  </p>
                  {member.tenure && (
                    <span className="inline-block text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mt-1.5">
                      {member.tenure}
                    </span>
                  )}

                  {member.quote && (
                    <p className="text-xs text-slate-600 italic mt-3 bg-warm-50 p-2.5 rounded-xl border border-warm-200/60 line-clamp-3">
                      "{member.quote}"
                    </p>
                  )}

                  {member.roleDetails && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {member.roleDetails}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(member)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-navy-900 hover:bg-slate-200 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-navy-700" />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(member.id, member.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Board Member Modal */}
      {isModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-navy-950 to-navy-900 p-6 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading">
                    {editingMember ? 'Edit Board Member' : 'Add New Board Member'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nipania Trust Leadership Directory
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 min-h-0 flex-1 overflow-y-auto admin-modal-scroll">
              
              {/* Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-gold-400 bg-navy-950 shrink-0 shadow-md flex items-center justify-center">
                  {formData.image ? (
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-gold-400/70" />
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-xs font-bold text-navy-950">Official Trustee Photograph</h4>
                  <p className="text-[11px] text-slate-500">
                    Upload a high-resolution portrait photograph. (JPG, PNG, WebP up to 5MB)
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-all flex items-center gap-1.5"
                    >
                      {uploadingImage ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-400" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-gold-400" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Choose File / Photo'}</span>
                    </button>

                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="text-xs text-rose-600 hover:underline px-2 py-1"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Managing Trustee / Founder"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tenure / Affiliation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Life Trustee / 2021-Present"
                    value={formData.tenure}
                    onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                  >
                    <option value="true">Active (Visible on Website)</option>
                    <option value="false">Hidden (Draft / Archive)</option>
                  </select>
                </div>
              </div>

              {/* Quote / Philosophy */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quote / Inspirational Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. True social change begins with selfless service at the grassroots."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Bio & Role details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leadership Bio & Portfolio Responsibilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe background, community contributions, and oversight areas in Nipania Vikash Seva Trust..."
                  value={formData.roleDetails}
                  onChange={(e) => setFormData({ ...formData, roleDetails: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMember ? 'Update Board Member' : 'Save & Publish Member'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
