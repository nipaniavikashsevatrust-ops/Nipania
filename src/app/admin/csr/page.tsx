'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Coins,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Trash2,
  X,
  ChevronRight,
  ExternalLink,
  Edit3,
  FileText,
  User,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface CsrInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  subject: string;
  focusArea: string;
  budgetRange: string;
  locationPreference: string;
  requirements: string;
  fullMessage: string;
  status: 'NEW' | 'IN_REVIEW' | 'PROPOSAL_SENT' | 'MOA_SIGNED' | 'CLOSED';
  adminNotes: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeBg: string; textCol: string; borderCol: string; icon: any }
> = {
  NEW: {
    label: 'Fresh Lead (New)',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    textCol: 'text-emerald-700',
    borderCol: 'border-emerald-400',
    icon: AlertCircle,
  },
  IN_REVIEW: {
    label: 'In Review / Consultation',
    badgeBg: 'bg-amber-500/10 text-amber-800 border-amber-300',
    textCol: 'text-amber-800',
    borderCol: 'border-amber-400',
    icon: Clock,
  },
  PROPOSAL_SENT: {
    label: 'Proposal & Budget Sent',
    badgeBg: 'bg-blue-500/10 text-blue-700 border-blue-300',
    textCol: 'text-blue-700',
    borderCol: 'border-blue-400',
    icon: Send,
  },
  MOA_SIGNED: {
    label: 'MoA Signed / Approved',
    badgeBg: 'bg-purple-500/10 text-purple-700 border-purple-300',
    textCol: 'text-purple-700',
    borderCol: 'border-purple-400',
    icon: CheckCircle2,
  },
  CLOSED: {
    label: 'Completed / Closed',
    badgeBg: 'bg-slate-500/10 text-slate-700 border-slate-300',
    textCol: 'text-slate-700',
    borderCol: 'border-slate-400',
    icon: FileText,
  },
};

