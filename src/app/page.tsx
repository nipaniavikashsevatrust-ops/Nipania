import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import EmergencyBanner from '@/components/public/EmergencyBanner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import HeroSection from '@/components/public/HeroSection';
import CampaignsShowcase from '@/components/public/CampaignsShowcase';
import DirectDonationSection from '@/components/public/DirectDonationSection';
import CrisisResponseProcess from '@/components/public/CrisisResponseProcess';
import ImpactSection from '@/components/public/ImpactSection';
import WaysToHelpSection from '@/components/public/WaysToHelpSection';
import MissionVisionSection from '@/components/public/MissionVisionSection';
import ImpactGallerySection from '@/components/public/ImpactGallerySection';
import PaymentPartnersStrip from '@/components/public/PaymentPartnersStrip';
import BoardMembersSection from '@/components/public/BoardMembersSection';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import prisma from '@/lib/prisma';
import { Heart, Users, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 0; // Fresh dynamic data on every request

async function getHomepageData() {
  try {
    const [stats, heroBlock, trustDetails, dbProjects] = await Promise.all([
      prisma.impactStat.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.contentBlock.findUnique({
        where: { key: 'hero_title' },
      }),
      prisma.trustDetail.findUnique({
        where: { id: 'trust-settings' },
      }),
      prisma.project.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return { stats, heroBlock, trustDetails, dbProjects };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return { stats: [], heroBlock: null, trustDetails: null, dbProjects: [] };
  }
}

export default async function HomePage() {
  const { stats, heroBlock, dbProjects } = await getHomepageData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Utility Announcement Bar */}
      <AnnouncementBar />

      {/* Urgent Emergency / Appeal Marquee Bar (SikhAid inspired) */}
      <EmergencyBanner />

      {/* Main Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Dynamic Hero Section with Rotating Causes & Quick Donation Card */}
        <HeroSection
          title={heroBlock?.title || undefined}
          subtitle={heroBlock?.subtitle || undefined}
        />

        {/* 2. Current Campaigns & Featured Drives Showcase */}
        <CampaignsShowcase dbCampaigns={dbProjects} />

        {/* 2.5 Direct UPI QR & Bank Transfer Section (SikhAid Inspired) */}
        <DirectDonationSection />

        {/* 3. How We Respond to Crisis - 4-Stage Response Framework */}
        <CrisisResponseProcess />

        {/* 4. Total Lives Impacted & Domain Metrics */}
        <ImpactSection stats={stats} />

        {/* 5. How Can You Help? (One-Time, Monthly Seva Partner, Corporate CSR) */}
        <WaysToHelpSection />

        {/* 6. Payment Modes Strip */}
        <PaymentPartnersStrip />

        {/* 7. Our Purpose: Mission & Vision Dual Purpose Cards */}
        <MissionVisionSection />

        {/* 8. On-Ground Seva Photo Gallery */}
        <ImpactGallerySection />

        {/* 9. Board of Trustees & Leadership */}
        <BoardMembersSection />

        {/* 10. What People Say - Testimonials */}
        <TestimonialsSection />

        {/* 11. Frequently Asked Questions */}
        <FAQSection />

        {/* 12. Global Volunteer / Community Involvement CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-emerald-500/10 text-slate-900 relative overflow-hidden border-t border-slate-200">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="title-ornament">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-black">
                  Be The Change
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight font-heading text-slate-900">
                Join Hands with Nipania Vikash Seva Trust
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Whether you wish to contribute your skills as an on-ground volunteer, support grassroots community drives, or empower families through transparent donations, your participation brings hope and dignity.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/volunteer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500 hover:from-amber-600 hover:to-gold-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>Register as Volunteer</span>
                </Link>

                <Link
                  href="/donate"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Support with Donation</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
