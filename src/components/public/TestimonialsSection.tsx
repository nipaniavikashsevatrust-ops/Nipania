'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Flood Relief Beneficiary',
    location: 'Jharkhand',
    testimonial: 'When the floods destroyed everything we had, Nipania Trust was there within hours. Their team provided food, medicine, and shelter. They gave us hope when we had lost everything.',
    avatar: 'RK',
  },
  {
    name: 'Dr. Priya Sharma',
    role: 'Medical Volunteer',
    location: 'Balrampur',
    testimonial: 'As a medical volunteer with Nipania Trust, I have witnessed their incredible dedication to serving rural communities. Their mobile health camps reach villages that have never seen a doctor.',
    avatar: 'PS',
  },
  {
    name: 'Sunita Devi',
    role: 'Village Sarpanch',
    location: 'Uttar Pradesh',
    testimonial: 'The education kits provided by Nipania Trust have changed our village. 50+ children now have books, uniforms, and hope for a better future. Their work is truly transformational.',
    avatar: 'SD',
  },
  {
    name: 'Amit Singh',
    role: 'Monthly Donor',
    location: 'Delhi',
    testimonial: 'I have been donating to Nipania Trust for 3 years. Their transparency and direct impact on communities is remarkable. Every rupee makes a real difference.',
    avatar: 'AS',
  },
  {
    name: 'Meera Verma',
    role: 'CSR Partner',
    location: 'Mumbai',
    testimonial: 'Working as a corporate partner with Nipania Trust has shown me what true humanitarian work looks like. Exceptional organization with measurable impact.',
    avatar: 'MV',
  },
  {
    name: 'Ramesh Yadav',
    role: 'Small Farmer',
    location: 'Rural Cluster',
    testimonial: 'The Kisan Kalyan program helped our farming community with seeds and training. Nipania Trust understands the real problems of small farmers and provides practical solutions.',
    avatar: 'RY',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-br from-[#0c2340] via-[#103460] to-[#0c2340] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-400/20 border border-gold-400/40 text-gold-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Quote className="w-3.5 h-3.5" />
            <span>Voices of Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            What People Say About Us
          </h2>
          <p className="text-sm text-blue-100/80">
            Hear from the communities we serve and partners who support our mission
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <div className="bg-[#0f2d52]/80 backdrop-blur-xl border border-gold-400/30 rounded-3xl p-8 sm:p-12 shadow-2xl">
            
            {/* Quote Icon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <Quote className="w-6 h-6 text-slate-950" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-6 pt-4">
              <p className="text-lg sm:text-xl text-blue-50 leading-relaxed italic max-w-3xl mx-auto">
                "{currentTestimonial.testimonial}"
              </p>

              {/* Avatar and Info */}
              <div className="flex flex-col items-center gap-3 pt-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg border-2 border-white/20">
                  {currentTestimonial.avatar}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-sm text-blue-200/80">
                    {currentTestimonial.role}
                  </p>
                  <p className="text-xs text-gold-400 font-medium mt-0.5">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between items-center px-4 sm:-mx-16">
            <button
              onClick={goToPrevious}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0c2340]/90 border border-gold-400/40 hover:border-gold-300 text-gold-300 flex items-center justify-center transition-all shadow-lg backdrop-blur-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0c2340]/90 border border-gold-400/40 hover:border-gold-300 text-gold-300 flex items-center justify-center transition-all shadow-lg backdrop-blur-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlaying(false);
              }}
              className={`transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-gold-400 rounded-full'
                  : 'w-2 h-2 bg-navy-700 hover:bg-navy-600 rounded-full'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
