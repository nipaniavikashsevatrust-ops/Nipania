'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  CreditCard,
  AlertCircle,
  X,
  Mail,
  Edit,
  Trash2,
  Download,
  MessageSquare,
  FileWarning,
  Save,
  Upload,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import IdCardRenderer, { IdCardData } from '@/components/admin/IdCardRenderer';

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Correction Remarks Modal state
  const [correctionModalData, setCorrectionModalData] = useState<{
    volunteer: any;
    remarks: string;
  } | null>(null);

  // Edit Volunteer Modal state
  const [editModalData, setEditModalData] = useState<any | null>(null);

  // Delete Confirmation state
  const [deleteConfirmData, setDeleteConfirmData] = useState<any | null>(null);

  // ID Card Modal state
  const [idCardModalData, setIdCardModalData] = useState<{
    card: IdCardData;
    recipientEmail: string;
    isNewApproval: boolean;
  } | null>(null);

  const fetchVolunteers = () => {
    setLoading(true);
    let url = `/api/volunteers?status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.volunteers) setVolunteers(data.volunteers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter]);

  const handleUpdateStatus = async (volunteer: any, newStatus: string, adminRemarks?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/volunteers/${volunteer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminRemarks: adminRemarks !== undefined ? adminRemarks : volunteer.adminRemarks,
        }),
      });

      if (res.ok) {
        fetchVolunteers();
        setSelectedVolunteer(null);
        setCorrectionModalData(null);

        if (newStatus === 'APPROVED') {
          const issueDate = new Date();
          const validUntil = new Date();
          validUntil.setFullYear(validUntil.getFullYear() + 1);

          setIdCardModalData({
            card: {
              cardNumber: volunteer.volunteerId,
              fullName: volunteer.fullName,
              role: volunteer.category,
              personType: 'VOLUNTEER',
              photoUrl: volunteer.photoUrl,
              issueDate: issueDate.toISOString(),
              validUntil: validUntil.toISOString(),
              status: 'ACTIVE',
            },
            recipientEmail: volunteer.email,
            isNewApproval: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalData) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/volunteers/${editModalData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editModalData),
      });

      if (res.ok) {
        fetchVolunteers();
        setEditModalData(null);
      } else {
        alert('Failed to update volunteer details');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving changes');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVolunteer = async () => {
    if (!deleteConfirmData) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/volunteers/${deleteConfirmData.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVolunteers();
        setDeleteConfirmData(null);
        if (selectedVolunteer?.id === deleteConfirmData.id) {
          setSelectedVolunteer(null);
        }
      } else {
        alert('Failed to delete volunteer');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting volunteer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenIdCardModal = (volunteer: any) => {
    const issueDate = new Date(volunteer.createdAt);
    const validUntil = new Date(volunteer.createdAt);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    setIdCardModalData({
      card: {
        cardNumber: volunteer.volunteerId,
        fullName: volunteer.fullName,
        role: volunteer.category,
        personType: 'VOLUNTEER',
        photoUrl: volunteer.photoUrl,
        issueDate: issueDate.toISOString(),
        validUntil: validUntil.toISOString(),
        status: volunteer.status === 'APPROVED' ? 'ACTIVE' : volunteer.status,
      },
      recipientEmail: volunteer.email,
      isNewApproval: false,
    });
  };

  return (
    <div className="">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gold-600 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Volunteer Administration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Volunteer Applications & ID Cards
          </h1>
          <p className="text-xs text-slate-500">
            Review volunteer registrations, request applicant corrections with remarks, approve candidates with PDF ID Card email delivery, and manage profiles.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchVolunteers();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, name, mobile, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="NEEDS_CORRECTION">Needs Correction</option>
            <option value="APPROVED">Approved / Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Photo</th>
                <th className="py-3.5 px-4">Volunteer ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Status & Remarks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">Loading volunteers...</td>
                </tr>
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">No volunteers matching filter.</td>
                </tr>
              ) : (
                volunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                        {v.photoUrl ? (
                          <Image src={v.photoUrl} alt={v.fullName} fill className="object-cover" />
                        ) : (
                          <Users className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">
                      {v.volunteerId}
                    </td>
                    <td className="py-3 px-4 font-bold text-navy-900">
                      {v.fullName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gold-50 text-gold-800 text-[10px] font-semibold border border-gold-200">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.district || 'Jharkhand'}, {v.state}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {v.mobile}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : v.status === 'NEEDS_CORRECTION'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : v.status === 'PENDING'
                                ? (v.adminRemarks?.includes('[Applicant corrected')
                                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                    : 'bg-amber-100 text-amber-700')
                                : 'bg-rose-100 text-rose-700'
                        }`}>
                          {v.status === 'NEEDS_CORRECTION' && <FileWarning className="w-3 h-3 text-orange-600" />}
                          {v.status === 'PENDING' && v.adminRemarks?.includes('[Applicant corrected') && (
                            <Sparkles className="w-3 h-3 text-teal-600" />
                          )}
                          {v.status === 'PENDING' && v.adminRemarks?.includes('[Applicant corrected')
                            ? 'CORRECTIONS RECEIVED'
                            : v.status}
                        </span>
                        {v.adminRemarks && (
                          <p className="text-[10px] text-orange-700 font-medium truncate max-w-[140px]" title={v.adminRemarks}>
                            Remark: {v.adminRemarks}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Review Profile */}
                        <button
                          onClick={() => setSelectedVolunteer(v)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-navy-950 hover:bg-slate-100 flex items-center gap-1"
                          title="View Profile & Review"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>

                        {/* Remark / Request Correction */}
                        {v.status !== 'APPROVED' && (
                          <button
                            onClick={() => setCorrectionModalData({ volunteer: v, remarks: v.adminRemarks || '' })}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-50 border border-orange-200 flex items-center gap-1"
                            title="Add Remark / Request Correction via Email"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Remark</span>
                          </button>
                        )}

                        {/* ID Card (If Approved) */}
                        {v.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleOpenIdCardModal(v)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gold-500/20 text-gold-700 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center gap-1 border border-gold-400/40"
                            title="View / Print Official ID Card"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>ID Card</span>
                          </button>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(v, 'APPROVED')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1"
                            title="Approve & Send ID Card via Email"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditModalData({ ...v })}
                          className="p-1 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmData(v)}
                          className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Volunteer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Volunteer Application Detail Modal */}
      {selectedVolunteer && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <button
              onClick={() => setSelectedVolunteer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-24 rounded-2xl overflow-hidden border-2 border-gold-400 bg-navy-950 shrink-0 shadow-md flex items-center justify-center">
                  {selectedVolunteer.photoUrl ? (
                    <Image
                      src={selectedVolunteer.photoUrl}
                      alt={selectedVolunteer.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-gold-400/80" />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 font-mono">
                    {selectedVolunteer.volunteerId}
                  </span>
                  <h3 className="text-xl font-bold text-navy-950 font-heading">
                    {selectedVolunteer.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applied on {formatDate(selectedVolunteer.createdAt)} for role <strong>{selectedVolunteer.category}</strong>
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedVolunteer.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedVolunteer.status === 'NEEDS_CORRECTION'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedVolunteer.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedVolunteer.adminRemarks && (
                <div className="mt-4 p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-orange-900 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                    <span>Administrator Correction Remarks:</span>
                  </div>
                  <p className="text-orange-800 whitespace-pre-wrap">{selectedVolunteer.adminRemarks}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-6">
                <div className="bg-warm-50 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-navy-950 text-xs block border-b border-slate-200 pb-1">
                    Personal Details
                  </span>
                  <p><strong>DOB:</strong> {selectedVolunteer.dob || '-'}</p>
                  <p><strong>Gender:</strong> {selectedVolunteer.gender || '-'}</p>
                  <p><strong>Guardian:</strong> {selectedVolunteer.guardianName || '-'}</p>
                  <p><strong>Education:</strong> {selectedVolunteer.education || '-'}</p>
                  <p><strong>Occupation:</strong> {selectedVolunteer.occupation || '-'}</p>
                </div>

                <div className="bg-warm-50 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-navy-950 text-xs block border-b border-slate-200 pb-1">
                    Contact & Availability
                  </span>
                  <p><strong>Mobile:</strong> {selectedVolunteer.mobile}</p>
                  <p><strong>Email:</strong> {selectedVolunteer.email}</p>
                  <p><strong>District:</strong> {selectedVolunteer.district || 'Jharkhand'}, {selectedVolunteer.state}</p>
                  <p><strong>PIN:</strong> {selectedVolunteer.pincode || '-'}</p>
                  <p><strong>Availability:</strong> {selectedVolunteer.availability}</p>
                </div>
              </div>

              {selectedVolunteer.skills && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mt-4">
                  <strong className="block text-navy-950 mb-1">Declared Skills & Experience:</strong>
                  <p className="text-slate-600">{selectedVolunteer.skills}</p>
                </div>
              )}

              {/* Actions Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditModalData({ ...selectedVolunteer });
                      setSelectedVolunteer(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmData(selectedVolunteer);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedVolunteer.status !== 'APPROVED' && (
                    <button
                      onClick={() => {
                        setCorrectionModalData({
                          volunteer: selectedVolunteer,
                          remarks: selectedVolunteer.adminRemarks || '',
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-300 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                      <span>Request Correction</span>
                    </button>
                  )}

                  {selectedVolunteer.status !== 'APPROVED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedVolunteer, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Dispatch PDF Card</span>
                    </button>
                  )}

                  {selectedVolunteer.status !== 'REJECTED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedVolunteer, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Remark / Request Correction Modal */}
      {correctionModalData && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-300 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <button
              onClick={() => setCorrectionModalData(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-orange-600">
                <FileWarning className="w-5 h-5" />
                <h3 className="text-lg font-black text-navy-950 font-heading">
                  Request Application Correction
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Specify the mistakes or missing information for <strong>{correctionModalData.volunteer.fullName}</strong> ({correctionModalData.volunteer.volunteerId}). An official notice with your instructions will be emailed to <strong>{correctionModalData.volunteer.email}</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1.5">
                  Administrator Remarks & Required Corrections:
                </label>
                <textarea
                  rows={4}
                  value={correctionModalData.remarks}
                  onChange={(e) => setCorrectionModalData({ ...correctionModalData, remarks: e.target.value })}
                  placeholder="e.g. Please provide a clear passport photograph with light background, and verify your full residential address with PIN code."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionModalData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !correctionModalData.remarks.trim()}
                  onClick={() => handleUpdateStatus(correctionModalData.volunteer, 'NEEDS_CORRECTION', correctionModalData.remarks)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Correction Notice in Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Volunteer Modal */}
      {editModalData && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-300 my-auto max-h-[92vh] overflow-y-auto admin-modal-scroll">
            <button
              onClick={() => setEditModalData(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-navy-950 font-heading">
                  Edit Volunteer Details
                </h3>
                <p className="text-xs text-slate-500">
                  Update personal, contact, category or status information for {editModalData.volunteerId}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editModalData.fullName || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={editModalData.guardianName || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, guardianName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editModalData.mobile || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editModalData.email || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category / Role</label>
                  <input
                    type="text"
                    value={editModalData.category || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editModalData.occupation || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, occupation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editModalData.district || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editModalData.state || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Full Address</label>
                  <input
                    type="text"
                    value={editModalData.address || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editModalData.status || 'PENDING'}
                    onChange={(e) => setEditModalData({ ...editModalData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="NEEDS_CORRECTION">NEEDS_CORRECTION</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Photograph (Upload Image)</label>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-gold-400/80 bg-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                      {editModalData.photoUrl ? (
                        <img
                          src={editModalData.photoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-navy-950 text-white hover:bg-navy-900 shadow-xs transition-all active:scale-98">
                          <Upload className="w-3.5 h-3.5 text-gold-400" />
                          <span>{uploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingPhoto}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingPhoto(true);

                              const bodyData = new FormData();
                              bodyData.append('file', file);

                              try {
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: bodyData,
                                });
                                const data = await res.json();
                                if (res.ok && data.url) {
                                  setEditModalData({ ...editModalData, photoUrl: data.url });
                                } else {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setEditModalData({ ...editModalData, photoUrl: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              } catch (err) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setEditModalData({ ...editModalData, photoUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              } finally {
                                setUploadingPhoto(false);
                              }
                            }}
                          />
                        </label>

                        {editModalData.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditModalData({ ...editModalData, photoUrl: '' })}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Upload a passport-size portrait (JPG, PNG or WEBP, max 5MB).
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Admin Remarks / Notes</label>
                  <textarea
                    rows={2}
                    value={editModalData.adminRemarks || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, adminRemarks: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-gold-400" />
                  <span>Save Volunteer Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmData && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-300 my-auto max-h-[90vh] overflow-y-auto admin-modal-scroll">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-lg font-black text-navy-950 font-heading">
                  Confirm Deletion
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete volunteer <strong>{deleteConfirmData.fullName}</strong> ({deleteConfirmData.volunteerId})? This action cannot be undone and will revoke any associated identity cards.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleDeleteVolunteer}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official ID Card & Email Confirmation Modal */}
      {idCardModalData && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 my-auto max-h-[92vh] overflow-y-auto admin-modal-scroll animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIdCardModalData(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              {/* Email Dispatch Notice */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>{idCardModalData.isNewApproval ? 'Approved & PDF ID Card Dispatched!' : 'Verified Identity Card'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Official ID card credentials & high-resolution PDF document sent to <strong>{idCardModalData.recipientEmail}</strong>.
                  </p>
                </div>
              </div>

              {/* Single Sided ID Card Render */}
              <div className="py-1">
                <IdCardRenderer card={idCardModalData.card} />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIdCardModalData(null)}
                  className="px-6 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
