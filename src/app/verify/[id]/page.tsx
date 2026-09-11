import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import prisma from '@/lib/prisma';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  ArrowLeft, 
  User, 
  Award, 
  Download, 
  FileText,
  AlertTriangle 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function VerifyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rawLookup = decodeURIComponent(params.id).trim();
  const upperLookup = rawLookup.toUpperCase();
  const altNvstLookup = upperLookup.replace(/^HRMEWT-CERT-/i, 'NVST-CERT-').replace(/^NVS-CERT-/i, 'NVST-CERT-');
  const altHrmewtLookup = upperLookup.replace(/^NVST-CERT-/i, 'HRMEWT-CERT-');

  // 1. Look up Certificate in database (Priority 1)
  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: upperLookup },
        { certificateNumber: altNvstLookup },
        { certificateNumber: altHrmewtLookup },
        { certificateNumber: rawLookup },
        { verificationCode: upperLookup },
        { verificationCode: rawLookup },
        { id: rawLookup },
      ],
    },
    include: {
      event: { select: { title: true } },
      project: { select: { title: true } },
    },
  });

  // 2. Look up ID Card in database (Priority 2)
  const card = !certificate
    ? await prisma.idCard.findFirst({
        where: {
          OR: [
            { cardNumber: upperLookup },
            { cardNumber: rawLookup },
            { id: rawLookup },
          ],
        },
      })
    : null;

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
              <span>Verify another ID or Certificate</span>
            </Link>
          </div>

          {/* ======================================================== */}
          {/* CASE A: CERTIFICATE VERIFICATION RESULT                 */}
          {/* ======================================================== */}
          {certificate ? (
            certificate.status === 'ISSUED' ? (
              /* VALID ISSUED CERTIFICATE */
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-extrabold uppercase tracking-wide font-heading">
                    Verified Trust Certificate
                  </h2>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-emerald-100 uppercase tracking-wider">
                    Status: VALID CERTIFICATE
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Trust Authority Seal */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1 border border-gold-400 shadow-sm shrink-0">
                        <Image src="/logo.png" alt="Trust Logo" fill className="object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-navy-950 uppercase leading-tight font-heading">
                          Nipania Vikash Seva Trust
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Registered Public Charitable Trust • Central Registry
                        </span>
                      </div>
                    </div>
                    <Award className="w-6 h-6 text-gold-600 shrink-0" />
                  </div>

                  {/* Recipient Spotlight */}
                  <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 p-6 rounded-3xl border border-gold-400/40 text-white text-center space-y-2 shadow-xl relative overflow-hidden">
                    <span className="text-[9.5px] font-extrabold text-gold-400 uppercase tracking-widest block">
                      Recognized Recipient
                    </span>
                    <h3 className="text-2xl font-black text-white font-heading uppercase tracking-tight">
                      {certificate.recipientName}
                    </h3>
                    <div className="pt-1">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold-500 text-navy-950">
                        {certificate.title || `Certificate of ${certificate.certificateType.replace(/_/g, ' ')}`}
                      </span>
                    </div>
                  </div>

                  {/* Details Table */}
                  <div className="divide-y divide-slate-100 text-xs space-y-2 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Document Type:</span>
                      <span className="font-bold text-navy-950 uppercase text-right">OFFICIAL RECOGNITION CERTIFICATE</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Certificate Number:</span>
                      <span className="font-mono font-black text-navy-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {certificate.certificateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Issue Date:</span>
                      <span className="text-slate-800 font-medium">{formatDate(certificate.issueDate)}</span>
                    </div>
                    {(certificate.event?.title || certificate.project?.title) && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500 font-semibold">Program / Initiative:</span>
                        <span className="text-amber-900 font-bold text-right">{certificate.event?.title || certificate.project?.title}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Issuer Authority:</span>
                      <span className="text-navy-950 font-bold">Nipania Vikash Seva Trust</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Signatory:</span>
                      <span className="text-slate-800">{certificate.signatoryName || 'Managing Trustee'} ({certificate.signatoryTitle || 'President'})</span>
                    </div>
                  </div>

                  {certificate.description && (
                    <div className="p-3.5 rounded-xl bg-warm-50 border border-gold-200/80 text-[11px] text-slate-700 italic text-center">
                      &ldquo;{certificate.description}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <a
                      href={`/api/certificates/${certificate.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-md transition-all"
                    >
                      <Download className="w-4 h-4 text-gold-400" />
                      <span>Download Official A4 PDF</span>
                    </a>
                  </div>

                  <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    This certificate is an official recognition document issued by Nipania Vikash Seva Trust. Does not confer trusteeship, ownership or voting rights.
                  </div>
                </div>
              </div>
            ) : certificate.status === 'REVOKED' ? (
              /* REVOKED CERTIFICATE ALERT */
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-rose-500 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-rose-700 text-white p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-rose-700 flex items-center justify-center mx-auto shadow-md">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-extrabold uppercase tracking-wide font-heading">
                    Certificate Revoked
                  </h2>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-900 text-rose-100 uppercase tracking-wider">
                    Status: CERTIFICATE REVOKED
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                    <p className="font-bold text-sm text-rose-800">
                      Notice of Revocation &amp; Invalidation
                    </p>
                    <p>
                      Certificate <strong>{certificate.certificateNumber}</strong> previously registered for <strong>{certificate.recipientName}</strong> has been formally revoked and cancelled by Trust Administration.
                    </p>
                    <div className="pt-2 border-t border-rose-200/80 space-y-1">
                      <p><strong>Revoked Date:</strong> {formatDate(certificate.revokedAt)}</p>
                      <p><strong>Official Reason:</strong> {certificate.revocationReason || 'Administrative cancellation'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    This certificate is no longer valid and must not be presented or relied upon as an authentic Trust document.
                  </p>
                </div>
              </div>
            ) : (
              /* DRAFT CERTIFICATE */
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-amber-400 shadow-xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-amber-900 font-heading">
                  Draft Certificate Record
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Certificate <strong>{certificate.certificateNumber}</strong> is currently in internal draft status and has not yet been officially approved or issued.
                </p>
              </div>
            )
          ) : card ? (
            /* ======================================================== */
            /* CASE B: ID CARD VERIFICATION RESULT                     */
            /* ======================================================== */
            card.status === 'ACTIVE' ? (
              /* VALID ACTIVE ID CARD */
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-extrabold uppercase tracking-wide font-heading">
                    Verified Trust Credential
                  </h2>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-emerald-100 uppercase tracking-wider">
                    Status: VALID {card.personType} ID
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Organization Seal */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1 border border-gold-400 shadow-sm shrink-0">
                        <Image src="/logo.png" alt="Trust Logo" fill className="object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-navy-950 uppercase leading-tight font-heading">
                          Nipania Vikash Seva Trust
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Registered Public Charitable Trust • Central Registry
                        </span>
                      </div>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-gold-600 shrink-0" />
                  </div>

                  {/* Profile Spotlight */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 p-6 rounded-3xl border border-gold-400/40 text-white shadow-xl relative overflow-hidden">
                    <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-navy-950 border-2 border-gold-400 shrink-0 shadow-lg flex items-center justify-center">
                      {card.photoUrl ? (
                        <Image src={card.photoUrl} alt={card.fullName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gold-400 bg-navy-900 p-2">
                          <User className="w-10 h-10 mb-1" />
                          <span className="text-[8px] uppercase tracking-wider text-slate-300 font-bold">Official Pass</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left">
                      <span className="text-[9px] font-extrabold text-gold-400 uppercase tracking-widest block">
                        Verified Associate
                      </span>
                      <h3 className="text-2xl font-extrabold text-white font-heading leading-tight uppercase">
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
                  <div className="divide-y divide-slate-100 text-xs space-y-2 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Official Credential ID:</span>
                      <span className="font-mono font-extrabold text-navy-950 text-sm tracking-wide bg-white px-2 py-0.5 rounded border border-slate-200">
                        {card.cardNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Issue Date:</span>
                      <span className="text-slate-800 font-medium">{formatDate(card.issueDate)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Validity Status:</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                        Valid Until {formatDate(card.validUntil)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">Issuer Authority:</span>
                      <span className="text-navy-950 font-bold">Nipania Vikash Seva Trust</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
                    This card identifies the holder as a volunteer or authorized associate with Nipania Vikash Seva Trust. It does not confer trusteeship, ownership, office-bearer status, or voting rights.
                  </div>
                </div>
              </div>
            ) : (
              /* INACTIVE / SUSPENDED ID CARD */
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-rose-400 shadow-xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-rose-800 font-heading">
                  Credential Suspended / Inactive
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Identity credential <strong>{card.cardNumber}</strong> for <strong>{card.fullName}</strong> is marked as <strong>{card.status}</strong> and is not currently valid for official Trust field activities.
                </p>
              </div>
            )
          ) : (
            /* ======================================================== */
            /* CASE C: NOT FOUND STATE                                 */
            /* ======================================================== */
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-rose-300 shadow-xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-rose-700 font-heading">
                  ID or Certificate Not Found
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Searched: <strong>{rawLookup}</strong>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                No active identity card or official recognition certificate with this number was located in the central verification database of Nipania Vikash Seva Trust.
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
