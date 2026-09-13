'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  Search,
  Plus,
  Eye,
  Download,
  Mail,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X,
  Copy,
  Check,
  Loader2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Printer,
  CheckSquare,
  Square,
  Users,
  UserCheck,
  Send,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import CertificateRenderer, { CertificateData } from '@/components/certificates/CertificateRenderer';
import BulkCertificatePrint from '@/components/certificates/BulkCertificatePrint';
import Swal from 'sweetalert2';

const CERTIFICATE_TYPES = [
  { value: 'VOLUNTEER_SERVICE', label: 'Certificate of Volunteer Service', defaultCitation: 'In recognition of outstanding dedication, exemplary field service, and valuable voluntary contributions towards the welfare initiatives of the Trust.' },
  { value: 'VOLUNTEER_APPRECIATION', label: 'Certificate of Volunteer Appreciation', defaultCitation: 'In sincere appreciation of valuable assistance, selfless commitment, and grassroots support rendered to community relief and outreach activities.' },
  { value: 'EVENT_PARTICIPATION', label: 'Certificate of Event Participation', defaultCitation: 'In recognition of active participation and community engagement in the program organized by the Trust.' },
  { value: 'TRAINING_WORKSHOP', label: 'Certificate of Training & Workshop', defaultCitation: 'For successful participation and completion of the community training and capacity-building workshop conducted by the Trust.' },
  { value: 'PROJECT_PARTICIPATION', label: 'Certificate of Project Participation', defaultCitation: 'In recognition of meaningful contribution and field participation in social impact project execution.' },
  { value: 'SPECIAL_CONTRIBUTION', label: 'Certificate of Special Recognition', defaultCitation: 'In gratitude for extraordinary social commitment, civic leadership, and exemplary humanitarian contribution.' },
  { value: 'INTERNSHIP', label: 'Certificate of Field Internship', defaultCitation: 'For exemplary performance, social dedication, and successful completion of the community welfare internship program.' },
];

