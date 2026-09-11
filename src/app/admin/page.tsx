import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  Heart, 
  Users, 
  Award, 
  FolderKanban, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

export const revalidate = 0;

async function getAdminMetrics() {
  try {
    const [
      donationsCount,
      donationsSum,
      volunteersCount,
      pendingVolunteers,
      issuedCertificates,
      draftCertificates,
      projectsCount,
      eventsCount,
      recentDonations,
      recentVolunteers,
      recentLogs,
    ] = await Promise.all([
      prisma.donation.count({ where: { status: 'SUCCESS' } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.volunteer.count({ where: { status: 'APPROVED' } }),
      prisma.volunteer.count({ where: { status: 'PENDING' } }),
      prisma.certificate.count({ where: { status: 'ISSUED' } }),
      prisma.certificate.count({ where: { status: 'DRAFT' } }),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count({ where: { status: 'UPCOMING' } }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.volunteer.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return {
      totalDonationsAmount: donationsSum._sum.amount || 0,
      totalDonationsCount: donationsCount,
      activeVolunteers: volunteersCount,
      pendingVolunteers,
      issuedCertificates,
      draftCertificates,
      activeProjects: projectsCount,
      upcomingEvents: eventsCount,
      recentDonations,
      recentVolunteers,
      recentLogs,
    };
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return {
      totalDonationsAmount: 0,
      totalDonationsCount: 0,
      activeVolunteers: 0,
      pendingVolunteers: 0,
      issuedCertificates: 0,
      draftCertificates: 0,
      activeProjects: 0,
      upcomingEvents: 0,
      recentDonations: [],
      recentVolunteers: [],
      recentLogs: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0c2340] via-[#103460] to-[#0c2340] p-6 sm:p-8 rounded-3xl border-2 border-gold-400/40 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400 font-heading">
            Administrative Management Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Good Day, Administrator
          </h1>
          <p className="text-xs text-blue-100/80">
            Nipania Vikash Seva Trust • Management Suite
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link
            href="/admin/certificates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 transition-all backdrop-blur-sm"
          >
            <Award className="w-4 h-4" />
            <span>Certificate Studio</span>
          </Link>
          <Link
            href="/admin/id-cards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-slate-950 font-black shadow-gold transition-all active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>ID Card Studio</span>
          </Link>
          <Link
            href="/admin/donations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-sm"
          >
            <span>Donations List</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Donations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Total Funds Raised</span>
            <h3 className="text-2xl font-extrabold text-navy-950 font-mono">
              {formatCurrency(metrics.totalDonationsAmount)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {metrics.totalDonationsCount} Successful Donations
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-gold-600" />
          </div>
        </div>

        {/* Volunteers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Active Volunteers</span>
            <h3 className="text-2xl font-extrabold text-navy-950">
              {metrics.activeVolunteers}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold">
              {metrics.pendingVolunteers} Pending Approvals
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Issued Certificates</span>
            <h3 className="text-2xl font-extrabold text-navy-950">
              {metrics.issuedCertificates}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold">
              {metrics.draftCertificates} Drafts Pending Issue
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Projects & Events */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Active Programs</span>
            <h3 className="text-2xl font-extrabold text-navy-950">
              {metrics.activeProjects}
            </h3>
            <span className="text-[11px] text-slate-500">
              {metrics.upcomingEvents} Upcoming Drives
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Content Split: Pending Actions + Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pending Volunteer Review Queue */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-950 font-heading">
                Pending Volunteer Applications
              </h3>
              <p className="text-xs text-slate-500">Awaiting identity review & ID card generation</p>
            </div>
            <Link
              href="/admin/volunteers"
              className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {metrics.recentVolunteers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No pending volunteer applications at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="p-3.5 rounded-2xl bg-warm-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-navy-950 block">{vol.fullName}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {vol.category} • {vol.district || 'Jharkhand'}
                    </span>
                    <span className="text-[10px] font-mono text-gold-700 font-bold block">
                      {vol.volunteerId}
                    </span>
                  </div>

                  <Link
                    href={`/admin/volunteers?search=${vol.volunteerId}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#0c2847] to-[#123966] text-white hover:brightness-110 transition-all shadow-xs"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Donations Feed */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-950 font-heading">
                Recent Contributions
              </h3>
              <p className="text-xs text-slate-500">Real-time incoming community donations</p>
            </div>
            <Link
              href="/admin/donations"
              className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {metrics.recentDonations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No donations recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentDonations.map((don) => (
                <div
                  key={don.id}
                  className="p-3.5 rounded-2xl bg-warm-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-navy-950 block">{don.donorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {don.donationId} • {formatDate(don.createdAt)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-navy-950 font-mono text-sm block text-gold-700">
                      {formatCurrency(don.amount)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">
                      {don.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* System Audit Activity Stream */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-heading">
              Recent System & Governance Activity
            </h3>
            <p className="text-xs text-slate-500">Immutable audit log trail</p>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-bold text-slate-600 hover:text-navy-950"
          >
            All Audit Records →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {metrics.recentLogs.map((log: any) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  {log.action}
                </span>
                <span className="text-slate-700 font-medium">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
