import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import prisma from '@/lib/prisma';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Calendar, ArrowLeft, Building2, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function VerifyIdDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cardId = decodeURIComponent(params.id).trim().toUpperCase();

  // Look up in ID card table
  const card = await prisma.idCard.findUnique({
    where: { cardNumber: cardId },
  });

  const isValid = card && card.status === 'ACTIVE';

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 bg-warm-50 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          
          <div className="mb-6">
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Verify another ID</span>
            </Link>
          </div>

          {isValid ? (
            /* VALID CREDENTIAL CARD */
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl animate-in zoom-in-95 duration-200">
              
              {/* Green Verified Header Banner */}
              <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-extrabold uppercase tracking-wide font-heading">
                  Verified Trust Credential
                </h2>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-emerald-100 uppercase tracking-wider">
                  Status: ACTIVE & VALID
                </span>
              </div>

              {/* Organization and Card Details */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Organization Seal */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1 border border-gold-400 shadow-sm">
                      <Image src="/logo.png" alt="Trust Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-950 uppercase leading-tight font-heading">
                        Nipania Vikash Seva Trust
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Registered Public Trust
                      </span>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-gold-600" />
                </div>

                {/* Profile Photo & Name Spotlight */}
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 p-6 rounded-3xl border border-gold-400/40 text-white shadow-xl relative overflow-hidden">
                  
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#c59b27_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

                  <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-navy-950 border-2 border-gold-400 shrink-0 shadow-lg relative z-10 flex items-center justify-center">
                    {card.photoUrl ? (
                      <Image
                        src={card.photoUrl}
                        alt={card.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gold-400 bg-navy-900 p-2">
                        <User className="w-10 h-10 mb-1" />
                        <span className="text-[8px] uppercase tracking-wider text-slate-300 font-bold">Official Pass</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left relative z-10">
                    <span className="text-[9px] font-extrabold text-gold-400 uppercase tracking-widest block">
                      Verified Trust Cardholder
                    </span>
                    <h3 className="text-2xl font-extrabold text-white font-heading leading-tight">
                      {card.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500 text-navy-950 shadow-xs">
                        {card.role}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-navy-900 text-gold-300 border border-gold-400/40 uppercase">
                        {card.personType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Table */}
                <div className="divide-y divide-slate-100 text-xs space-y-2 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-semibold">Official Credential ID:</span>
                    <span className="font-mono font-extrabold text-navy-950 text-sm tracking-wide bg-white px-2 py-0.5 rounded border border-slate-200">{card.cardNumber}</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-semibold">Issue Date:</span>
                    <span className="text-slate-800 font-medium">{formatDate(card.issueDate)}</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-semibold">Validity Status:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">Valid Until {formatDate(card.validUntil)}</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-semibold">Issuer Authority:</span>
                    <span className="text-navy-950 font-bold">Nipania Vikash Seva Trust</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-warm-50 border border-gold-300/60 text-[11px] text-slate-700 text-center flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>This digital credential is authenticated in real-time by the central registry of Nipania Vikash Seva Trust.</span>
                </div>

              </div>

            </div>
          ) : (
            /* INVALID / NOT FOUND STATE */
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-rose-300 shadow-xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-rose-700 font-heading">
                  Invalid / Unverified ID
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Card Reference: <strong>{cardId}</strong>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                No active credential with this ID number was found in the official registry of Nipania Vikash Seva Trust, or the credential has expired/been revoked.
              </p>

              <div className="pt-4">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>Try Another ID Search</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