export default function AdminCertificatesPage() {
  const searchParams = useSearchParams();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Print & Selection state
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // Bulk Email state
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);
  const [bulkEmailResults, setBulkEmailResults] = useState<{
    total: number;
    sentCount: number;
    failedCount: number;
    skippedCount: number;
    results: any[];
  } | null>(null);

  // Registered Volunteers list for quick select & batch generation
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [createModalTab, setCreateModalTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [selectedBatchVolunteerIds, setSelectedBatchVolunteerIds] = useState<string[]>([]);
  const [batchVolunteerSearch, setBatchVolunteerSearch] = useState('');
  const [batchDirectEmail, setBatchDirectEmail] = useState(false);

  // Modals state
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [revokeModalData, setRevokeModalData] = useState<{ id: string; number: string; name: string } | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for creation
  const [createForm, setCreateForm] = useState({
    certificateType: 'VOLUNTEER_SERVICE',
    title: 'Certificate of Volunteer Service',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    volunteerId: '',
    description: CERTIFICATE_TYPES[0].defaultCitation,
    signatoryName: 'Raj Kumar Mahato',
    signatoryTitle: 'President & Managing Trustee',
    issueDate: new Date().toISOString().split('T')[0],
    directIssue: true,
  });

  const fetchCertificates = () => {
    setLoading(true);
    let url = `/api/certificates?status=${statusFilter}`;
    if (typeFilter !== 'ALL') url += `&type=${typeFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.certificates) setCertificates(data.certificates);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, typeFilter]);

  // Handle URL query parameters for quick issue from Volunteer drawer
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      const name = searchParams.get('name') || '';
      const email = searchParams.get('email') || '';
      const volunteerId = searchParams.get('volunteerId') || '';
      setCreateForm((prev) => ({
        ...prev,
        recipientName: name,
        recipientEmail: email,
        volunteerId: volunteerId,
      }));
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleTypeChange = (typeVal: string) => {
    const selected = CERTIFICATE_TYPES.find((t) => t.value === typeVal);
    setCreateForm((prev) => ({
      ...prev,
      certificateType: typeVal,
      title: selected?.label || prev.title,
      description: selected?.defaultCitation || prev.description,
    }));
  };

  useEffect(() => {
    fetch('/api/volunteers')
      .then((res) => res.json())
      .then((data) => {
        if (data.volunteers) {
          setVolunteers(data.volunteers);
        }
      })
      .catch((err) => console.error('Error fetching volunteers for certificate picker:', err));
  }, []);

  const handleVolunteerSelect = (volId: string) => {
    if (!volId) {
      setCreateForm((prev) => ({
        ...prev,
        volunteerId: '',
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
      }));
      return;
    }
    const vol = volunteers.find((v) => v.id === volId);
    if (vol) {
      setCreateForm((prev) => ({
        ...prev,
        volunteerId: vol.id,
        recipientName: vol.fullName,
        recipientEmail: vol.email || '',
        recipientPhone: vol.mobile || '',
      }));
    }
  };

  const handleBatchCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatchVolunteerIds.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please select at least one volunteer to issue certificates.' });
      return;
    }
    setActionLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerIds: selectedBatchVolunteerIds,
          certificateType: createForm.certificateType,
          title: createForm.title,
          description: createForm.description,
          signatoryName: createForm.signatoryName,
          signatoryTitle: createForm.signatoryTitle,
          issueDate: createForm.issueDate,
          status: createForm.directIssue ? 'ISSUED' : 'DRAFT',
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsCreateModalOpen(false);
        const count = data.count || selectedBatchVolunteerIds.length;
        setSelectedBatchVolunteerIds([]);
        fetchCertificates();

        if (batchDirectEmail && data.certificates && data.certificates.length > 0) {
          const newCertIds = data.certificates.map((c: any) => c.id);
          setStatusMsg({ type: 'success', text: `Generated ${count} certificates! Dispatching emails now...` });

          fetch('/api/certificates/bulk-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: newCertIds }),
          })
            .then((r) => r.json())
            .then((emailData) => {
              if (emailData.success) {
                setStatusMsg({
                  type: 'success',
                  text: `Generated ${count} certificates and emailed ${emailData.sentCount} recipients successfully!`,
                });
              }
            })
            .catch((e) => console.error('Bulk email dispatch error:', e));
        } else {
          setStatusMsg({ type: 'success', text: `Successfully generated ${count} certificates for selected volunteers!` });
        }
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to create batch certificates' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error occurred during batch generation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerBulkEmail = async () => {
    if (selectedCertIds.length === 0) return;

    const count = selectedCertIds.length;
    const confirmRes = await Swal.fire({
      title: 'Send Bulk Certificate Emails?',
      html: `
        <div class="text-left text-xs space-y-2 mt-2">
          <p class="text-slate-600">You are about to dispatch official certificate emails with A4 PDF attachments to <b>${count} recipient${count > 1 ? 's' : ''}</b>.</p>
          <p class="text-slate-500">Recipients without a valid email address will be automatically skipped.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, Send ${count} Certificate${count > 1 ? 's' : ''}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0C234C',
      cancelButtonColor: '#94A3B8',
      reverseButtons: true,
    });

    if (!confirmRes.isConfirmed) return;

    setBulkEmailLoading(true);
    setBulkEmailResults(null);

    Swal.fire({
      title: 'Dispatching Bulk Certificate Emails...',
      html: `
        <div class="py-2 text-xs text-slate-600 space-y-2">
          <p>Generating personalized A4 PDF certificates and delivering via SMTP...</p>
          <div class="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 font-semibold font-mono">
            Processing ${count} certificate${count > 1 ? 's' : ''}...
          </div>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch('/api/certificates/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCertIds }),
      });
      const data = await res.json();

      if (res.ok) {
        setBulkEmailResults(data);
        setStatusMsg({
          type: 'success',
          text: `Bulk email completed: ${data.sentCount} sent, ${data.skippedCount} skipped, ${data.failedCount} failed.`,
        });
        fetchCertificates();

        await Swal.fire({
          icon: 'success',
          title: 'Bulk Email Completed!',
          html: `
            <div class="space-y-3 text-xs mt-2">
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div class="text-[10px] text-emerald-800 uppercase font-bold">Delivered</div>
                  <div class="text-xl font-black text-emerald-700 font-mono">${data.sentCount}</div>
                </div>
                <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div class="text-[10px] text-amber-800 uppercase font-bold">Skipped</div>
                  <div class="text-xl font-black text-amber-700 font-mono">${data.skippedCount}</div>
                </div>
                <div class="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <div class="text-[10px] text-rose-800 uppercase font-bold">Failed</div>
                  <div class="text-xl font-black text-rose-700 font-mono">${data.failedCount}</div>
                </div>
              </div>
            </div>
          `,
          confirmButtonColor: '#0C234C',
        });
      } else {
        const errorMsg = data.error || 'Failed to dispatch bulk certificate emails';
        setStatusMsg({ type: 'error', text: errorMsg });
        await Swal.fire({
          icon: 'error',
          title: 'Bulk Dispatch Failed',
          text: errorMsg,
          confirmButtonColor: '#0C234C',
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error occurred while sending bulk emails';
      setStatusMsg({ type: 'error', text: errorMsg });
      await Swal.fire({
        icon: 'error',
        title: 'Dispatch Error',
        text: errorMsg,
        confirmButtonColor: '#0C234C',
      });
    } finally {
      setBulkEmailLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          status: createForm.directIssue ? 'ISSUED' : 'DRAFT',
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsCreateModalOpen(false);
        setStatusMsg({ type: 'success', text: `Certificate ${data.certificate.certificateNumber} generated successfully!` });
        fetchCertificates();
        setCreateForm({
          certificateType: 'VOLUNTEER_SERVICE',
          title: 'Certificate of Volunteer Service',
          recipientName: '',
          recipientEmail: '',
          recipientPhone: '',
          volunteerId: '',
          description: CERTIFICATE_TYPES[0].defaultCitation,
          signatoryName: 'Raj Kumar Mahato',
          signatoryTitle: 'President & Managing Trustee',
          issueDate: new Date().toISOString().split('T')[0],
          directIssue: true,
        });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to create certificate' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error occurred' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueDraft = async (cert: CertificateData) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${cert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ISSUED' }),
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Certificate ${cert.certificateNumber} is now officially ISSUED!` });
        fetchCertificates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeModalData || !revocationReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/certificates/${revokeModalData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REVOKED',
          revocationReason: revocationReason.trim(),
        }),
      });

      if (res.ok) {
        setRevokeModalData(null);
        setRevocationReason('');
        setStatusMsg({ type: 'success', text: `Certificate ${revokeModalData.number} has been REVOKED.` });
        fetchCertificates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailCertificate = async (cert: CertificateData) => {
    if (!cert.recipientEmail) {
      await Swal.fire({
        icon: 'warning',
        title: 'Recipient Email Missing',
        text: `No email address is registered for ${cert.recipientName}. Cannot dispatch certificate.`,
        confirmButtonColor: '#0C234C',
      });
      return;
    }

    const confirmRes = await Swal.fire({
      title: 'Send Certificate via Email?',
      html: `
        <div class="text-left text-xs space-y-2.5 mt-2">
          <p class="text-slate-600">Dispatch the official verified certificate PDF to the recipient's registered inbox?</p>
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 font-medium">
            <div class="flex justify-between"><span class="text-slate-500">Recipient:</span> <span class="font-bold text-navy-950">${cert.recipientName}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Email Address:</span> <span class="font-bold text-blue-700 font-mono">${cert.recipientEmail}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Certificate No:</span> <span class="font-bold text-navy-950 font-mono">${cert.certificateNumber}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Category:</span> <span class="text-amber-800 font-semibold">${cert.title}</span></div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send Certificate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0C234C',
      cancelButtonColor: '#94A3B8',
      reverseButtons: true,
    });

    if (!confirmRes.isConfirmed) {
      return;
    }

    setActionLoading(true);
    setStatusMsg(null);

    // Show SweetAlert Loading Modal with Spinner
    Swal.fire({
      title: 'Sending Certificate Email...',
      html: `
        <div class="py-2 text-xs text-slate-600 space-y-2">
          <p>Generating high-resolution official A4 PDF certificate...</p>
          <div class="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 font-semibold font-mono">
            Dispatching to ${cert.recipientEmail}
          </div>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(`/api/certificates/${cert.id}/email`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Certificate PDF successfully emailed to ${cert.recipientEmail}!` });
        await Swal.fire({
          icon: 'success',
          title: 'Certificate Email Delivered!',
          html: `
            <div class="text-xs text-slate-600 space-y-2">
              <p>The official certificate PDF (<b>${cert.certificateNumber}</b>) has been successfully emailed to:</p>
              <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold font-mono">
                ${cert.recipientEmail}
              </div>
            </div>
          `,
          confirmButtonColor: '#0C234C',
        });
      } else {
        const errorMsg = data.error || 'Failed to email certificate.';
        setStatusMsg({ type: 'error', text: errorMsg });
        await Swal.fire({
          icon: 'error',
          title: 'Email Delivery Failed',
          text: errorMsg,
          confirmButtonColor: '#0C234C',
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to dispatch email';
      setStatusMsg({ type: 'error', text: errorMsg });
      await Swal.fire({
        icon: 'error',
        title: 'Dispatch Error',
        text: errorMsg,
        confirmButtonColor: '#0C234C',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = (certNum: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nipaniatrust.org';
    const link = `${origin}/verify/${certNum}`;
    navigator.clipboard.writeText(link);
    setCopiedId(certNum);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Metrics calculations
  const totalIssued = certificates.filter((c) => c.status === 'ISSUED').length;
  const totalRevoked = certificates.filter((c) => c.status === 'REVOKED').length;
  const totalDraft = certificates.filter((c) => c.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold-600 font-bold uppercase tracking-widest text-[11px] mb-1">
            <Award className="w-4 h-4 text-gold-600" />
            <span>Document &amp; Recognition Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-heading">
            Certificate Management
          </h1>
          <p className="text-xs text-slate-500">
            Issue, preview, print, verify, and revoke official recognition certificates for volunteers, events, and community projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setBulkEmailResults(null);
              setIsBulkEmailOpen(true);
            }}
            disabled={certificates.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Bulk email official PDF certificates to selected recipients"
          >
            <Mail className="w-4 h-4 text-blue-200" />
            <span>Bulk Send Email</span>
            {selectedCertIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-blue-900 font-mono text-[10px] font-bold">
                {selectedCertIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsBulkPrintOpen(true)}
            disabled={certificates.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>Bulk Print &amp; Multi-Page PDF</span>
            {selectedCertIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gold-500 text-navy-950 font-mono text-[10px] font-bold">
                {selectedCertIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setCreateModalTab('SINGLE');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400 hover:from-gold-500 hover:to-amber-600 text-navy-950 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Certificates</span>
          <span className="text-2xl font-black text-navy-950 font-mono mt-1 block">{certificates.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active &amp; Issued</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{totalIssued}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Draft Records</span>
          <span className="text-2xl font-black text-slate-700 font-mono mt-1 block">{totalDraft}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Revoked</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">{totalRevoked}</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCertificates();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate no, recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">Official &amp; Issued</option>
            <option value="DRAFT">Drafts</option>
            <option value="REVOKED">Revoked</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
          >
            <option value="ALL">All Certificate Types</option>
            {CERTIFICATE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCertIds.length === certificates.length) {
                        setSelectedCertIds([]);
                      } else {
                        setSelectedCertIds(certificates.map((c) => c.id));
                      }
                    }}
                    className="flex items-center justify-center text-slate-400 hover:text-navy-950 cursor-pointer"
                    title="Select All / Deselect All"
                  >
                    {selectedCertIds.length === certificates.length && certificates.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-gold-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Cert Number</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Type &amp; Purpose</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">Loading certificates...</td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">No certificates matching criteria.</td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${selectedCertIds.includes(c.id) ? 'bg-gold-50/20' : ''}`}>
                    <td className="py-3 px-4 w-10">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCertIds((prev) =>
                            prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          );
                        }}
                        className="flex items-center justify-center text-slate-400 hover:text-navy-950 cursor-pointer"
                      >
                        {selectedCertIds.includes(c.id) ? (
                          <CheckSquare className="w-4 h-4 text-gold-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-navy-950 block">{c.certificateNumber}</span>
                      <span className="text-[10px] font-mono text-slate-400">{c.verificationCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-navy-950 block">{c.recipientName}</span>
                      {c.recipientEmail && <span className="text-[11px] text-slate-500 block">{c.recipientEmail}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-amber-900 block">{c.title}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{c.description || '-'}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span>{formatDate(c.issueDate)}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'ISSUED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'REVOKED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview Modal Button */}
                        <button
                          onClick={() => setPreviewCert(c)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                          title="Preview A4 Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* PDF Download Direct */}
                        <a
                          href={`/api/certificates/${encodeURIComponent(c.id || c.certificateNumber)}/pdf?download=true`}
                          download={`${c.certificateNumber}_Certificate.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Email Certificate */}
                        {c.status === 'ISSUED' && c.recipientEmail && (
                          <button
                            onClick={() => handleEmailCertificate(c)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition-colors"
                            title="Email Certificate with PDF Attachment"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}

                        {/* Copy Verification Link */}
                        <button
                          onClick={() => handleCopyLink(c.certificateNumber)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                          title="Copy Public QR Verification URL"
                        >
                          {copiedId === c.certificateNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Issue Draft Action */}
                        {c.status === 'DRAFT' && (
                          <button
                            onClick={() => handleIssueDraft(c)}
                            disabled={actionLoading}
                            className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            title="Officially Issue Certificate"
                          >
                            Issue
                          </button>
                        )}

                        {/* Revoke Action */}
                        {c.status === 'ISSUED' && (
                          <button
                            onClick={() => setRevokeModalData({ id: c.id, number: c.certificateNumber, name: c.recipientName })}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Revoke Certificate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
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

      {/* Preview Modal */}
      {previewCert && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:fixed print:inset-0 print:p-0 print:m-0 print:bg-white print:backdrop-blur-none print:z-[999999] print:overflow-visible print:block">
          <div className="relative w-full max-w-5xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 my-auto max-h-[95vh] overflow-y-auto admin-modal-scroll print:static print:w-full print:max-w-none print:p-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible print:bg-transparent">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 z-20 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            <CertificateRenderer certificate={previewCert} showActions={true} onEmail={handleEmailCertificate} />
          </div>
        </div>
      )}

      {/* Create Certificate Modal */}
      {isCreateModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 my-auto max-h-[92vh] overflow-y-auto admin-modal-scroll animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gold-600 font-bold uppercase tracking-wider text-xs">
                <Award className="w-4 h-4" />
                <span>Official Recognition Studio</span>
              </div>
              <h3 className="text-xl font-bold text-navy-950 font-heading">
                Generate Certificate
              </h3>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full">
                <button
                  type="button"
                  onClick={() => setCreateModalTab('SINGLE')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    createModalTab === 'SINGLE'
                      ? 'bg-white text-navy-950 shadow-sm'
                      : 'text-slate-600 hover:text-navy-950'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-gold-600" />
                  <span>Single Recipient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalTab('BATCH')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    createModalTab === 'BATCH'
                      ? 'bg-white text-navy-950 shadow-sm'
                      : 'text-slate-600 hover:text-navy-950'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Batch Issue to Volunteers</span>
                  {selectedBatchVolunteerIds.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-gold-500 text-navy-950 text-[10px] font-bold font-mono">
                      {selectedBatchVolunteerIds.length}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: SINGLE RECIPIENT */}
              {createModalTab === 'SINGLE' && (
                <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                  {/* Quick Volunteer Selector Dropdown */}
                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-amber-950">
                        ⚡ Quick Select from Registered Volunteers
                      </label>
                      {createForm.volunteerId && (
                        <button
                          type="button"
                          onClick={() => handleVolunteerSelect('')}
                          className="text-[11px] text-amber-700 font-bold hover:underline"
                        >
                          Clear (Manual Entry)
                        </button>
                      )}
                    </div>
                    <select
                      value={createForm.volunteerId}
                      onChange={(e) => handleVolunteerSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="">-- Choose Registered Volunteer (Auto-fills Name, Email, Phone) --</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.fullName} ({v.volunteerId}) {v.email ? `• ${v.email}` : '• No email'}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-amber-800/80">
                      Selecting a volunteer automatically populates their verified details. Or leave unselected to enter custom recipient details.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Certificate Type *</label>
                    <select
                      value={createForm.certificateType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-gold-500"
                    >
                      {CERTIFICATE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Certificate Title Heading *</label>
                    <input
                      type="text"
                      required
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Recipient Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Kumar Sharma"
                        value={createForm.recipientName}
                        onChange={(e) => setCreateForm({ ...createForm, recipientName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-navy-950 focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Recipient Email (for delivery)</label>
                      <input
                        type="email"
                        placeholder="recipient@example.com"
                        value={createForm.recipientEmail}
                        onChange={(e) => setCreateForm({ ...createForm, recipientEmail: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Citation / Description Body *</label>
                    <textarea
                      rows={3}
                      required
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date of Issue *</label>
                      <input
                        type="date"
                        required
                        value={createForm.issueDate}
                        onChange={(e) => setCreateForm({ ...createForm, issueDate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Signatory Authority</label>
                      <input
                        type="text"
                        value={createForm.signatoryName}
                        onChange={(e) => setCreateForm({ ...createForm, signatoryName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-warm-50 rounded-xl border border-gold-200 flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-navy-950 font-bold">Issue Immediately?</strong>
                      <span className="text-[11px] text-slate-500">Enable public QR verification and PDF generation right away</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={createForm.directIssue}
                      onChange={(e) => setCreateForm({ ...createForm, directIssue: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-500 hover:to-amber-600 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{createForm.directIssue ? 'Issue Certificate' : 'Save Draft'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: BATCH ISSUE TO MULTIPLE VOLUNTEERS */}
              {createModalTab === 'BATCH' && (
                <form onSubmit={handleBatchCreateSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Certificate Type *</label>
                    <select
                      value={createForm.certificateType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-gold-500"
                    >
                      {CERTIFICATE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Volunteer Multi-Selector List */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="font-semibold text-slate-700">
                        Select Volunteers ({selectedBatchVolunteerIds.length} of {volunteers.length} selected)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = volunteers.filter((v) =>
                              batchVolunteerSearch
                                ? v.fullName.toLowerCase().includes(batchVolunteerSearch.toLowerCase()) ||
                                  v.volunteerId.toLowerCase().includes(batchVolunteerSearch.toLowerCase()) ||
                                  (v.email && v.email.toLowerCase().includes(batchVolunteerSearch.toLowerCase()))
                                : true
                            );
                            setSelectedBatchVolunteerIds(filtered.map((v) => v.id));
                          }}
                          className="text-[11px] font-bold text-blue-700 hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedBatchVolunteerIds([])}
                          className="text-[11px] font-bold text-slate-500 hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search volunteers by name, ID or email..."
                        value={batchVolunteerSearch}
                        onChange={(e) => setBatchVolunteerSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                      {volunteers
                        .filter((v) =>
                          batchVolunteerSearch
                            ? v.fullName.toLowerCase().includes(batchVolunteerSearch.toLowerCase()) ||
                              v.volunteerId.toLowerCase().includes(batchVolunteerSearch.toLowerCase()) ||
                              (v.email && v.email.toLowerCase().includes(batchVolunteerSearch.toLowerCase()))
                            : true
                        )
                        .map((vol) => {
                          const isChecked = selectedBatchVolunteerIds.includes(vol.id);
                          return (
                            <label
                              key={vol.id}
                              className={`flex items-center justify-between p-2.5 transition-colors cursor-pointer hover:bg-amber-50/50 ${
                                isChecked ? 'bg-amber-50/80 font-medium' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBatchVolunteerIds((prev) => [...prev, vol.id]);
                                    } else {
                                      setSelectedBatchVolunteerIds((prev) => prev.filter((id) => id !== vol.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <div>
                                  <div className="font-bold text-navy-950 text-xs flex items-center gap-1.5">
                                    <span>{vol.fullName}</span>
                                    <span className="text-[10px] font-mono text-slate-500 font-normal">
                                      ({vol.volunteerId})
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] text-slate-500">
                                    {vol.email || <span className="text-amber-700 italic">No email</span>} • {vol.mobile || 'No phone'}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                                {vol.status}
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Citation Body *</label>
                    <textarea
                      rows={2}
                      required
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date of Issue *</label>
                      <input
                        type="date"
                        required
                        value={createForm.issueDate}
                        onChange={(e) => setCreateForm({ ...createForm, issueDate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Signatory Authority</label>
                      <input
                        type="text"
                        value={createForm.signatoryName}
                        onChange={(e) => setCreateForm({ ...createForm, signatoryName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-warm-50 rounded-xl border border-gold-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-navy-950 font-bold">Issue Immediately?</strong>
                        <span className="text-[11px] text-slate-500">Enable public QR verification and PDF generation right away</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={createForm.directIssue}
                        onChange={(e) => setCreateForm({ ...createForm, directIssue: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-navy-950 font-bold">Send Email with PDF Immediately?</strong>
                        <span className="text-[11px] text-slate-500">Automatically dispatches certificate PDF to recipients with email addresses</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={batchDirectEmail}
                        onChange={(e) => setBatchDirectEmail(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || selectedBatchVolunteerIds.length === 0}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Generate Certificates ({selectedBatchVolunteerIds.length})</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revoke Certificate Modal */}
      {revokeModalData && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-300 my-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setRevokeModalData(null);
                setRevocationReason('');
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy-950 font-heading">
                  Revoke Certificate {revokeModalData.number}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Issued to <strong>{revokeModalData.name}</strong>. Revocation is an irreversible official audit action. Public verification will immediately reflect this certificate as <strong>REVOKED</strong>.
                </p>
              </div>

              <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Revocation Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Issued with erroneous name spelling, replaced by new certificate NVST-CERT-XXXXXX"
                    value={revocationReason}
                    onChange={(e) => setRevocationReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRevokeModalData(null);
                      setRevocationReason('');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !revocationReason.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Revocation</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Certificates Modal */}
      {isBulkEmailOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-300 my-auto max-h-[92vh] overflow-y-auto admin-modal-scroll animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsBulkEmailOpen(false);
                setBulkEmailResults(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-xs">
                <Mail className="w-4 h-4" />
                <span>Bulk Email Dispatch</span>
              </div>
              <h3 className="text-xl font-bold text-navy-950 font-heading">
                Send Certificates via Email
              </h3>

              {/* If completed, show summary report */}
              {bulkEmailResults ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block">Delivered</span>
                      <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                        {bulkEmailResults.sentCount}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                      <span className="text-[11px] font-bold text-amber-800 uppercase block">Skipped</span>
                      <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                        {bulkEmailResults.skippedCount}
                      </span>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                      <span className="text-[11px] font-bold text-rose-800 uppercase block">Failed</span>
                      <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">
                        {bulkEmailResults.failedCount}
                      </span>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                    {bulkEmailResults.results.map((r, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-navy-950">{r.recipientName}</span>
                          <span className="text-slate-400 font-mono text-[10.5px] ml-1.5">({r.certificateNumber})</span>
                          <div className="text-[10.5px] text-slate-500">{r.email || r.reason}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          r.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'SKIPPED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkEmailOpen(false);
                        setBulkEmailResults(null);
                        setSelectedCertIds([]);
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-950 text-white hover:bg-navy-900 shadow-md cursor-pointer"
                    >
                      Done &amp; Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Confirmation & Preview of certificates to send */
                <div className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    You have selected <strong>{(selectedCertIds.length > 0 ? selectedCertIds.length : certificates.length)} certificate(s)</strong>.
                    Each recipient with an email address will receive an official branded email containing their verified certificate details and an attached high-resolution A4 printable PDF document.
                  </p>

                  {/* List of target certificates */}
                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                    {(selectedCertIds.length > 0
                      ? certificates.filter((c) => selectedCertIds.includes(c.id))
                      : certificates
                    ).map((c) => (
                      <div key={c.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-navy-950 text-xs">
                            {c.recipientName}
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-500">
                            {c.certificateNumber}
                          </div>
                        </div>
                        <div>
                          {c.recipientEmail ? (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {c.recipientEmail}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              No Email (Skipped)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Draft certificates will automatically be officially approved and marked as <strong>ISSUED</strong> upon email dispatch.
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBulkEmailOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={bulkEmailLoading}
                      onClick={() => {
                        const targetIds = selectedCertIds.length > 0 ? selectedCertIds : certificates.map((c) => c.id);
                        if (targetIds.length > 0) {
                          setSelectedCertIds(targetIds);
                          handleTriggerBulkEmail();
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {bulkEmailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {bulkEmailLoading ? 'Dispatching Emails...' : `Send Official PDFs to Recipients (${selectedCertIds.length || certificates.length})`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Certificate Print & Multi-Page PDF Studio Modal */}
      <BulkCertificatePrint
        certificates={certificates}
        initialSelectedIds={selectedCertIds.length > 0 ? selectedCertIds : certificates.map((c) => c.id)}
        isOpen={isBulkPrintOpen}
        onClose={() => setIsBulkPrintOpen(false)}
      />
    </div>
  );
}
