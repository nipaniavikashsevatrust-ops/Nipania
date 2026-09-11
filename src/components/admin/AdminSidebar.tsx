'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Users,
  UserPlus,
  CreditCard,
  FolderKanban,
  FileSpreadsheet,
  Mail,
  History,
  UserCog,
  Settings,
  LogOut,
  ExternalLink,
  IndianRupee,
  Camera,
  HeartHandshake,
  FileCheck,
  Award,
  Building2,
} from 'lucide-react';

const MENU_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Donations', href: '/admin/donations', icon: Heart },
    ],
  },
  {
    title: 'PEOPLE & COMMUNITY',
    items: [
      { name: 'Volunteers', href: '/admin/volunteers', icon: Users },
      { name: 'Certificates', href: '/admin/certificates', icon: Award },
      { name: 'Board of Trustees', href: '/admin/board-members', icon: UserCog },
      { name: 'ID Card Studio', href: '/admin/id-cards', icon: CreditCard },
    ],
  },
  {
    title: 'PROGRAMS & COMPLIANCE',
    items: [
      { name: '80G & 10BD Compliance', href: '/admin/compliance/80g', icon: FileCheck },
      { name: 'Campaigns & Drives', href: '/admin/projects', icon: FolderKanban },
      { name: 'CSR Inquiries', href: '/admin/csr', icon: Building2 },
      { name: 'Sponsor Causes', href: '/admin/sponsors', icon: HeartHandshake },
      { name: 'Photo Gallery', href: '/admin/gallery', icon: Camera },
      { name: 'CMS & Impact Stats', href: '/admin/content', icon: FileSpreadsheet },
      { name: 'Contact Inquiries', href: '/admin/messages', icon: Mail },
    ],
  },
  {
    title: 'SYSTEM & GOVERNANCE',
    items: [
      { name: 'Payment Gateway', href: '/admin/payment-gateway', icon: IndianRupee },
      { name: 'Trust Settings', href: '/admin/settings', icon: Settings },
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
      { name: 'Admin Users & Roles', href: '/admin/users', icon: UserCog },
    ],
  },
];

export default function AdminSidebar({
  user,
  isOpen,
  onClose,
}: {
  user?: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0c2340]/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0c2340] via-[#0f2d52] to-[#0a1e36] text-blue-100 flex flex-col border-r border-[#153e6b] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 border-2 border-gold-400 shrink-0 shadow-md">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-tight text-white truncate font-heading">
              Nipania Trust
            </h2>
            <span className="text-[10px] text-gold-400 font-bold block uppercase tracking-wider">
              Management Suite
            </span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 mx-3 mt-3 rounded-2xl bg-[#103056]/80 border border-[#1b487c] shadow-xs flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/20">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden text-xs">
              <span className="font-bold text-white block truncate">{user.name || 'Administrator'}</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Authorized Officer</span>
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links - Smooth Native Scrollbar */}
        <nav
          data-lenis-prevent="true"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs admin-sidebar-scroll"
          style={{ overscrollBehavior: 'contain' }}
        >
          {MENU_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-blue-300/60 uppercase tracking-wider block">
                {group.title}
              </span>

              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/25 to-emerald-500/15 text-teal-200 font-bold border border-teal-400/40 shadow-xs'
                          : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-300' : 'text-blue-300/70'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-[#103056] text-blue-100 hover:text-white border border-[#1b487c] transition-colors"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3 h-3 text-gold-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
