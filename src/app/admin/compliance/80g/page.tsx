'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  ShieldCheck,
  Download,
  Upload,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Layers,
  Check,
  X,
  FileText,
  Edit2,
  ChevronRight,
  Info,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getFinancialYearList, getCurrentFinancialYear } from '@/lib/financialYear';

interface ComplianceStats {
  financialYear: string;
  totalDonations: number;
  totalDonationsAmount: number;
  eligible80GCount: number;
  eligible80GAmount: number;
  tenBdReadyCount: number;
  tenBdHasIssuesCount: number;
  tenBdPendingCount: number;
  tenBdIncludedCount: number;
  tenBdFiledCount: number;
  tenBeUploadedCount: number;
  tenBePendingUploadCount: number;
  tenBeEmailSentCount: number;
  tenBeEmailPendingCount: number;
  tenBeEmailFailedCount: number;
}

interface DonationRecord {
  id: string;
  donationId: string;
  receiptNumber?: string;
  officialReceiptNumber?: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPan?: string;
  donorAddress?: string;
  donorPincode?: string;
  amount: number;
  paymentMode: string;
  paymentStatus: string;
  financialYear: string;
  donationEligible80G: boolean;
  tenBdStatus: string;
  tenBdFinancialYear?: string;
  tenBdBatchId?: string;
  tenBdIncludedAt?: string;
  tenBdFilingId?: string;
  tenBeStatus: string;
  tenBeNumber?: string;
  tenBeIssueDate?: string;
  tenBePdfUrl?: string;
  tenBeUploadedAt?: string;
  tenBeUploadedBy?: string;
  tenBeEmailStatus: string;
  tenBeEmailSentAt?: string;
  tenBeEmailError?: string;
  secureAccessToken: string;
  createdAt: string;
}

interface FilingBatch {
  id: string;
  batchName: string;
  financialYear: string;
  status: string;
  donationCount: number;
  totalAmount: number;
  acknowledgementNumber?: string;
  filingDate?: string;
  notes?: string;
  createdAt: string;
}

interface ValidationResult {
  financialYear: string;
  totalEligible: number;
  validCount: number;
  invalidCount: number;
  errors?: {
    id?: string;
    donationId: string;
    receiptNumber?: string;
    donorName: string;
    amount: number;
    issues?: string[];
    errors?: string[];
  }[];
  issues?: {
    id?: string;
    donationId: string;
    receiptNumber?: string;
    donorName: string;
    amount: number;
    issues?: string[];
    errors?: string[];
  }[];
  summary?: {
    totalDonations: number;
    validCount: number;
    invalidCount: number;
  };
}

