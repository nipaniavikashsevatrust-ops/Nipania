'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'Is Nipania Vikash Seva Trust a registered charity?',
    a: 'Yes. Nipania Vikash Seva Trust is a registered Indian non-governmental organization (Govt. Regd IV-120/2022) operating with full transparency on fund utilization and enrolled with NITI Aayog Darpan.',
  },
  {
    q: 'Do my donations get 80G tax exemption?',
    a: 'Yes. Nipania Vikash Seva Trust is registered under Section 80G of the Income Tax Act, so eligible donations qualify for tax exemption in India. You receive a tax-deductible receipt by email after your donation is processed.',
  },
  {
    q: 'How can I volunteer with Nipania Trust?',
    a: 'Visit the Volunteer page and submit your details. We respond within a few working days with open roles and field opportunities that best match your skills and location.',
  },
  {
    q: 'Where does my donation actually go?',
    a: 'Every donation funds a specific outcome — meals served, medical camps conducted, education kits distributed, shelter and rehabilitation for disaster-affected families. You can earmark your contribution to a specific campaign, and we publish utilization updates.',
  },
  {
    q: 'How can companies partner or contribute CSR funds?',
    a: 'We work with corporate partners on CSR projects across disaster relief, community kitchens, sanitation drives and rural healthcare. Contact us through the Contact page or write to the trust, and our partnerships team will reach out within 2 business days.',
  },
  {
    q: 'When do I receive my official donation receipt?',
    a: 'Instantly! Your signed and stamped Section 80G PDF receipt is generated immediately upon payment completion, and a copy is dispatched to your email address automatically.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-warm-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-700 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-gold-600" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Common questions about Nipania Trust, donations, and how to get involved
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left group"
                >
                  <span className="text-sm sm:text-base font-bold text-navy-950 group-hover:text-gold-700 transition-colors flex-1">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gold-600 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Can't find what you're looking for?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-md transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
