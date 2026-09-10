'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
import AnnouncementBar from '@/components/public/AnnouncementBar';
import EmergencyBanner from '@/components/public/EmergencyBanner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import DirectDonationSection from '@/components/public/DirectDonationSection';
import Section80GCertificate, { Section80GTrustMeta } from '@/components/common/Section80GCertificate';
import { useToast } from '@/components/common/Toast';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Printer,
  ArrowRight,
  RefreshCw,
  Sparkles,
  QrCode,
  CreditCard,
  Copy,
  Check,
  Mail,
  Share2,
  HelpCircle,
  Award,
  BookOpen,
  Activity,
  Users,
  Building2,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  HandHeart,
  Home,
  Utensils,
  GraduationCap,
  Droplet,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

// Standard preset donation amounts
const PRESET_AMOUNTS = [500, 750, 1200, 1500, 2500, 5000];

// Active Causes & Targeted Campaigns
const CAMPAIGN_OPTIONS = [
  'General Social Welfare Fund',
  'Emergency Flood & Disaster Relief 2026',
  'Project Annapurna: Daily Community Food Kitchen',
  'Health on Wheels: Rural Mobile Medical Clinic',
  'Project Vidya Daan: Girl Child Education',
  'Kisan Kalyan: Marginal Farmer Livelihood Drive',
  'Winter Warmth: Heavy Blanket & Woolen Distribution',
];

// Cause Sponsorship Tiers (From /sponsor)
const SPONSORSHIP_OPTIONS = [
  'Sponsorship: Feed 6 Daily Wage Laborers',
  'Sponsorship: Feed 12 People Group',
  'Sponsorship: Community Langar (30 People)',
  'Sponsorship: Seva Kitchen for 1 Full Day',
  'Sponsorship: Hygiene Kit for 1 Person',
  'Sponsorship: Hygiene Kit for 3 Women',
  'Sponsorship: Family Sanitation Kit (8 People)',
  'Sponsorship: Village Menstrual Health Drive',
  'Sponsorship: School Bag & Stationeries',
  'Sponsorship: Stitched Uniforms & Shoes',
  "Sponsorship: Child's Full Year Education",
  'Sponsorship: Village Smart Learning Unit',
  'Sponsorship: Elder Healthcare & Medicine Kit',
  'Sponsorship: Eye Screening & Free Spectacles (2 Patients)',
  'Sponsorship: Full Day Rural Mobile Health Camp',
];

