'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  X,
  FileCheck,
  ShieldCheck,
  QrCode,
  Building,
  Mail,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import Section80GCertificate from '@/components/common/Section80GCertificate';
import { useToast } from '@/components/common/Toast';

/**
 * Number to Words converter for Indian Rupees (INR)
 */
function numberToWordsINR(amount: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  const num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred) res += ones[hundred] + ' Hundred';
    if (rest) res += (res ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const parts: string[] = [];
  if (crore) parts.push(convertTwoDigits(crore) + ' Crore');
  if (lakh) parts.push(convertTwoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(convertTwoDigits(thousand) + ' Thousand');
  if (remainder) parts.push(convertThreeDigits(remainder));

  return parts.join(' ') + ' Rupees Only';
}

export default function AdminDonationsPage() {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [causeTypeFilter, setCauseTypeFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  // Edit & Delete states
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [printingDonation, setPrintingDonation] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorPan: '',
    donorAddress: '',
    donorPincode: '',
    financialYear: '',
    donationEligible80G: true,
    amount: '',
    status: 'SUCCESS',
    paymentMethod: 'ONLINE',
    projectTitle: '',
    type: 'ONE_TIME',
  });

  // Trust metadata for official preview
  const [trustMeta, setTrustMeta] = useState({
    name: 'NIPANIA VIKASH SEVA TRUST',
    pan: 'AAFTN4004N',
    reg80gNo: 'AAFTN4004NF20214',
    reg12aNo: 'AAFTN4004NE20203',
    darpanId: 'UP/2021/0295112',
    registeredAddress: 'Nipania, P.O. Pargha, P.S. Baliapur, District Dhanbad, Jharkhand – 828201',
    email: 'info@nipaniatrust.org',
    website: 'https://nipaniatrust.org',
    presidentName: 'Managing Trustee',
    presidentTitle: 'President / Managing Trustee',
    presidentSignature: '/uploads/1788689904046-pancard_signature_nsdl_1784122650967-Photoroom.png',
    presidentStamp: '/uploads/1788697970579-Gemini_Generated_Image_tkp7z7tkp7z7tkp7.png',
  });

  const fetchDonations = () => {
    setLoading(true);
    let url = `/api/donations?status=${statusFilter}`;
    if (causeTypeFilter !== 'ALL') url += `&causeType=${causeTypeFilter}`;
    if (frequencyFilter !== 'ALL') url += `&type=${frequencyFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.donations) {
          setDonations(data.donations);
          showInfo(`Loaded ${data.donations.length} donation(s)`);
        }
      })
      .catch((err) => {
        console.error('Failed to load donations:', err);
        showError('Failed to load donations. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, causeTypeFilter, frequencyFilter]);

  useEffect(() => {

    // Fetch active trust settings to obtain latest uploaded signature & seal
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTrustMeta((prev) => ({
            ...prev,
            name: data.settings.name || prev.name,
            pan: data.settings.pan || prev.pan,
            reg80gNo: data.settings.reg80gNo || prev.reg80gNo,
            reg12aNo: data.settings.reg12aNo || prev.reg12aNo,
            darpanId: data.settings.darpanId || prev.darpanId,
            registeredAddress: data.settings.registeredAddress || prev.registeredAddress,
            presidentName: data.settings.presidentName || prev.presidentName,
            presidentTitle: data.settings.presidentTitle || prev.presidentTitle,
            presidentSignature: data.settings.presidentSignature || prev.presidentSignature,
            presidentStamp: data.settings.presidentStamp || prev.presidentStamp,
          }));
        }
      })
      .catch((err) => console.warn('Could not load trust settings:', err));
  }, [statusFilter]);

  const handleExportCSV = () => {
    if (donations.length === 0) {
      showError('No donations to export');
      return;
    }
    
    showInfo('Preparing CSV export...');
    
    const headers = [
      'Donation ID',
      'Date',
      'Donor Name',
      'Email',
      'Phone',
      'PAN',
      'Amount (INR)',
      'Type',
      'Project / Purpose',
      'Payment Method',
      'Payment ID',
      'Status',
    ];
    const rows = donations.map((d) => [
      d.donationId,
      formatDate(d.createdAt),
      `"${d.donorName}"`,
      d.donorEmail,
      d.donorPhone,
      d.donorPan || '-',
      d.amount,
      d.type,
      `"${d.projectTitle || 'General Welfare'}"`,
      d.paymentMethod || 'ONLINE',
      d.paymentId || '-',
      d.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess(`Exported ${donations.length} donations to CSV`);
  };

  /**
   * Directly triggers native print dialog in admin panel without opening any new tab
   */
  const handlePrintReceipt = (donation: any) => {
    setPrintingDonation(donation);
    showInfo('Opening print dialog...');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleOpenEdit = (donation: any) => {
    setEditingDonation(donation);
    setEditForm({
      donorName: donation.donorName || '',
      donorEmail: donation.donorEmail || '',
      donorPhone: donation.donorPhone || '',
      donorPan: donation.donorPan || '',
      donorAddress: donation.donorAddress || '',
      donorPincode: donation.donorPincode || '',
      financialYear: donation.financialYear || '',
      donationEligible80G: donation.donationEligible80G ?? true,
      amount: String(donation.amount || ''),
      status: donation.status || 'SUCCESS',
      paymentMethod: donation.paymentMethod || 'ONLINE',
      projectTitle: donation.projectTitle || '',
      type: donation.type || 'ONE_TIME',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;
    const parsedAmount = parseFloat(editForm.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showError('Please enter a valid donation amount.');
      return;
    }

    setIsSavingEdit(true);
    showInfo('Saving donation changes...');
    
    try {
      const res = await fetch('/api/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDonation.id,
          donationId: editingDonation.donationId,
          ...editForm,
          amount: parsedAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update donation record.');
      }

      showSuccess(`Donation ${editingDonation.donationId} updated successfully!`);
      setActionFeedback({
        type: 'success',
        message: `Donation ${editingDonation.donationId} (${editForm.donorName}) updated successfully!`,
      });
      setIsEditModalOpen(false);
      setEditingDonation(null);
      fetchDonations();
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      const msg = err.message || 'Failed to update donation.';
      showError(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteDonation = async (donation: any) => {
    const confirmMsg = `Are you sure you want to delete donation ${donation.donationId} (${donation.donorName}, ₹${donation.amount})?\n\nThis will remove the donation record from the database.`;
    if (!window.confirm(confirmMsg)) return;

    setIsDeletingId(donation.id);
    showInfo('Deleting donation record...');
    
    try {
      const res = await fetch(`/api/donations?id=${donation.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete donation record.');
      }

      showSuccess(`Donation ${donation.donationId} deleted successfully.`);
      setActionFeedback({
        type: 'success',
        message: `Donation ${donation.donationId} deleted successfully.`,
      });
      setDonations((prev) => prev.filter((d) => d.id !== donation.id));
      if (selectedDonation?.id === donation.id) {
        setSelectedDonation(null);
      }
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      const msg = err.message || 'Failed to delete donation record.';
      showError(msg);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <>
      <div className="no-print space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 text-gold-600" />
            <span>Contributions & 80G Certificates</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Donations Management
          </h1>
          <p className="text-xs text-slate-500">
            Track all online and offline community contributions, generate official signed Section 80G PDF receipts, and export records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/compliance/80g"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-50 text-primary-800 hover:bg-primary-100 border border-primary-200 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            <span>80G / 10BD Compliance Hub</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-gold-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDonations();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, donor name, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Cause Type:</span>
            <select
              value={causeTypeFilter}
              onChange={(e) => setCauseTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 font-medium"
            >
              <option value="ALL">All Causes & Drives</option>
              <option value="SPONSORSHIP">🤝 Sponsorships Only</option>
              <option value="CAMPAIGN">🌟 Campaigns Only</option>
              <option value="GENERAL">General Welfare Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Type:</span>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="MONTHLY">🔄 Monthly e-Mandates</option>
              <option value="ONE_TIME">One-Time Donations</option>
            </select>
          </div>

          <button
            onClick={fetchDonations}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Feedback Notification */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-md text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table - Fully optimized to fit screen with all buttons */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-3 w-[115px]">Receipt ID</th>
                <th className="py-4 px-2 w-[85px]">Date</th>
                <th className="py-4 px-3 w-[135px]">Donor</th>
                <th className="py-4 px-2 w-[125px]">Contact</th>
                <th className="py-4 px-2 w-[90px]">PAN</th>
                <th className="py-4 px-2 w-[120px]">Amount</th>
                <th className="py-4 px-3 w-[165px]">Initiative</th>
                <th className="py-4 px-2 w-[75px]">Status</th>
                <th className="py-4 px-2 text-center w-[270px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No donation records found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-3 font-mono font-bold text-navy-950 text-[11px] whitespace-nowrap">
                      {d.donationId}
                    </td>
                    <td className="py-4 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="py-4 px-3 font-bold text-navy-900 text-xs">
                      <div className="truncate max-w-[140px]" title={d.donorName}>
                        {d.donorName}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-[11px] text-slate-500">
                      <div className="whitespace-nowrap truncate max-w-[130px]" title={d.donorPhone}>
                        {d.donorPhone}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={d.donorEmail}>
                        {d.donorEmail}
                      </div>
                    </td>
                    <td className="py-4 px-2 font-mono font-bold text-slate-700 text-[11px] whitespace-nowrap">
                      <div>{d.donorPan || '-'}</div>
                      <div className="flex flex-wrap gap-1 mt-1 font-sans">
                        {d.tenBdStatus === 'FILED' ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200" title="Included in filed Form 10BD return">
                            10BD Filed
                          </span>
                        ) : d.donorPan && d.donorAddress ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Valid PAN & address for Form 10BD">
                            10BD Ready
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Missing PAN or address">
                            10BD Incomplete
                          </span>
                        )}
                        {d.tenBeStatus === 'UPLOADED' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800 border border-purple-200" title="Form 10BE Certificate available">
                            10BE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                      <div>
                        {formatCurrency(d.amount)}
                        {d.type === 'MONTHLY' && <span className="text-xs font-semibold text-slate-500">/mo</span>}
                      </div>
                      {d.type === 'MONTHLY' ? (
                        <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm border border-blue-400/30">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Recurring</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block font-normal mt-1">
                          One-Time
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <div className="max-w-[165px]">
                        {d.projectTitle?.includes('Sponsor') ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
                              🤝 Sponsor
                            </span>
                            <div className="font-bold text-navy-950 text-[11px] truncate" title={d.projectTitle}>
                              {d.projectTitle.replace(/^Sponsorship:\s*/i, '')}
                            </div>
                          </div>
                        ) : d.projectTitle && !d.projectTitle.toLowerCase().includes('general') ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                              🌟 Campaign
                            </span>
                            <div className="font-bold text-navy-950 text-[11px] truncate" title={d.projectTitle}>
                              {d.projectTitle}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 truncate">
                            {d.projectTitle || 'General Fund'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="inline-flex items-center justify-center p-2 text-navy-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          title="Preview 80G Receipt"
                        >
                          <Eye className="w-4 h-4 text-gold-600" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(d)}
                          className="inline-flex items-center justify-center p-2 bg-navy-900 text-white hover:bg-navy-800 rounded-lg shadow-sm transition-colors"
                          title="Print 80G Receipt"
                        >
                          <Printer className="w-4 h-4 text-gold-400" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="inline-flex items-center justify-center p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          title="Edit Donation"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteDonation(d)}
                          disabled={isDeletingId === d.id}
                          className="inline-flex items-center justify-center p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Donation"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
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

      {/* Formal Section 80G Tax Exemption Certificate Modal */}
      {selectedDonation && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#FCFBF8] rounded-2xl shadow-2xl border-2 border-gold-500/80 my-auto max-h-[96vh] overflow-y-auto admin-modal-scroll animate-in zoom-in-95 duration-200">
            {/* Modal Controls Bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-navy-950 text-white border-b border-gold-400/40">
              <span className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                <span>Section 80G Official Certificate Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintReceipt(selectedDonation)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <a
                  href={`/api/donations/${selectedDonation.donationId}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white border border-navy-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formal Certificate Document Body */}
            <div className="p-6 sm:p-10 space-y-6">
              {/* Outer Decorative Certificate Border */}
              <div className="border-2 border-navy-950 p-6 sm:p-8 bg-white relative space-y-6 shadow-sm">
                <div className="absolute inset-1 border border-gold-500/50 pointer-events-none" />

                {/* Letterhead Header */}
                <div className="text-center pb-5 border-b-2 border-navy-950 space-y-1 relative">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 p-1 border border-gold-400 bg-white shadow-xs">
                    <Image src="/logo.png" alt="Trust Logo" fill className="object-contain" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-navy-950 font-serif">
                    {trustMeta.name}
                  </h2>
                  <p className="text-[11px] font-semibold text-gold-800 uppercase tracking-wider">
                    A Registered Public Charitable Trust under the Indian Trusts Act, 1882
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono pt-1">
                    PAN: <strong className="text-navy-950">{trustMeta.pan}</strong> &nbsp;|&nbsp; 
                    80G Unique Reg No: <strong className="text-navy-950">{trustMeta.reg80gNo}</strong> &nbsp;|&nbsp; 
                    12A Reg No: <strong className="text-navy-950">{trustMeta.reg12aNo}</strong> &nbsp;|&nbsp; 
                    NGO Darpan ID: <strong className="text-navy-950">{trustMeta.darpanId}</strong>
                  </p>
                  <p className="text-[9.5px] text-slate-500">
                    Registered Office: {trustMeta.registeredAddress} &nbsp;|&nbsp; Email: {trustMeta.email}
                  </p>
                </div>

                {/* Formal Certificate Heading */}
                <div className="text-center py-2 bg-navy-950 text-white rounded-md space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold-300">
                    DONATION RECEIPT & SECTION 80G TAX EXEMPTION CERTIFICATE
                  </h3>
                  <p className="text-[9.5px] text-slate-300">
                    Issued under Section 80G(5)(vi) of the Income Tax Act, 1961 • Eligible for 50% Tax Exemption
                  </p>
                </div>

                {/* Structured Formal Voucher Table */}
                <div className="border border-slate-300 text-xs font-medium divide-y divide-slate-200">
                  {/* Row 1: Sl No, Date, Payment Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/70">
                    <div className="p-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Receipt Number:</span>
                      <span className="font-mono font-black text-navy-950 text-sm">{selectedDonation.donationId}</span>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Date of Issue:</span>
                      <span className="font-bold text-navy-950">{formatDate(selectedDonation.createdAt)}</span>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Mode:</span>
                      <span className="font-bold text-navy-950">{selectedDonation.paymentMethod || 'ONLINE'}</span>
                    </div>
                  </div>

                  {/* Row 2: Received with thanks from */}
                  <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Received with thanks from:</span>
                      <strong className="text-base text-navy-950 font-serif font-black uppercase tracking-wide">
                        {selectedDonation.donorName}
                      </strong>
                    </div>
                    <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Donor PAN (Form 10BE):</span>
                      <strong className="font-mono text-gold-900 font-black text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        {selectedDonation.donorPan || 'Not Provided / Form 60'}
                      </strong>
                    </div>
                  </div>

                  {/* Row 3: Donor Contact & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 p-2.5 bg-slate-50/40 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Donor Contact:</span>
                      <span className="text-slate-800">{selectedDonation.donorPhone} &bull; {selectedDonation.donorEmail}</span>
                    </div>
                    <div className="pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Address:</span>
                      <span className="text-slate-700">{selectedDonation.donorAddress || 'Nipania, Balrampur, Uttar Pradesh'}</span>
                    </div>
                  </div>

                  {/* Row 4: Sum of Rupees */}
                  <div className="p-3 bg-emerald-50/40 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">The Sum of Rupees:</span>
                      <strong className="text-lg font-mono font-black text-emerald-800">
                        {formatCurrency(selectedDonation.amount)}
                      </strong>
                    </div>
                    <p className="text-xs text-navy-950 font-serif italic">
                      ({numberToWordsINR(selectedDonation.amount)})
                    </p>
                  </div>

                  {/* Row 5: On account of / Purpose & Txn Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 p-2.5 bg-white text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Towards Designated Purpose:</span>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {selectedDonation.projectTitle?.includes('Sponsor') ? (
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-black border border-teal-300">
                            🤝 CAUSE SPONSORSHIP
                          </span>
                        ) : selectedDonation.projectTitle && !selectedDonation.projectTitle.toLowerCase().includes('general') ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                            🌟 CAMPAIGN
                          </span>
                        ) : null}
                        <strong className="text-navy-950 font-bold text-xs">{selectedDonation.projectTitle || 'General Social Welfare Fund'}</strong>
                      </div>
                    </div>
                    <div className="pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Transaction Reference / UTR ID:</span>
                      <span className="font-mono text-slate-800 font-bold">{selectedDonation.paymentId || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Statutory 80G Declaration */}
                <div className="p-3 bg-amber-50/70 border-l-4 border-gold-500 text-[10.5px] text-amber-950 leading-relaxed font-sans">
                  <strong>Statutory Declaration:</strong> Certified that this contribution has been voluntarily received towards the charitable objects of Nipania Vikash Seva Trust. This donation is eligible for 50% deduction from taxable income under Section 80G of the Income Tax Act, 1961. No commercial consideration, goods, or services were provided in return.
                </div>

                {/* Formal Signature & Verification Area (NO SEAL) */}
                <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Left: Verification QR Code */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white p-1 border border-slate-300 shadow-xs flex items-center justify-center">
                      <QrCode className="w-14 h-14 text-navy-950" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-navy-950 block tracking-wider">
                        SCAN TO VERIFY
                      </span>
                      <span className="text-[9px] text-slate-500 block leading-tight max-w-[140px]">
                        Scan with any smartphone camera to verify this certificate on trust portal.
                      </span>
                    </div>
                  </div>

                  {/* Right: President / Authorized Signatory Signature (NO SEAL) */}
                  <div className="text-center sm:text-right min-w-[180px]">
                    <div className="h-14 w-36 relative mx-auto sm:ml-auto flex items-center justify-center sm:justify-end">
                      {trustMeta.presidentSignature ? (
                        <img
                          src={trustMeta.presidentSignature}
                          alt="Authorized Signatory"
                          className="max-h-full max-w-full object-contain filter contrast-125"
                        />
                      ) : (
                        <span className="font-serif italic text-gold-800 text-sm">Managing Trustee</span>
                      )}
                    </div>
                    <div className="w-40 h-0.5 bg-navy-950 my-1 mx-auto sm:ml-auto" />
                    <strong className="text-xs font-bold text-navy-950 uppercase block font-serif">
                      {trustMeta.presidentName}
                    </strong>
                    <span className="text-[10px] text-slate-600 font-semibold block">
                      {trustMeta.presidentTitle}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                      Nipania Vikash Seva Trust
                    </span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-center pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-mono">
                  This is a certified digital Section 80G Tax Exemption Certificate issued by Nipania Vikash Seva Trust Portal.
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Status: <span className="font-bold text-emerald-700">Validated & Issued</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(selectedDonation)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md border border-slate-800 transition-colors"
                    style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Official Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs"
                    style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Donation Record Modal */}
      {isEditModalOpen && editingDonation && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-navy-950 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-gold-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Edit Donation Record — <span className="font-mono text-gold-300">{editingDonation.donationId}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDonation(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 min-h-0 flex-1 overflow-y-auto admin-modal-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Donor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.donorName}
                    onChange={(e) => setEditForm({ ...editForm, donorName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.donorEmail}
                    onChange={(e) => setEditForm({ ...editForm, donorEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.donorPhone}
                    onChange={(e) => setEditForm({ ...editForm, donorPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PAN Card (For 80G Tax Exemption)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={editForm.donorPan}
                    onChange={(e) => setEditForm({ ...editForm, donorPan: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Donation Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-bold text-navy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Donation Status *
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden bg-white font-semibold"
                  >
                    <option value="SUCCESS">SUCCESS (Active & Receipt Valid)</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden bg-white"
                  >
                    <option value="ONLINE">Online (Razorpay / UPI)</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS</option>
                    <option value="CASH">Cash Donation</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contribution Frequency
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden bg-white"
                  >
                    <option value="ONE_TIME">One-Time Contribution</option>
                    <option value="MONTHLY">Monthly Recurring Sponsorship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initiative / Cause / Campaign Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Feed the Hungry, Girl Child Education, General Welfare..."
                  value={editForm.projectTitle}
                  onChange={(e) => setEditForm({ ...editForm, projectTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal Address
                  </label>
                  <input
                    type="text"
                    placeholder="Donor correspondence address for official records"
                    value={editForm.donorAddress}
                    onChange={(e) => setEditForm({ ...editForm, donorAddress: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 271201"
                    value={editForm.donorPincode}
                    onChange={(e) => setEditForm({ ...editForm, donorPincode: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Financial Year (Indian FY)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2025-26"
                    value={editForm.financialYear}
                    onChange={(e) => setEditForm({ ...editForm, financialYear: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-bold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.donationEligible80G}
                      onChange={(e) => setEditForm({ ...editForm, donationEligible80G: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800">Eligible for Section 80G Tax Exemption</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingDonation(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 shadow-md border border-slate-800 transition-colors"
                  style={{ backgroundColor: '#0B192C', color: '#ffffff' }}
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Save Donation Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Native Direct Print Section 80G Certificate for Admin Panel */}
      {(printingDonation || selectedDonation) && (
        <div className="receipt-print-area hidden print:block">
          <Section80GCertificate
            donation={printingDonation || selectedDonation}
            trustMeta={trustMeta}
          />
        </div>
      )}
    </>
  );
}