export default function AdminCsrPage() {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  const [inquiries, setInquiries] = useState<CsrInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  // Selected inquiry for detail modal & handling
  const [selectedInquiry, setSelectedInquiry] = useState<CsrInquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Deletion confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CsrInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/csr');
      const data = await res.json();
      if (res.ok && data.inquiries) {
        setInquiries(data.inquiries);
      } else {
        showError(data.error || 'Failed to fetch CSR inquiries');
      }
    } catch (e) {
      console.error(e);
      showError('Error loading CSR inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/csr/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
        );
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      } else {
        showError(data.error || 'Failed to update status');
      }
    } catch (e) {
      showError('Network error while updating status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Save Follow-up Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/csr/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: noteDraft }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Follow-up notes saved successfully!');
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === selectedInquiry.id ? { ...item, adminNotes: noteDraft } : item
          )
        );
        setSelectedInquiry((prev) => (prev ? { ...prev, adminNotes: noteDraft } : null));
      } else {
        showError(data.error || 'Failed to save notes');
      }
    } catch (e) {
      showError('Network error while saving notes');
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/csr/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('CSR inquiry deleted successfully');
        setInquiries((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        if (selectedInquiry?.id === deleteTarget.id) {
          setIsDetailModalOpen(false);
          setSelectedInquiry(null);
        }
        setDeleteTarget(null);
      } else {
        showError(data.error || 'Failed to delete inquiry');
      }
    } catch (e) {
      showError('Network error while deleting inquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (inquiries.length === 0) {
      showError('No inquiries available to export');
      return;
    }

    const headers = [
      'Inquiry ID',
      'Organization / Company',
      'Contact Person',
      'Official Email',
      'Phone Number',
      'Schedule VII Focus Area',
      'Estimated Budget',
      'Preferred Location',
      'Status',
      'Internal Notes',
      'Submitted Date',
    ];

    const rows = inquiries.map((i) => [
      `"${i.id}"`,
      `"${i.companyName.replace(/"/g, '""')}"`,
      `"${i.contactPerson.replace(/"/g, '""')}"`,
      `"${i.email}"`,
      `"${i.phone}"`,
      `"${i.focusArea.replace(/"/g, '""')}"`,
      `"${i.budgetRange.replace(/"/g, '""')}"`,
      `"${i.locationPreference.replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${(i.adminNotes || '').replace(/"/g, '""')}"`,
      `"${formatDate(i.createdAt)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nipania_Trust_CSR_Enquiries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess(`Exported ${inquiries.length} CSR inquiries to CSV`);
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSector = sectorFilter === 'ALL' || item.focusArea.toLowerCase().includes(sectorFilter.toLowerCase());
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.companyName.toLowerCase().includes(q) ||
      item.contactPerson.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.focusArea.toLowerCase().includes(q) ||
      item.locationPreference.toLowerCase().includes(q);

    return matchesStatus && matchesSector && matchesSearch;
  });

  // Calculate Metrics
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'NEW').length;
  const inReviewCount = inquiries.filter((i) => i.status === 'IN_REVIEW').length;
  const activeProposalsCount = inquiries.filter(
    (i) => i.status === 'PROPOSAL_SENT' || i.status === 'MOA_SIGNED'
  ).length;

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold-600 font-bold uppercase tracking-widest text-[11px] mb-1">
            <Building2 className="w-4 h-4 text-gold-600" />
            <span>Corporate Social Responsibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
            CSR Partnerships &amp; Grants Desk
          </h1>
          <p className="text-xs text-slate-500">
            Review corporate inquiries, manage Schedule VII project proposals, track MoAs, and maintain corporate relationships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchInquiries}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={inquiries.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Export CSV ({inquiries.length})</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enquiries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-navy-950 font-mono">{totalCount}</span>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 block">All incoming corporate leads</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1 bg-gradient-to-br from-emerald-50/40 via-white to-white">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Fresh / Action Needed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{newCount}</span>
            <AlertCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Requires initial outreach call</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1 bg-gradient-to-br from-amber-50/40 via-white to-white">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Under Discussion</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-800 font-mono">{inReviewCount}</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[10px] text-amber-700 font-medium block">Consultation in progress</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-sm space-y-1 bg-gradient-to-br from-blue-50/40 via-white to-white">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Proposal / MoA Active</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{activeProposalsCount}</span>
            <Send className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[10px] text-blue-600 font-semibold block">Active partnership pipeline</span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, contact person, email, phone, location, sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Statuses ({inquiries.length})</option>
              <option value="NEW">Fresh Leads Only ({newCount})</option>
              <option value="IN_REVIEW">In Review / Consultation ({inReviewCount})</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="MOA_SIGNED">MoA Signed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

        </div>

        {/* Quick Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Filter:</span>
          {[
            { key: 'ALL', label: 'All Leads' },
            { key: 'NEW', label: 'Fresh Leads' },
            { key: 'IN_REVIEW', label: 'Under Review' },
            { key: 'PROPOSAL_SENT', label: 'Proposals' },
            { key: 'MOA_SIGNED', label: 'MoA Signed' },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === pill.key
                  ? 'bg-navy-950 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. INQUIRIES LIST / TABLE */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Loading CSR Partnerships &amp; Enquiries...
          </p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-navy-950">No CSR Inquiries Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {search || statusFilter !== 'ALL'
              ? 'No corporate enquiries match your current filter settings. Try clearing the search query or status filter.'
              : 'Incoming CSR partnership requests submitted via the public /csr portal will automatically appear here for review and handling.'}
          </p>
          {(search || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const statusMeta = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.NEW;
            const StatusIcon = statusMeta.icon;

            return (
              <div
                key={inquiry.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header: Company Name, Status Badge, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-navy-950 font-heading">
                          {inquiry.companyName}
                        </h2>
                        {inquiry.status === 'NEW' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Fresh Lead" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Contact Person: <strong className="text-slate-800">{inquiry.contactPerson}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeBg}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusMeta.label}</span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(inquiry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-warm-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Focus Domain</span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {inquiry.focusArea}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Budget Allocation</span>
                    <span className="font-bold text-amber-900 truncate block mt-0.5 font-mono">
                      {inquiry.budgetRange}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Target Location</span>
                    <span className="font-semibold text-slate-700 truncate block mt-0.5">
                      {inquiry.locationPreference}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Official Contact</span>
                    <div className="truncate mt-0.5 space-y-0.5">
                      <span className="block text-slate-800 font-mono font-medium truncate">{inquiry.email}</span>
                      <span className="block text-slate-600 font-mono">{inquiry.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements Extract */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Partnership Scope / Objectives:
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    {inquiry.requirements || inquiry.fullMessage}
                  </p>
                </div>

                {/* Admin Follow-up Note Indicator */}
                {inquiry.adminNotes && (
                  <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/70 rounded-xl p-2.5 text-xs text-amber-950">
                    <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[10px] uppercase tracking-wider text-amber-800 block">Internal Follow-up Note:</strong>
                      <span className="text-slate-700">{inquiry.adminNotes}</span>
                    </div>
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Left: Quick Status Update Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Update Status:</span>
                    <select
                      value={inquiry.status}
                      disabled={statusUpdating}
                      onChange={(e) => handleUpdateStatus(inquiry.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="NEW">NEW (Fresh Lead)</option>
                      <option value="IN_REVIEW">IN_REVIEW (Consultation)</option>
                      <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                      <option value="MOA_SIGNED">MOA_SIGNED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Email Compose Button */}
                    <a
                      href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                        `RE: CSR Partnership Proposal - Nipania Vikash Seva Trust`
                      )}&body=${encodeURIComponent(
                        `Dear ${inquiry.contactPerson},\n\nGreetings from Nipania Vikash Seva Trust!\n\nThank you for reaching out regarding Corporate Social Responsibility collaboration in ${inquiry.focusArea}.\n\nWe have reviewed your scope and would like to schedule a brief consultation call with our Managing Trustee and Program Director to share our Schedule VII concept note and budget estimates.\n\nStatutory Credentials:\n- Registered Public Charitable Trust (Govt Reg No: IV-120/2022)\n- 12A & 80G Tax-Exempt Status\n- NITI Aayog NGO Darpan ID: UP/2021/0295112\n\nLooking forward to partnering with ${inquiry.companyName}.\n\nWarm regards,\nCorporate CSR Desk\nNipania Vikash Seva Trust\nPhone: +91 98765 43210\nWebsite: https://nipaniatrust.org`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                      title="Compose official proposal email"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>Email</span>
                    </a>

                    {/* WhatsApp Quick Connect */}
                    {inquiry.phone && (
                      <a
                        href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${inquiry.contactPerson}, greetings from Nipania Vikash Seva Trust regarding your CSR partnership enquiry for ${inquiry.companyName}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors"
                        title="Connect via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* View Details & Lead Dossier Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setNoteDraft(inquiry.adminNotes || '');
                        setIsDetailModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Manage Lead</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(inquiry)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DETAILED LEAD MANAGEMENT DRAWER / MODAL               */}
      {/* ======================================================== */}
      {isDetailModalOpen && selectedInquiry && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto max-h-[95vh] overflow-y-auto admin-modal-scroll space-y-6">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-navy-950 font-heading">
                    {selectedInquiry.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Corporate CSR Partnership Dossier • Submitted on {formatDateTime(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pipeline Status Selector */}
            <div className="p-4 rounded-2xl bg-warm-50 border border-amber-200/80 space-y-2">
              <span className="text-xs font-bold text-navy-950 block uppercase tracking-wider">
                Partnership Pipeline Stage:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { key: 'NEW', label: '1. Fresh Lead' },
                  { key: 'IN_REVIEW', label: '2. In Review' },
                  { key: 'PROPOSAL_SENT', label: '3. Proposal Sent' },
                  { key: 'MOA_SIGNED', label: '4. MoA Signed' },
                  { key: 'CLOSED', label: '5. Closed' },
                ].map((step) => {
                  const isCurrent = selectedInquiry.status === step.key;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, step.key)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        isCurrent
                          ? 'bg-navy-950 text-white border-navy-950 shadow-xs ring-2 ring-gold-400/40'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corporate Profile Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact Executive</span>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-navy-950">{selectedInquiry.contactPerson}</p>
                  <p className="text-slate-600 flex items-center gap-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">{selectedInquiry.email}</a>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">{selectedInquiry.phone}</a>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Program Parameters</span>
                <div className="space-y-1">
                  <p className="text-slate-800">
                    <strong className="text-slate-500">Domain:</strong> {selectedInquiry.focusArea}
                  </p>
                  <p className="text-slate-800">
                    <strong className="text-slate-500">Allocation:</strong> <span className="font-bold text-amber-800 font-mono">{selectedInquiry.budgetRange}</span>
                  </p>
                  <p className="text-slate-800">
                    <strong className="text-slate-500">Location:</strong> {selectedInquiry.locationPreference}
                  </p>
                </div>
              </div>
            </div>

            {/* Full Requirements & Brief */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-navy-950 block uppercase tracking-wider">
                Full Enquiry Details &amp; Requirements:
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedInquiry.fullMessage || selectedInquiry.requirements}
              </div>
            </div>

            {/* Internal Follow-up Notes Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Internal Follow-up &amp; Meeting Notes:</span>
                </span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-gold-600 hover:bg-gold-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Log discussion notes, date of meeting with CSR committee, customized budget requirements, next follow-up date..."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    `RE: CSR Partnership Proposal - Nipania Vikash Seva Trust`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Proposal Email</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Chat</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. DELETION CONFIRMATION DIALOG                          */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-100">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950">Delete CSR Inquiry</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the CSR inquiry from <strong>{deleteTarget.companyName}</strong> ({deleteTarget.contactPerson})?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteInquiry}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