export default function Compliance80GPage() {
  const [activeTab, setActiveTab] = useState<'preparation' | 'filings' | '10be'>('preparation');
  const [selectedFY, setSelectedFY] = useState<string>('2026-27');
  const [availableFYs, setAvailableFYs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [filings, setFilings] = useState<FilingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // Validation state
  const [validationData, setValidationData] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  // Modals state
  const [editingDonation, setEditingDonation] = useState<DonationRecord | null>(null);
  const [uploadingForDonation, setUploadingForDonation] = useState<DonationRecord | null>(null);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [selectedFilingForUpdate, setSelectedFilingForUpdate] = useState<FilingBatch | null>(null);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);

  // Form submission states
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 10BE Upload Form State
  const [tenBeFile, setTenBeFile] = useState<File | null>(null);
  const [tenBeNumber, setTenBeNumber] = useState('');
  const [tenBeIssueDate, setTenBeIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Create Batch Form State
  const [batchName, setBatchName] = useState('');
  const [batchNotes, setBatchNotes] = useState('');

  // Update Filing Batch Form State
  const [filingStatus, setFilingStatus] = useState('FILED');
  const [ackNumber, setAckNumber] = useState('');
  const [filingDate, setFilingDate] = useState(new Date().toISOString().split('T')[0]);
  const [filingNotes, setFilingNotes] = useState('');

  // Quick Edit Donor Form State
  const [editDonorName, setEditDonorName] = useState('');
  const [editDonorEmail, setEditDonorEmail] = useState('');
  const [editDonorPan, setEditDonorPan] = useState('');
  const [editDonorAddress, setEditDonorAddress] = useState('');
  const [editDonorPincode, setEditDonorPincode] = useState('');
  const [editEligible80G, setEditEligible80G] = useState(true);

  // Bulk Email State
  const [bulkEmailProgress, setBulkEmailProgress] = useState<{
    total: number;
    sent: number;
    failed: number;
    inProgress: boolean;
    logs: string[];
  }>({ total: 0, sent: 0, failed: 0, inProgress: false, logs: [] });

  // Initialize FY list
  useEffect(() => {
    try {
      const list = getFinancialYearList();
      setAvailableFYs(list);
      const cur = getCurrentFinancialYear();
      if (list.includes(cur)) {
        setSelectedFY(cur);
      } else if (list.length > 0) {
        setSelectedFY(list[0]);
      }
    } catch {
      setAvailableFYs(['2026-27', '2025-26', '2024-25', '2023-24']);
      setSelectedFY('2026-27');
    }
  }, []);

  // Notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Fetch stats & donations
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`/api/compliance/80g/stats?financialYear=${selectedFY}`);
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        setStats(statsJson.stats || statsJson.kpis || null);
      }

      // 2. Fetch Donations
      const donationsRes = await fetch(`/api/compliance/80g?financialYear=${selectedFY}&limit=100`);
      if (donationsRes.ok) {
        const donJson = await donationsRes.json();
        setDonations(donJson.donations || []);
      }

      // 3. Fetch Filing Batches
      const filingsRes = await fetch(`/api/compliance/10bd/filings?financialYear=${selectedFY}`);
      if (filingsRes.ok) {
        const fJson = await filingsRes.json();
        setFilings(fJson.filings || []);
      }
    } catch (err: any) {
      showToast('Error loading compliance data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFY]);

  // Run 10BD Validation
  const handleRunValidation = async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/compliance/10bd/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialYear: selectedFY }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Validation failed');
      setValidationData(data);
      setShowValidationBanner(true);
      if (data.invalidCount === 0) {
        showToast(`All ${data.validCount} donations in FY ${selectedFY} are valid for Form 10BD!`, 'success');
      } else {
        showToast(`${data.invalidCount} donations have missing or invalid data for Form 10BD.`, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setValidating(false);
    }
  };

  // Quick Edit Donor Save
  const handleSaveDonorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDonation.id,
          donorName: editDonorName,
          donorEmail: editDonorEmail,
          donorPan: editDonorPan ? editDonorPan.toUpperCase().trim() : '',
          donorAddress: editDonorAddress,
          donorPincode: editDonorPincode,
          donationEligible80G: editEligible80G,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update donor');
      showToast('Donor tax & 80G details updated successfully!');
      setEditingDonation(null);
      fetchData();
      if (showValidationBanner) handleRunValidation();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/compliance/10bd/filings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialYear: selectedFY,
          batchName: batchName || `Form 10BD - FY ${selectedFY} - ${new Date().toLocaleDateString('en-IN')}`,
          notes: batchNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create batch');
      showToast(`Batch created with ${data.donationCount} donations!`);
      setIsCreateBatchOpen(false);
      setBatchName('');
      setBatchNotes('');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Filing Batch
  const handleUpdateFiling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilingForUpdate) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/compliance/10bd/filings/${selectedFilingForUpdate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: filingStatus,
          acknowledgementNumber: ackNumber,
          filingDate: filingDate,
          notes: filingNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update filing');
      showToast(`Filing batch updated. Associated donations marked as ${filingStatus}!`);
      setSelectedFilingForUpdate(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Upload Form 10BE PDF
  const handleUpload10BE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingForDonation || !tenBeFile) {
      showToast('Please select a valid Form 10BE PDF file', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', tenBeFile);
      formData.append('donationId', uploadingForDonation.id);
      formData.append('tenBeNumber', tenBeNumber);
      formData.append('issueDate', tenBeIssueDate);

      const res = await fetch('/api/compliance/10be/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload Form 10BE');

      showToast(`Form 10BE uploaded successfully for ${uploadingForDonation.donorName}!`);
      setUploadingForDonation(null);
      setTenBeFile(null);
      setTenBeNumber('');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Send single 10BE Email
  const handleSend10BEEmail = async (donation: DonationRecord) => {
    if (!donation.tenBePdfUrl) {
      showToast('Form 10BE PDF not yet uploaded for this donation', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/compliance/10be/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: donation.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send Form 10BE email');

      showToast(`Form 10BE successfully dispatched to ${donation.donorEmail}!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Start Bulk Email Dispatch
  const handleStartBulkEmail = async () => {
    setIsBulkEmailOpen(true);
    setBulkEmailProgress({ total: 0, sent: 0, failed: 0, inProgress: true, logs: ['Initiating bulk Form 10BE delivery...'] });
    try {
      const res = await fetch('/api/compliance/10be/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialYear: selectedFY }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk delivery failed');

      setBulkEmailProgress({
        total: data.total,
        sent: data.sent,
        failed: data.failed,
        inProgress: false,
        logs: [
          `Batch completed: ${data.sent} sent successfully, ${data.failed} failed.`,
          ...(data.results || []).map((r: any) => `${r.receiptNumber} (${r.donorEmail}): ${r.status}${r.error ? ' - ' + r.error : ''}`),
        ],
      });
      showToast(`Bulk dispatch completed: ${data.sent} sent, ${data.failed} failed.`);
      fetchData();
    } catch (err: any) {
      setBulkEmailProgress((prev) => ({
        ...prev,
        inProgress: false,
        logs: [...prev.logs, `Error: ${err.message}`],
      }));
      showToast(err.message, 'error');
    }
  };

  // Filtered donations based on search query
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const q = searchQuery.toLowerCase();
      const recId = (d.donationId || d.receiptNumber || '').toLowerCase();
      const matchSearch =
        recId.includes(q) ||
        (d.donorName || '').toLowerCase().includes(q) ||
        (d.donorEmail || '').toLowerCase().includes(q) ||
        (d.donorPan && d.donorPan.toLowerCase().includes(q)) ||
        (d.tenBeNumber && d.tenBeNumber.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeTab === '10be') {
        return d.tenBdStatus === 'FILED' || d.tenBeStatus === 'UPLOADED' || d.donationEligible80G;
      }
      return true;
    });
  }, [donations, searchQuery, activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
        >
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-navy-950 font-bold text-2xl sm:text-3xl">
            <ShieldCheck className="w-8 h-8 text-gold-600" />
            <h1>80G & 10BD Statutory Compliance</h1>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Section 80G tax exemption management, Form 10BD annual return preparation, and authentic Form 10BE distribution.
          </p>
        </div>

        {/* Controls: FY Selector & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold uppercase text-slate-500">FY:</span>
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="text-sm font-bold text-navy-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Financial Years</option>
              {availableFYs.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-navy-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statutory Guidance Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 text-amber-900 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-bold text-amber-950">Statutory Tax Compliance Rule:</span> Under Rule 18AB of the Income Tax Rules, 1962, donations eligible for deduction under Section 80G must be filed annually in <strong>Form 10BD</strong> on the Income Tax Portal on or before <strong>31st May</strong> following the financial year. After e-filing, the Income Tax Department issues <strong>Form 10BE</strong> certificates. Once downloaded, upload each Form 10BE here to deliver them securely to donors.
        </div>
      </div>

      {/* Real-Time Compliance KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total 80G */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total 80G</div>
          <div className="text-xl font-bold text-navy-900 mt-1">
            {formatCurrency(stats?.eligible80GAmount || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats?.eligible80GCount || 0} donations
          </div>
        </div>

        {/* 10BD Ready */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-800 uppercase flex items-center justify-between">
            <span>10BD Ready</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950 mt-1">
            {stats?.tenBdReadyCount || 0}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Valid PAN & Data</div>
        </div>

        {/* 10BD Incomplete */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-800 uppercase flex items-center justify-between">
            <span>Needs Info</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-950 mt-1">
            {stats?.tenBdHasIssuesCount || 0}
          </div>
          <div className="text-xs text-amber-700 mt-1">Missing PAN / Address</div>
        </div>

        {/* 10BD Filed */}
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-sm">
          <div className="text-xs font-semibold text-blue-800 uppercase flex items-center justify-between">
            <span>10BD Filed</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-950 mt-1">
            {stats?.tenBdFiledCount || 0}
          </div>
          <div className="text-xs text-blue-700 mt-1">Submitted in Batches</div>
        </div>

        {/* 10BE Uploaded */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 shadow-sm">
          <div className="text-xs font-semibold text-indigo-800 uppercase flex items-center justify-between">
            <span>10BE Uploaded</span>
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-950 mt-1">
            {stats?.tenBeUploadedCount || 0}
          </div>
          <div className="text-xs text-indigo-700 mt-1">
            {stats?.tenBePendingUploadCount || 0} pending upload
          </div>
        </div>

        {/* 10BE Dispatched */}
        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 shadow-sm">
          <div className="text-xs font-semibold text-purple-800 uppercase flex items-center justify-between">
            <span>10BE Emailed</span>
            <Mail className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-950 mt-1">
            {stats?.tenBeEmailSentCount || 0}
          </div>
          <div className="text-xs text-purple-700 mt-1">
            {stats?.tenBeEmailPendingCount || 0} pending email
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('preparation')}
            className={`py-3 px-1 border-b-2 text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'preparation'
                ? 'border-navy-900 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-navy-900 hover:border-slate-300 font-medium'
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            1. 10BD Preparation & Validation
            {(stats?.tenBdHasIssuesCount || 0) > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {stats?.tenBdHasIssuesCount} fixes
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('filings')}
            className={`py-3 px-1 border-b-2 text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'filings'
                ? 'border-navy-900 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-navy-900 hover:border-slate-300 font-medium'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            2. 10BD Filing Batches
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {filings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('10be')}
            className={`py-3 px-1 border-b-2 text-sm flex items-center gap-2 transition-colors ${
              activeTab === '10be'
                ? 'border-navy-900 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-navy-900 hover:border-slate-300 font-medium'
            }`}
          >
            <Send className="w-4 h-4 text-purple-600" />
            3. Official Form 10BE Distribution Hub
            {(stats?.tenBeEmailPendingCount || 0) > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {stats?.tenBeEmailPendingCount} ready to send
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Validation Result Drawer */}
      {showValidationBanner && validationData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-navy-950">
                Form 10BD Validation Report (FY {validationData.financialYear})
              </h3>
            </div>
            <button
              onClick={() => setShowValidationBanner(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase">Eligible 80G</div>
              <div className="text-xl font-bold text-navy-900">
                {validationData.totalEligible ?? validationData.summary?.totalDonations ?? donations.length}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-xs text-emerald-800 uppercase">Ready for IT Portal</div>
              <div className="text-xl font-bold text-emerald-950">
                {validationData.validCount ?? validationData.summary?.validCount ?? 0}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-xs text-amber-800 uppercase">Action Required</div>
              <div className="text-xl font-bold text-amber-950">
                {validationData.invalidCount ?? validationData.summary?.invalidCount ?? (validationData.errors?.length || validationData.issues?.length || 0)}
              </div>
            </div>
          </div>

          {(() => {
            const errorList = validationData.errors || validationData.issues || [];
            return errorList.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                <div className="text-xs font-semibold text-slate-600 uppercase mb-1">
                  Donations Requiring Correction:
                </div>
                {errorList.map((err) => {
                  const issuesList = err.issues || err.errors || [];
                  const recNo = err.receiptNumber || err.donationId || 'N/A';
                  return (
                    <div
                      key={err.donationId || err.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 text-xs gap-2"
                    >
                      <div>
                        <span className="font-bold text-navy-900">{recNo}</span> —{' '}
                        <span className="font-medium text-slate-800">{err.donorName}</span> ({formatCurrency(err.amount)})
                        <div className="text-red-700 font-medium mt-0.5 flex flex-wrap gap-1">
                          {issuesList.map((issue, idx) => (
                            <span key={idx} className="bg-red-100/80 px-2 py-0.5 rounded text-[11px]">
                              • {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const d = donations.find((item) => item.id === err.id || item.donationId === err.donationId || item.id === err.donationId) || (err as any);
                          setEditingDonation(d);
                          setEditDonorName(d.donorName || '');
                          setEditDonorEmail(d.donorEmail || '');
                          setEditDonorPan(d.donorPan || '');
                          setEditDonorAddress(d.donorAddress || '');
                          setEditDonorPincode(d.donorPincode || '');
                          setEditEligible80G(d.donationEligible80G ?? true);
                        }}
                        className="flex items-center gap-1.5 text-slate-800 hover:text-navy-950 font-semibold bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-xs flex-shrink-0 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fix Info</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>All records pass statutory Income Tax Form 10BD validation checks! You can safely export the filing CSV.</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 1: 10BD Preparation & Validation */}
      {activeTab === 'preparation' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by receipt, donor name, PAN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRunValidation}
                disabled={validating}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {validating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-primary-600" />
                )}
                <span>Run 10BD Validation</span>
              </button>

              <a
                href={`/api/compliance/10bd/export?financialYear=${selectedFY}`}
                download
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export 10BD CSV</span>
              </a>

              <button
                onClick={() => {
                  setBatchName(`Form 10BD - FY ${selectedFY} Batch ${filings.length + 1}`);
                  setIsCreateBatchOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Create Filing Batch</span>
              </button>
            </div>
          </div>

          {/* Table of Donations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Receipt / Date</th>
                    <th className="px-4 py-3">Donor Details</th>
                    <th className="px-4 py-3">PAN Number</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">80G Eligible</th>
                    <th className="px-4 py-3">10BD Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No donations found matching criteria for FY {selectedFY}.
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => {
                      const hasPan = Boolean(donation.donorPan && donation.donorPan.length === 10);
                      const hasAddress = Boolean(donation.donorAddress && donation.donorAddress.trim().length > 3);
                      const isReady = hasPan && hasAddress && donation.donationEligible80G;

                      return (
                        <tr key={donation.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <div className="text-navy-950 font-semibold">{donation.donationId || donation.receiptNumber}</div>
                            <div className="text-xs text-slate-400">{formatDate(donation.createdAt)}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{donation.donorName}</div>
                            <div className="text-xs text-slate-400">{donation.donorEmail}</div>
                            {donation.donorAddress ? (
                              <div className="text-[11px] text-slate-500 truncate max-w-xs" title={donation.donorAddress}>
                                {donation.donorAddress} {donation.donorPincode ? `(${donation.donorPincode})` : ''}
                              </div>
                            ) : (
                              <div className="text-[11px] text-amber-600 font-medium">No address provided</div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {donation.donorPan ? (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-navy-900 border border-slate-200">
                                {donation.donorPan}
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                Missing PAN
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 font-bold text-navy-900">
                            {formatCurrency(donation.amount)}
                          </td>

                          <td className="px-4 py-3">
                            {donation.donationEligible80G ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3" /> Eligible
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Non-80G</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {donation.tenBdStatus === 'FILED' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Filed
                              </span>
                            ) : donation.tenBdStatus === 'INCLUDED' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                In Batch
                              </span>
                            ) : isReady ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Incomplete
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingDonation(donation);
                                  setEditDonorName(donation.donorName || '');
                                  setEditDonorEmail(donation.donorEmail || '');
                                  setEditDonorPan(donation.donorPan || '');
                                  setEditDonorAddress(donation.donorAddress || '');
                                  setEditDonorPincode(donation.donorPincode || '');
                                  setEditEligible80G(donation.donationEligible80G);
                                }}
                                className="p-1.5 text-slate-500 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                                title="Edit Donor Tax Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={`/receipt/${donation.donationId || donation.receiptNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-500 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                                title="View 80G Receipt"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10BD Filing Batches */}
      {activeTab === 'filings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-navy-950">Form 10BD Filing Batches</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track submissions made to the Income Tax Department portal. Once submitted, update acknowledgement details here.
              </p>
            </div>
            <button
              onClick={() => {
                setBatchName(`Form 10BD - FY ${selectedFY} Batch ${filings.length + 1}`);
                setIsCreateBatchOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
              style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Create New Batch</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Batch Name / FY</th>
                  <th className="px-4 py-3">Donation Count</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ack Number / Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No filing batches recorded for FY {selectedFY}. Create a batch once ready to export.
                    </td>
                  </tr>
                ) : (
                  filings.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="text-navy-950 font-semibold">{batch.batchName}</div>
                        <div className="text-xs text-slate-400">FY {batch.financialYear} • Created {formatDate(batch.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {batch.donationCount} donations
                      </td>
                      <td className="px-4 py-3 font-bold text-navy-900">
                        {formatCurrency(batch.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${batch.status === 'ACCEPTED' || batch.status === 'FILED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : batch.status === 'EXPORTED'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {batch.acknowledgementNumber ? (
                          <div>
                            <div className="font-mono text-xs font-bold text-navy-950">{batch.acknowledgementNumber}</div>
                            <div className="text-xs text-slate-400">Filed on {batch.filingDate ? formatDate(batch.filingDate) : 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not yet filed</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/compliance/10bd/export?financialYear=${batch.financialYear}&batchId=${batch.id}`}
                            download
                            className="p-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                            title="Download Batch CSV"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              setSelectedFilingForUpdate(batch);
                              setFilingStatus(batch.status === 'DRAFT' ? 'FILED' : batch.status);
                              setAckNumber(batch.acknowledgementNumber || '');
                              setFilingDate(batch.filingDate ? new Date(batch.filingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
                              setFilingNotes(batch.notes || '');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded border border-primary-200 transition-colors"
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Form 10BE Distribution Hub */}
      {activeTab === '10be' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by receipt, donor, PAN, 10BE #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <button
              onClick={handleStartBulkEmail}
              disabled={actionLoading || (stats?.tenBeUploadedCount || 0) === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              style={{ backgroundColor: '#4338CA', color: '#ffffff' }}
            >
              <Mail className="w-4 h-4 text-amber-300" />
              <span>Bulk Send Form 10BE Emails</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Receipt / Donor</th>
                    <th className="px-4 py-3">PAN</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Form 10BE Certificate</th>
                    <th className="px-4 py-3">Email Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No 80G donations available for Form 10BE distribution.
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-navy-950">{donation.donorName}</div>
                          <div className="text-xs text-slate-400">{donation.donorEmail}</div>
                          <div className="text-xs font-mono text-slate-500">{donation.donationId || donation.receiptNumber}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-navy-900 border border-slate-200">
                            {donation.donorPan || 'N/A'}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-bold text-navy-900">
                          {formatCurrency(donation.amount)}
                        </td>

                        <td className="px-4 py-3">
                          {donation.tenBeStatus === 'UPLOADED' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Uploaded
                              </span>
                              {donation.tenBeNumber && (
                                <div className="text-[11px] font-mono text-slate-600 mt-1">
                                  Cert: {donation.tenBeNumber}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pending Upload
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {donation.tenBeEmailStatus === 'SENT' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                <Mail className="w-3 h-3 text-purple-600" /> Sent
                              </span>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {donation.tenBeEmailSentAt ? formatDate(donation.tenBeEmailSentAt) : ''}
                              </div>
                            </div>
                          ) : donation.tenBeEmailStatus === 'FAILED' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200" title={donation.tenBeEmailError}>
                              <AlertCircle className="w-3 h-3 text-red-600" /> Failed
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Not sent</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setUploadingForDonation(donation);
                                setTenBeNumber(donation.tenBeNumber || '');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                            >
                              {donation.tenBeStatus === 'UPLOADED' ? 'Re-upload' : 'Upload 10BE'}
                            </button>

                            {donation.tenBePdfUrl && (
                              <>
                                <a
                                  href={`/api/donations/${donation.id}/10be`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                  title="View Uploaded 10BE PDF"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>

                                <button
                                  onClick={() => handleSend10BEEmail(donation)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{donation.tenBeEmailStatus === 'SENT' ? 'Resend' : 'Send'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Quick Edit Donor Tax Details */}
      {editingDonation && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-950">
                Edit 80G Tax Details ({editingDonation.donationId || editingDonation.receiptNumber})
              </h3>
              <button onClick={() => setEditingDonation(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonorEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Full Name</label>
                <input
                  type="text"
                  required
                  value={editDonorName}
                  onChange={(e) => setEditDonorName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Email Address</label>
                <input
                  type="email"
                  required
                  value={editDonorEmail}
                  onChange={(e) => setEditDonorEmail(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permanent Account Number (PAN)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={editDonorPan}
                  onChange={(e) => setEditDonorPan(e.target.value.toUpperCase())}
                  className="w-full font-mono text-sm uppercase px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">Format: 5 uppercase letters, 4 digits, 1 uppercase letter.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address for Form 10BD</label>
                <textarea
                  rows={2}
                  value={editDonorAddress}
                  onChange={(e) => setEditDonorAddress(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editDonorPincode}
                    onChange={(e) => setEditDonorPincode(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editEligible80G}
                      onChange={(e) => setEditEligible80G(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-800">80G Eligible</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-xs"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 border border-slate-800"
                  style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create 10BD Filing Batch */}
      {isCreateBatchOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-950">Create 10BD Filing Batch</h3>
              <button onClick={() => setIsCreateBatchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year</label>
                <input
                  type="text"
                  disabled
                  value={`FY ${selectedFY}`}
                  className="w-full text-sm px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Name / Reference</label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Filing Remarks</label>
                <textarea
                  rows={3}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Optional internal notes on portal submission..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs leading-relaxed border border-blue-200">
                This will assemble all ready 80G donations for FY {selectedFY} into this batch for easy export and tracking.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-xs"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 border border-slate-800"
                  style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{actionLoading ? 'Creating...' : 'Create Batch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Update Filing Batch Status */}
      {selectedFilingForUpdate && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-950">Update Filing Batch Status</h3>
              <button onClick={() => setSelectedFilingForUpdate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFiling} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Status</label>
                <select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg font-semibold text-navy-900 focus:outline-none"
                >
                  <option value="EXPORTED">EXPORTED (Prepared for IT Portal)</option>
                  <option value="FILED">FILED (Submitted to Income Tax Portal)</option>
                  <option value="ACCEPTED">ACCEPTED (Portal Confirmed & Processed)</option>
                  <option value="REJECTED">REJECTED (Defect Notice Issued)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IT Portal Acknowledgement Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10BD-ACK-2026-987654"
                  value={ackNumber}
                  onChange={(e) => setAckNumber(e.target.value)}
                  className="w-full font-mono text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Filing</label>
                <input
                  type="date"
                  value={filingDate}
                  onChange={(e) => setFilingDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Filing Notes</label>
                <textarea
                  rows={2}
                  value={filingNotes}
                  onChange={(e) => setFilingNotes(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs leading-relaxed border border-emerald-200">
                Marking this batch as <strong>FILED</strong> or <strong>ACCEPTED</strong> will automatically mark all {selectedFilingForUpdate.donationCount} donations in this batch as Filed, unlocking Form 10BE distribution.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFilingForUpdate(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-xs"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 border border-slate-800"
                  style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{actionLoading ? 'Updating...' : 'Save Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Upload Official Form 10BE PDF */}
      {uploadingForDonation && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-950">
                Upload Official Form 10BE
              </h3>
              <button onClick={() => setUploadingForDonation(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
              <div><strong>Donor:</strong> {uploadingForDonation.donorName}</div>
              <div><strong>Receipt:</strong> {uploadingForDonation.donationId || uploadingForDonation.receiptNumber}</div>
              <div><strong>Amount:</strong> {formatCurrency(uploadingForDonation.amount)}</div>
              <div><strong>PAN:</strong> {uploadingForDonation.donorPan || 'N/A'}</div>
            </div>

            <form onSubmit={handleUpload10BE} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Official 10BE PDF from Income Tax Portal
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setTenBeFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Form 10BE Certificate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10BE/2026/00123"
                  value={tenBeNumber}
                  onChange={(e) => setTenBeNumber(e.target.value)}
                  className="w-full font-mono text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Date (from Portal)
                </label>
                <input
                  type="date"
                  value={tenBeIssueDate}
                  onChange={(e) => setTenBeIssueDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadingForDonation(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-xs"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 border border-slate-800"
                  style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{actionLoading ? 'Uploading...' : 'Upload & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Bulk Email Dispatch Modal */}
      {isBulkEmailOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Bulk Form 10BE Delivery
              </h3>
              {!bulkEmailProgress.inProgress && (
                <button onClick={() => setIsBulkEmailOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {bulkEmailProgress.inProgress ? (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl text-indigo-900 border border-indigo-200">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-bold">Sending Form 10BE Certificates...</div>
                    <div className="text-xs text-indigo-700 mt-0.5">Please keep this window open while emails are dispatched.</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-200">
                    <div className="text-xs text-emerald-800 uppercase font-semibold">Sent Successfully</div>
                    <div className="text-2xl font-bold mt-1">{bulkEmailProgress.sent}</div>
                  </div>
                  <div className="p-3 bg-red-50 text-red-950 rounded-lg border border-red-200">
                    <div className="text-xs text-red-800 uppercase font-semibold">Failed / Skipped</div>
                    <div className="text-2xl font-bold mt-1">{bulkEmailProgress.failed}</div>
                  </div>
                </div>
              )}

              {/* Logs */}
              <div className="bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-lg max-h-48 overflow-y-auto space-y-1">
                {bulkEmailProgress.logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={bulkEmailProgress.inProgress}
                onClick={() => setIsBulkEmailOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50 border border-slate-800"
                style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
