import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BoardMembersSection from '@/components/public/BoardMembersSection';
import prisma from '@/lib/prisma';
import { ShieldCheck, Heart, Users, Target, Compass, Award, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function AboutPage() {
  const trustDetails = await prisma.trustDetail.findUnique({
    where: { id: 'trust-settings' },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="bg-navy-950 text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="title-ornament mb-3">
              <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                About Our Trust
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-heading">
              Dedicated to Seva, Vikash and Samarpan
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Empowering grassroots communities across India through education, primary health assistance, rural empowerment, and transparent humanitarian service.
            </p>
          </div>
        </section>

        {/* Who We Are & Pillars */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div className="title-ornament justify-start">
                  <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                    Organization Overview
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold text-navy-950 font-heading">
                  Who We Are
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  <strong>Nipania Vikash Seva Trust</strong> is a non-governmental public charitable organization established to address acute grassroots challenges faced by underprivileged communities. Guided by our motto <em>"Seva | Vikash | Samarpan"</em>, we bridge development gaps through community-driven interventions.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  We believe that social progress cannot be measured solely by economic metrics, but by the tangible enhancement in the dignity, well-being, education, and health of every individual.
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-warm-50 border border-slate-200 text-center">
                    <Heart className="w-6 h-6 text-gold-600 mx-auto mb-2" />
                    <h4 className="font-bold text-navy-950 text-sm">Seva</h4>
                    <p className="text-xs text-slate-500 mt-1">Selfless humanitarian service for all</p>
                  </div>

                  <div className="p-4 rounded-xl bg-warm-50 border border-slate-200 text-center">
                    <Target className="w-6 h-6 text-gold-600 mx-auto mb-2" />
                    <h4 className="font-bold text-navy-950 text-sm">Vikash</h4>
                    <p className="text-xs text-slate-500 mt-1">Holistic grassroots development</p>
                  </div>

                  <div className="p-4 rounded-xl bg-warm-50 border border-slate-200 text-center">
                    <Award className="w-6 h-6 text-gold-600 mx-auto mb-2" />
                    <h4 className="font-bold text-navy-950 text-sm">Samarpan</h4>
                    <p className="text-xs text-slate-500 mt-1">Unwavering ethical commitment</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100">
                  <div className="relative h-96 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
                      alt="Health & Community Work"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Vision & Mission Grid */}
        <section className="py-20 bg-warm-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Vision Card */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-2xl font-bold text-navy-950 font-heading">Our Vision</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  To nurture a progressive, self-reliant, and compassionate society where every person, irrespective of socio-economic background, enjoys equal opportunities for quality education, comprehensive healthcare, dignified livelihood, and environmental harmony.
                </p>
              </div>

              {/* Mission Card */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-navy-950" />
                </div>
                <h3 className="text-2xl font-bold text-navy-950 font-heading">Our Mission</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  To execute impactful community welfare programs, facilitate rural education initiatives, conduct preventive health checkup drives, train youth and women in sustainable vocational skills, and mobilize passionate volunteers dedicated to humanitarian progress.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Strategic Objectives & Approach */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="title-ornament mb-3">
                <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">
                  Guiding Framework
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-navy-950 font-heading">
                Our Strategic Objectives & Approach
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-warm-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center font-bold">1</div>
                <h4 className="text-lg font-bold text-navy-950 font-heading">Participatory Community Action</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We engage village elders, youth, and local beneficiaries directly in program design to ensure local relevance and long-term sustainability.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-warm-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center font-bold">2</div>
                <h4 className="text-lg font-bold text-navy-950 font-heading">Complete Transparency</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every rupee received and utilized is meticulously audited. Verified reports and statutory documents are made publicly available.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-warm-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center font-bold">3</div>
                <h4 className="text-lg font-bold text-navy-950 font-heading">Verifiable Accountability</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All active volunteers and representatives carry verifiable ID cards with real-time QR lookup, protecting the community from misrepresentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Board of Trustees & Governance Leadership Section */}
        <BoardMembersSection />

        {/* Legal & Governance Disclosure Table */}
        <section className="py-20 bg-navy-950 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold mb-3 border border-gold-400/30">
                <ShieldCheck className="w-4 h-4" />
                <span>OFFICIAL TRUST DISCLOSURE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
                Statutory & Legal Information
              </h2>
              <p className="text-xs text-slate-300 mt-2">
                Public disclosure of verified administrative records of Nipania Vikash Seva Trust.
              </p>
            </div>

            <div className="bg-navy-900 border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="divide-y divide-navy-800 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-navy-950/60">
                  <span className="font-semibold text-gold-400">Official Organization Name</span>
                  <span className="sm:col-span-2 font-medium text-white">NIPANIA VIKASH SEVA TRUST</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                  <span className="font-semibold text-gold-400">Organization Classification</span>
                  <span className="sm:col-span-2 font-bold text-white bg-navy-800/80 px-2 py-1 rounded inline-block max-w-fit">
                    Public Charitable Trust
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-navy-950/60">
                  <span className="font-semibold text-gold-400">Official Tagline</span>
                  <span className="sm:col-span-2 text-white">SEVA | VIKASH | SAMARPAN</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                  <span className="font-semibold text-gold-400">Registered Office</span>
                  <span className="sm:col-span-2 text-white">
                    {trustDetails?.registeredAddress || 'Nipania, Jharkhand, India'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-navy-950/60">
                  <span className="font-semibold text-gold-400">Official Contact Email</span>
                  <span className="sm:col-span-2 text-white">
                    {trustDetails?.email || 'info@nipaniatrust.org'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                  <span className="font-semibold text-gold-400">Official Contact Phone</span>
                  <span className="sm:col-span-2 text-white">
                    {trustDetails?.phone || '+91 98765 43210'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-navy-950/60">
                  <span className="font-semibold text-gold-400">Registration Details</span>
                  <span className="sm:col-span-2 text-slate-300">
                    {trustDetails?.registrationNo ? `Reg No: ${trustDetails.registrationNo}` : 'Details available upon administrative verification.'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                  <span className="font-semibold text-gold-400">DARPAN / 12A / 80G Status</span>
                  <span className="sm:col-span-2 text-slate-300">
                    Subject to official statutory verification and available upon request from the trust office.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