// Impact preset cards
const IMPACT_CARDS = [
  {
    title: 'Daily Meal & Nutrition Seva',
    desc: 'Nutritious hot meals prepared and served with dignity to destitute elderly and vulnerable families.',
    suggestedAmount: 750,
    impactLabel: 'Feeds 5 people for 2 days',
    icon: Utensils,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    title: 'Emergency Medical & Health Camp',
    desc: 'Free clinical doctor consultations, pediatric diagnostics, and vital prescription medicines.',
    suggestedAmount: 1500,
    impactLabel: 'Medicine kits for 3 elderly patients',
    icon: Activity,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Child Education & Learning Kits',
    desc: 'School uniforms, learning bags, textbooks, and daily remedial tutoring for rural students.',
    suggestedAmount: 2500,
    impactLabel: 'Supports 1 child education for 3 months',
    icon: GraduationCap,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    title: 'Emergency Flood Relief Pack',
    desc: 'Heavy-duty tarpaulins, dry ration kits, water purification drops, and essential sanitation goods.',
    suggestedAmount: 5000,
    impactLabel: 'Complete family emergency relief kit',
    icon: Droplet,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
];

function DonationPortalContent() {
  const searchParams = useSearchParams();
  const initialAmount = searchParams.get('amount');
  const initialCampaign = searchParams.get('campaign') || searchParams.get('project') || '';
  const initialType = searchParams.get('type');
  const isSponsorshipParam = searchParams.get('isSponsorship') === 'true';

  const computeInitialCause = () => {
    if (!initialCampaign) return 'General Social Welfare Fund';
    if (initialCampaign.startsWith('Sponsorship:')) return initialCampaign;
    if (isSponsorshipParam) return `Sponsorship: ${initialCampaign}`;
    return initialCampaign;
  };

  // Core Form State
  const [frequency, setFrequency] = useState<'ONE_TIME' | 'MONTHLY'>(
    initialType === 'MONTHLY' ? 'MONTHLY' : 'ONE_TIME'
  );
  const [mandateRail, setMandateRail] = useState<'UPI_AUTOPAY' | 'CARD_MANDATE' | 'NETBANKING_ENACH'>('UPI_AUTOPAY');
  const [amount, setAmount] = useState<number>(initialAmount ? parseInt(initialAmount) || 750 : 750);
  const [customAmount, setCustomAmount] = useState(
    initialAmount && !PRESET_AMOUNTS.includes(parseInt(initialAmount)) ? initialAmount : ''
  );
  const [supportTipPercent, setSupportTipPercent] = useState<number>(12); // SikhAid inspired tip selector
  const [selectedCampaign, setSelectedCampaign] = useState<string>(computeInitialCause());

  // Payment mode toggle
  // Payment mode removed - always online payment
  const paymentMode = 'ONLINE';

  // Donor form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    address: '',
  });

  // Offline transfer details
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Status & Success
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedDonation, setCompletedDonation] = useState<any>(null);
  
  // Toast notification system
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  // Trust & Payment Config
  const [paymentConfig, setPaymentConfig] = useState({
    gatewayEnabled: true,
    provider: 'RAZORPAY',
    mode: 'TEST',
    keyId: '',
    upiId: 'nipaniatrust@upi',
    upiPayeeName: 'Nipania Vikash Seva Trust',
    upiQrImage: '/qr.png',
    bankAccountName: 'Nipania Vikash Seva Trust',
    bankAccountNumber: '921020010268306',
    bankIfsc: 'UTIB0003025',
    bankName: 'Axis Bank',
    branchName: 'Balrampur Branch',
  });

  useEffect(() => {
    fetch('/api/payment')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setPaymentConfig((prev) => ({
            ...prev,
            ...data.settings,
          }));
          // Payment mode is always online now - gateway check removed
        }
      })
      .catch((err) => console.warn('Payment settings fallback:', err));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTrustMeta(data.settings);
        }
      })
      .catch((err) => console.warn('Trust settings fetch fallback:', err));
  }, []);

  const [trustMeta, setTrustMeta] = useState<Section80GTrustMeta | undefined>(undefined);

  // Update selected campaign if URL changes
  useEffect(() => {
    if (initialCampaign) {
      const formatted = initialCampaign.startsWith('Sponsorship:')
        ? initialCampaign
        : isSponsorshipParam
        ? `Sponsorship: ${initialCampaign}`
        : initialCampaign;
      setSelectedCampaign(formatted);
    }
  }, [initialCampaign, isSponsorshipParam]);

  // Calculations
  const tipAmount = supportTipPercent > 0 ? Math.round((amount * supportTipPercent) / 100) : 0;
  const totalPayable = amount + tipAmount;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
      setError('');
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showSuccess(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Online Razorpay Payment Trigger
  const handleOnlineDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (totalPayable <= 0) {
      const msg = 'Please select or enter a valid donation amount.';
      setError(msg);
      showError(msg);
      return;
    }
    if (!formData.name.trim()) {
      const msg = 'Please enter your full name.';
      setError(msg);
      showError(msg);
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    showInfo('Initializing secure payment gateway...');

    try {
      // 1. Create Order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPayable,
          currency: 'INR',
          donorName: formData.name.trim(),
          donorEmail: formData.email.trim() || 'donor@nipaniatrust.org',
          donorPhone: formData.phone.trim(),
          donorPan: formData.pan.trim().toUpperCase() || undefined,
          donorAddress: formData.address.trim() || undefined,
          projectTitle: selectedCampaign,
          frequency,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order. Please try again.');
      }

      // Ensure Razorpay SDK is loaded
      const isSdkLoaded = await loadRazorpaySDK();
      if (!isSdkLoaded || typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Razorpay secure checkout SDK could not be loaded. Please check your internet connection.');
      }

      const activeOrderId = orderData.orderId || orderData.order?.id;
      const activeAmount = orderData.amount || orderData.order?.amount || Math.round(totalPayable * 100);

      const isMonthly = frequency === 'MONTHLY';

      // 2. Open Razorpay Modal with e-Mandate / Subscriptions support for Monthly Supporters
      const options: any = {
        key: orderData.keyId,
        name: orderData.merchantName || 'Nipania Vikash Seva Trust',
        description: isMonthly
          ? `Monthly Supporter e-Mandate: ${selectedCampaign}`
          : `Donation: ${selectedCampaign}`,
        image: '/logo.png',
        recurring: isMonthly ? 1 : undefined,
        notes: {
          frequency,
          mandate_type: isMonthly ? 'MONTHLY_E_MANDATE' : 'ONE_TIME',
          mandate_rail: isMonthly ? mandateRail : 'STANDARD',
          is_mandate: isMonthly ? 'true' : 'false',
          campaign: selectedCampaign,
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#0B192C',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_subscription_id: response.razorpay_subscription_id || orderData.subscriptionId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donorName: formData.name,
                donorEmail: formData.email,
                donorPhone: formData.phone,
                donorPan: formData.pan,
                donorAddress: formData.address,
                amount: totalPayable,
                projectTitle: selectedCampaign,
                frequency,
                type: frequency,
                isMandate: isMonthly,
                mandateRail,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              showSuccess('Payment verified successfully! Thank you for your donation.');
              setCompletedDonation({
                donationId: verifyData.donation.donationId,
                amount: totalPayable,
                donorName: formData.name,
                donorEmail: formData.email,
                projectTitle: selectedCampaign,
                paymentId: response.razorpay_payment_id,
                paymentMethod: isMonthly 
                  ? `ONLINE (E-MANDATE / ${mandateRail.replace('_', ' ')})` 
                  : 'ONLINE (RAZORPAY)',
                receiptSent: verifyData.donation.receiptSent,
                type: frequency,
                isMandate: isMonthly,
                mandateRail,
              });
            } else {
              const msg = verifyData.error || 'Payment verification failed.';
              setError(msg);
              showError(msg);
            }
          } catch (vErr: any) {
            const msg = vErr.message || 'Error verifying payment.';
            setError(msg);
            showError(msg);
          } finally {
            setLoading(false);
          }
        },
      };

      // Set subscription_id for dedicated e-Mandate flow, or order_id for standard flow
      if (orderData.subscriptionId) {
        options.subscription_id = orderData.subscriptionId;
      } else {
        options.order_id = activeOrderId;
        options.amount = activeAmount;
        options.currency = orderData.currency || orderData.order?.currency || 'INR';
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        const msg = resp.error?.description || 'Payment transaction failed.';
        setError(msg);
        showError(msg);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      const msg = err.message || 'Failed to initiate online payment.';
      setError(msg);
      showError(msg);
      setLoading(false);
    }
  };

  // Offline Direct Transfer Submission
  const handleOfflineDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (totalPayable <= 0) {
      const msg = 'Please select or enter a valid donation amount.';
      setError(msg);
      showError(msg);
      return;
    }
    if (!formData.name.trim()) {
      const msg = 'Please enter your full name.';
      setError(msg);
      showError(msg);
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      const msg = 'Please enter your mobile number.';
      setError(msg);
      showError(msg);
      return;
    }
    if (!utrNumber.trim()) {
      const msg = 'Please enter the Bank UTR or Transaction Reference number.';
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    showInfo('Recording your bank transfer...');

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: formData.name.trim(),
          donorEmail: formData.email.trim() || 'donor@nipaniatrust.org',
          donorPhone: formData.phone.trim(),
          donorPan: formData.pan.trim().toUpperCase() || undefined,
          donorAddress: formData.address.trim() || undefined,
          amount: totalPayable,
          paymentMethod: 'DIRECT_BANK_TRANSFER',
          paymentId: utrNumber.trim(),
          projectTitle: selectedCampaign,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record donation.');
      }

      showSuccess('Bank transfer recorded successfully! Thank you for your donation.');
      setCompletedDonation({
        donationId: data.donation.donationId,
        amount: totalPayable,
        donorName: formData.name,
        donorEmail: formData.email,
        projectTitle: selectedCampaign,
        paymentId: utrNumber,
        paymentMethod: 'DIRECT_BANK_TRANSFER',
        receiptSent: data.donation.receiptSent,
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to record your bank transfer. Please contact support.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // PDF Handlers
  const downloadReceipt = async () => {
    if (!completedDonation?.donationId) return;
    setDownloadLoading(true);
    showInfo('Preparing your 80G receipt for download...');
    try {
      const res = await fetch(`/api/donations/${completedDonation.donationId}/receipt`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nipania_Trust_80G_Receipt_${completedDonation.donationId}.pdf`;
        a.click();
        showSuccess('80G Receipt downloaded successfully!');
      } else {
        showError('Failed to download receipt. Please try again.');
      }
    } catch (err) {
      console.error('Download failed:', err);
      showError('Download error. Please check your connection.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const printReceipt = () => {
    if (!completedDonation?.donationId) return;
    setPrintLoading(true);
    window.print();
    showInfo('Print dialog opened');
    // Reset loading after a brief delay (print dialog handling)
    setTimeout(() => setPrintLoading(false), 1000);
  };

  // SUCCESS SCREEN
  if (completedDonation) {
    const isMonthlyMandate = completedDonation.type === 'MONTHLY' || completedDonation.isMandate;

    return (
      <>
        {/* On-Screen Donation Success Voucher (Hidden during print) */}
        <div className="no-print flex flex-col min-h-screen bg-slate-50">
          <AnnouncementBar />
          <Navbar />

        <main className="flex-1 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
              
              {/* Success Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-8 py-12 text-center text-white space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                {isMonthlyMandate ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-gold-300" />
                      <span>Monthly Supporter e-Mandate Active</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black font-heading">
                      Monthly Supporter Mandate Authorized!
                    </h1>
                    <p className="text-emerald-100 text-base max-w-xl mx-auto">
                      Dear <strong>{completedDonation.donorName}</strong>, your monthly recurring e-mandate of{' '}
                      <strong className="text-white underline">{formatCurrency(completedDonation.amount)}/month</strong> has been authorized via RBI Autopay. Your initial installment has been received.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl font-black font-heading">
                      Thank You for Your Generosity!
                    </h1>
                    <p className="text-emerald-100 text-base max-w-xl mx-auto">
                      Dear <strong>{completedDonation.donorName}</strong>, your noble contribution of{' '}
                      <strong className="text-white underline">{formatCurrency(completedDonation.amount)}</strong> directly empowers rural families in need.
                    </p>
                  </>
                )}
              </div>

              {/* Donation Details Voucher */}
              <div className="p-6 sm:p-10 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 font-bold uppercase">
                      {isMonthlyMandate ? 'Monthly Installment Amount' : 'Donation Amount'}
                    </span>
                    <strong className="text-2xl font-black text-emerald-800 font-mono">
                      {formatCurrency(completedDonation.amount)}{isMonthlyMandate ? '/mo' : ''}
                    </strong>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[10px]">Receipt ID:</span>
                      <span className="font-mono font-black text-navy-950 text-sm">{completedDonation.donationId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[10px]">Payment Mode / Mandate:</span>
                      <span className="font-bold text-navy-950">{completedDonation.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[10px]">Cause / Purpose:</span>
                      <span className="font-bold text-navy-950">{completedDonation.projectTitle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[10px]">80G Tax Exemption:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Eligible (50% Tax Deduction)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Legal Statement */}
                <div className="bg-gradient-to-r from-amber-50/90 via-warm-50 to-orange-50/80 text-slate-800 rounded-2xl p-6 space-y-2 border border-amber-300 shadow-sm">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Official Section 80G Certification</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nipania Vikash Seva Trust (PAN: AAFTN4004N, 80G Reg: AAFTN4004NF20214) has issued your official digitally signed A4 Tax Exemption certificate. You can print or download the PDF certificate below.
                  </p>
                </div>

                {/* Primary Action Buttons (Print & Download) */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={printReceipt}
                    disabled={printLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {printLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-slate-900 animate-spin" />
                        <span>Preparing Print...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4 text-slate-900" />
                        <span>Print 80G Official Receipt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadReceipt}
                    disabled={downloadLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold bg-gold-400 hover:bg-gold-300 text-navy-950 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Downloading PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF Certificate</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setCompletedDonation(null);
                      setUtrNumber('');
                    }}
                    className="text-xs font-bold text-navy-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Make another donation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>

        <Footer />
        </div>

        {/* Official Section 80G Tax Exemption Certificate (Triggered via native window.print()) */}
        <div className="receipt-print-area hidden print:block">
          <Section80GCertificate donation={completedDonation} trustMeta={trustMeta} />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <AnnouncementBar />
      <EmergencyBanner />
      <Navbar />

      <main className="flex-1">
        
        {/* Hero Form Section (SikhAid Inspired) */}
        <section className="py-12 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* Header copy */}
            <div className="text-center space-y-3 mb-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-400/20 text-gold-900 border border-gold-400/30">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>100% Transparent Seva</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-navy-950 font-heading tracking-tight">
                Quick Online Donation
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                Your contribution directly funds life-saving emergency relief, nutritious meals, child education, and rural healthcare. 50% tax deductible under Section 80G.
              </p>
            </div>

            {/* Main Donation Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-navy-950 via-gold-500 to-navy-950" />

              <div className="p-4 sm:p-6 sm:p-10 space-y-5 sm:space-y-6">
                
                {/* 1. Frequency Toggle (One-Time vs Monthly) */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setFrequency('ONE_TIME')}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                      frequency === 'ONE_TIME'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>One-Time Contribution</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('MONTHLY')}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                      frequency === 'MONTHLY'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Monthly Supporter</span>
                  </button>
                </div>

                {/* Monthly e-Mandate Info Box */}
                {frequency === 'MONTHLY' && (
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200/90 rounded-2xl space-y-2.5 animate-in fade-in duration-200 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-blue-950">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Monthly Supporter e-Mandate (UPI Autopay & Card Standing Instruction)</span>
                      </div>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 shrink-0">
                        RBI Compliant
                      </span>
                    </div>
                    <p className="text-xs text-blue-900/90 leading-relaxed">
                      Your monthly donation of <strong>{formatCurrency(totalPayable)}</strong> is authorized once via secure <strong>e-Mandate / UPI Autopay</strong>. Future installments debit automatically every month without manual hassle. You maintain complete control and can pause, edit, or cancel the mandate anytime from your UPI or banking app.
                    </p>
                    {/* Interactive Mandate Method Selector */}
                    <div className="pt-2 border-t border-blue-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase text-blue-950 tracking-wider block">
                          Choose Mandate Authorization Rail:
                        </label>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                          ₹0 Setup Fee
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setMandateRail('UPI_AUTOPAY')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            mandateRail === 'UPI_AUTOPAY'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white/80 text-blue-950 border-blue-200 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-black flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>⚡</span>
                              <span>UPI Autopay</span>
                            </span>
                            {mandateRail === 'UPI_AUTOPAY' && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${mandateRail === 'UPI_AUTOPAY' ? 'text-amber-100' : 'text-slate-500'}`}>
                            GPay, PhonePe, Paytm, BHIM
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMandateRail('CARD_MANDATE')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            mandateRail === 'CARD_MANDATE'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white/80 text-blue-950 border-blue-200 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-black flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>💳</span>
                              <span>Card Standing</span>
                            </span>
                            {mandateRail === 'CARD_MANDATE' && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${mandateRail === 'CARD_MANDATE' ? 'text-amber-100' : 'text-slate-500'}`}>
                            Visa, Mastercard, RuPay Cards
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMandateRail('NETBANKING_ENACH')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            mandateRail === 'NETBANKING_ENACH'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white/80 text-blue-950 border-blue-200 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-black flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>🏛️</span>
                              <span>Netbanking e-NACH</span>
                            </span>
                            {mandateRail === 'NETBANKING_ENACH' && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${mandateRail === 'NETBANKING_ENACH' ? 'text-amber-100' : 'text-slate-500'}`}>
                            Direct Bank Authorization
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-blue-950">
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200/80 flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Zero manual reminders</span>
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200/80 flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Monthly 80G tax receipt on email</span>
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200/80 flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Cancel anytime in 1-click</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Target Campaign & Sponsorship Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                      Choose Designated Campaign or Sponsorship Cause:
                    </label>
                    {selectedCampaign.startsWith('Sponsorship:') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/50">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Cause Sponsorship</span>
                      </span>
                    )}
                  </div>

                  {selectedCampaign.startsWith('Sponsorship:') && (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0">🤝</span>
                        <div>
                          <p className="font-bold text-emerald-950">
                            Designated Cause: <span className="underline decoration-emerald-500 font-extrabold">{selectedCampaign.replace('Sponsorship: ', '')}</span>
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            100% of your contribution directly funds this verified outcome on the ground.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/sponsor"
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0"
                      >
                        Change Tier
                      </Link>
                    </div>
                  )}

                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-navy-950 focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all"
                  >
                    {!CAMPAIGN_OPTIONS.includes(selectedCampaign) && !SPONSORSHIP_OPTIONS.includes(selectedCampaign) && (
                      <optgroup label="📌 Selected Initiative">
                        <option value={selectedCampaign}>{selectedCampaign}</option>
                      </optgroup>
                    )}
                    <optgroup label="🌟 Relief Campaigns & Community Funds">
                      {CAMPAIGN_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🤝 Cause Sponsorships (Tangible Outcomes)">
                      {SPONSORSHIP_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 3. Donation Amount Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                    Select Donation Amount (INR ₹):
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountSelect(preset)}
                        className={`py-3 rounded-xl text-sm font-black transition-all border ${
                          amount === preset && !customAmount
                            ? 'bg-navy-950 text-gold-400 border-navy-950 shadow-md ring-2 ring-gold-400/40'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        ₹{preset.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>

                  {/* Custom Rupee Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="100"
                      max="5000000"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Or enter custom contribution amount (e.g. 3500)"
                      className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-navy-950 focus:ring-2 focus:ring-navy-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 4. Voluntary Operational Support Tip (SikhAid Inspired) */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <strong className="text-xs font-bold text-navy-950 block">
                      Support Nipania Trust Volunteer Operations
                    </strong>
                    <p className="text-[11px] text-slate-600">
                      Help cover volunteer travel, field fuel, and logistics without touching relief funds.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[
                      { label: '0%', val: 0 },
                      { label: '5%', val: 5 },
                      { label: '12%', val: 12 },
                      { label: '18%', val: 18 },
                    ].map((t) => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setSupportTipPercent(t.val)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          supportTipPercent === t.val
                            ? 'bg-amber-500 text-navy-950 border-amber-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Donor Information Inputs */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                    Donor Details (For Section 80G Tax Exemption Receipt):
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Full Name (as per PAN) *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-navy-950 focus:bg-white focus:ring-2 focus:ring-navy-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-Digit Mobile Number *"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-navy-950 focus:bg-white focus:ring-2 focus:ring-navy-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address (To receive 80G PDF receipt) *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-navy-950 focus:bg-white focus:ring-2 focus:ring-navy-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="PAN Number (Optional, for Form 10BE tax benefit)"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-navy-950 uppercase focus:bg-white focus:ring-2 focus:ring-navy-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment mode removed - direct online payment only */}
                
                {/* Removed offline payment option - keeping conditional check for compatibility */}
                {false && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <strong className="text-sm font-bold text-navy-950 block">
                        Step 1: Transfer Directly to Nipania Trust
                      </strong>
                      <p className="text-xs text-slate-500">
                        Scan our UPI QR code or transfer via NEFT/IMPS:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Account Number</span>
                        <div className="flex justify-between items-center">
                          <strong className="font-mono text-sm text-navy-950">{paymentConfig.bankAccountNumber}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentConfig.bankAccountNumber, 'acc')}
                            className="text-gold-700 text-[11px] font-bold"
                          >
                            {copiedField === 'acc' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">IFSC Code</span>
                        <div className="flex justify-between items-center">
                          <strong className="font-mono text-sm text-navy-950">{paymentConfig.bankIfsc}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentConfig.bankIfsc, 'ifsc')}
                            className="text-gold-700 text-[11px] font-bold"
                          >
                            {copiedField === 'ifsc' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <strong className="text-sm font-bold text-navy-950 block">
                        Step 2: Enter Transaction UTR / Reference ID:
                      </strong>
                      <input
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="Enter 12-digit UTR or Payment Reference (e.g. 423987123456) *"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono text-navy-950 focus:ring-2 focus:ring-navy-900"
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                    {error}
                  </div>
                )}

                {/* Total Summary & Main Donate CTA Button */}
                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-center px-2 text-xs font-semibold text-slate-600">
                    <span>
                      Donation: <strong>₹{amount.toLocaleString('en-IN')}</strong>
                      {tipAmount > 0 && <span> + Support Tip: <strong>₹{tipAmount}</strong></span>}
                    </span>
                    <span className="text-base font-black text-navy-950 font-mono">
                      Total: ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {(() => {
                    const isFormComplete = Boolean(
                      formData.name.trim() &&
                      formData.phone.trim().length >= 10 &&
                      formData.email.trim() &&
                      formData.email.includes('@') &&
                      totalPayable > 0
                    );

                    return (
                      <>
                        <button
                          type="button"
                          disabled={loading || !isFormComplete}
                          onClick={paymentMode === 'ONLINE' ? handleOnlineDonation : handleOfflineDonation}
                          className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-sm sm:text-base font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-950 shrink-0" />
                              <span>Processing Contribution...</span>
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 text-slate-950 shrink-0" />
                              <span className="truncate">
                                {paymentMode === 'ONLINE'
                                  ? frequency === 'MONTHLY'
                                    ? `Authorize e-Mandate • ₹${totalPayable.toLocaleString('en-IN')}/mo`
                                    : `Donate Now • ₹${totalPayable.toLocaleString('en-IN')}`
                                  : `Submit Transfer • ₹${totalPayable.toLocaleString('en-IN')}`}
                              </span>
                            </>
                          )}
                        </button>
                        {!isFormComplete && (
                          <p className="text-[11px] text-center text-slate-400">
                            Please fill in your name, 10-digit mobile number, and valid email above to activate donation.
                          </p>
                        )}
                      </>
                    );
                  })()}

                  {/* Trust Badges under button */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[10px] sm:text-[11px] font-bold text-slate-600 text-center">
                    <span className="flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{frequency === 'MONTHLY' ? 'RBI e-Mandate' : 'Registered NGO'}</span>
                    </span>
                    <span className="flex items-center justify-center gap-1">
                      <Award className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>80G Tax Benefit</span>
                    </span>
                    <span className="flex items-center justify-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-navy-950 shrink-0" />
                      <span>{frequency === 'MONTHLY' ? 'Cancel Anytime' : 'Secure Gateway'}</span>
                    </span>
                    <span className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Transparent</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 2. Choose Your Impact (SikhAid Inspired) */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-2 mb-12">
              <span className="text-xs font-bold text-gold-800 uppercase tracking-widest">
                Targeted Giving
              </span>
              <h2 className="text-3xl font-extrabold text-navy-950 font-heading">
                Choose Your Impact
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Every rupee is stewarded directly into tangible field outcomes with full photo updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {IMPACT_CARDS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-4 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-2xl border ${card.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-navy-950 font-heading">
                          {card.title}
                        </h3>
                        <span className="text-xs font-semibold text-emerald-700">
                          {card.impactLabel}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="font-mono text-lg font-extrabold text-navy-950">
                        ₹{card.suggestedAmount.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleAmountSelect(card.suggestedAmount);
                          window.scrollTo({ top: 150, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-navy-950 group-hover:text-gold-700 transition-colors"
                      >
                        <span>Select This Impact</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Direct Bank & QR Transfer Section */}
        <DirectDonationSection />

        {/* 4. Complete Transparency & Fund Allocation (SikhAid Inspired) */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gold-800 uppercase tracking-widest">
                    Accountability
                  </span>
                  <h2 className="text-3xl font-extrabold text-navy-950 font-heading">
                    How We Utilize Every Donation
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    We maintain stringent financial audits and publish public utilization reports to guarantee that maximum relief reaches on-ground beneficiaries.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-semibold text-navy-950">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Emergency Disaster & Food Relief</span>
                      <span className="text-emerald-700">45%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full w-[45%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Rural Health Camps & Mobile Clinic</span>
                      <span className="text-blue-700">25%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full w-[25%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Child Education & Girl Student Kits</span>
                      <span className="text-purple-700">18%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full w-[18%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Farmer Assistance & Winter Blankets</span>
                      <span className="text-amber-700">12%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[12%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Callout Card */}
              <div className="bg-gradient-to-br from-[#0c2340] to-[#0f3460] text-white p-8 sm:p-10 rounded-3xl space-y-6 shadow-2xl border-2 border-gold-400/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/15 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-2xl font-black font-heading text-white">
                  Why Donate to Nipania Vikash Seva Trust?
                </h3>
                <ul className="space-y-4 text-xs sm:text-sm text-blue-100/90">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white block font-heading">100% Transparent Utilization:</strong> Every rupee is accounted for with zero hidden middleman fees.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white block font-heading">50% Income Tax Exemption (80G):</strong> Instant digitally signed Section 80G tax certificate issued on donation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white block font-heading">Ground-Level Execution:</strong> Our volunteer teams live in and understand the local communities they serve.
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-navy-900 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading Donation Portal...</p>
          </div>
        </div>
      }
    >
      <DonationPortalContent />
    </Suspense>
  );
}
