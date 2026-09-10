import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from '@/components/public/AnnouncementBar';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { 
  BookOpen, 
  Stethoscope, 
  Users2, 
  Baby, 
  Briefcase, 
  Sprout, 
  TreePine, 
  ShieldAlert, 
  Heart,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const PROGRAMS = [
  {
    title: 'Rural Education & Digital Literacy',
    icon: BookOpen,
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    description: 'Providing school kits, stationery, learning aids, and supplementary coaching for first-generation rural school learners.',
    initiatives: [
      'Gramin Shiksha supplementary learning centers',
      'Free school bags, notebooks, and educational kits',
      'Basic computer literacy and digital orientation for youth',
    ],
  },
  {
    title: 'Preventive Healthcare & Medical Camps',
    icon: Stethoscope,
    category: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    description: 'Organizing periodic free diagnostic camps, eye checkup drives, maternal health awareness, and medicine distribution.',
    initiatives: [
      'Multi-specialty primary health checkups in remote villages',
      'Free eye examinations and vision screening',
      'Maternal & child health counseling sessions',
    ],
  },
  {
    title: 'Women Empowerment & Self-Reliance',
    icon: Users2,
    category: 'Livelihood',
    image: '/images/women-empowerment.jpg',
    description: 'Equipping rural women with vocational tailoring skills, handicraft training, and financial literacy to support household self-reliance.',
    initiatives: [
      'Sewing & tailoring vocational training modules',
      'Micro-enterprise formation and collective marketing',
      'Banking and digital savings literacy drives',
    ],
  },
  {
    title: 'Child Welfare & Nutrition Support',
    icon: Baby,
    category: 'Child Care',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    description: 'Promoting adequate childhood nutrition, health monitoring, and safeguarding child welfare in backward rural hamlets.',
    initiatives: [
      'Nutritional supplements distribution for infants and mothers',
      'Immunization awareness drives in collaboration with local centers',
      'Recreational and developmental sports days for kids',
    ],
  },
  {
    title: 'Youth Skill Development & Vocational Training',
    icon: Briefcase,
    category: 'Skill Building',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    description: 'Providing employment-oriented training in electrical maintenance, repair, computer applications, and retail skills.',
    initiatives: [
      'Short-term certified trade workshops',
      'Resume guidance and interview readiness camps',
      'Self-employment entrepreneurship mentorship',
    ],
  },
  {
    title: 'Environment, Sanitation & Green Living',
    icon: TreePine,
    category: 'Environment',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    description: 'Community afforestation drives, clean drinking water awareness, village waste management, and solar light promotion.',
    initiatives: [
      'Mass sapling plantation along rural pathways and public grounds',
      'Swachhata village cleanliness and sanitation awareness',
      'Water conservation and rainwater harvesting seminars',
    ],
  },
];

export default function WorkPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-amber-50/60 via-warm-50/80 to-white text-slate-800 py-16 sm:py-20 relative overflow-hidden border-b border-slate-200/70">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="title-ornament mb-3">
              <span className="text-xs uppercase tracking-widest text-amber-700 bg-amber-100/80 border border-amber-300/60 px-3 py-1 rounded-full font-bold">
                Our Programs & Focus Areas
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-heading text-slate-900 mt-3">
              Grassroots Action for Community Transformation
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Focused programs structured to address foundational needs across education, health, livelihood, and environment.
            </p>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="py-20 bg-warm-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {PROGRAMS.map((program, idx) => {
              const isEven = idx % 2 === 0;
              const Icon = program.icon;

              return (
                <div
                  key={program.title}
                  className={`bg-white rounded-3xl p-5 sm:p-10 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center ${
                    isEven ? '' : 'lg:grid-flow-dense'
                  }`}
                >
                  <div className={`lg:col-span-6 space-y-4 ${isEven ? '' : 'lg:col-start-7'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-100 text-gold-800 text-xs font-bold">
                      <Icon className="w-4 h-4" />
                      <span>{program.category}</span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-bold text-navy-950 font-heading">
                      {program.title}
                    </h2>

                    <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                      {program.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Initiatives:</h4>
                      {program.initiatives.map((item) => (
                        <div key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 transition-colors shadow-sm"
                      >
                        <span>View Related Projects</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                      </Link>
                      <Link
                        href="/volunteer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
                      >
                        <span>Volunteer in this Field</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className={`lg:col-span-6 ${isEven ? '' : 'lg:col-start-1'}`}>
                    <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 w-full shadow-lg border-2 border-slate-100">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Call - Royal Sapphire & Gold Anchor */}
        <section className="py-16 bg-gradient-to-r from-[#0c2847] via-[#103460] to-[#0c2847] text-white text-center border-t-2 border-gold-400/30 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mb-4">
              Have Expertise to Share in Any of These Sectors?
            </h2>
            <p className="text-sm text-blue-100/90 max-w-xl mx-auto mb-8 leading-relaxed">
              Join our active community of educators, doctors, counselors, and social workers creating real impact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/volunteer"
                className="px-8 py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-black hover:brightness-110 transition-all shadow-gold active:scale-95"
              >
                Register as Field Volunteer
              </Link>
              <Link
                href="/donate"
                className="px-8 py-3 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 active:scale-95"
              >
                Donate for Our Programs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
