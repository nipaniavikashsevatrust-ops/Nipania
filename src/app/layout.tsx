import type { Metadata } from 'next';
import './globals.css';
import RecentDonationToast from '@/components/public/RecentDonationToast';
import { ToastProvider } from '@/components/common/Toast';
import SmoothScrollProvider from '@/components/common/SmoothScrollProvider';

const BASE_URL = 'https://nipaniatrust.org';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Nipania Vikash Seva Trust | Seva | Vikash | Samarpan',
    template: '%s | Nipania Vikash Seva Trust',
  },
  description: 'Official website of Nipania Vikash Seva Trust. Dedicated to Seva, Vikash, and Samarpan through rural community welfare, children education, medical camps, and social empowerment initiatives in India.',
  keywords: [
    'Nipania Vikash Seva Trust',
    'NGO India',
    'Charitable Trust',
    'Seva Vikash Samarpan',
    'Rural Development',
    'Community Welfare',
    'Child Education NGO',
    'Health Camps India',
    '80G Tax Exemption Donation',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Nipania Vikash Seva Trust | Seva | Vikash | Samarpan',
    description: 'Committed to Seva, Vikash, and Samarpan through rural development, primary education, healthcare drives, and social welfare in India.',
    url: BASE_URL,
    siteName: 'Nipania Vikash Seva Trust',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nipania Vikash Seva Trust - Seva • Vikash • Samarpan',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nipania Vikash Seva Trust | Seva | Vikash | Samarpan',
    description: 'Committed to Seva, Vikash, and Samarpan through rural development, primary education, healthcare drives, and social welfare in India.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      additionalType: 'https://schema.org/NGO',
      '@id': `${BASE_URL}/#organization`,
      name: 'Nipania Vikash Seva Trust',
      alternateName: 'Nipania Trust',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      image: `${BASE_URL}/logo.png`,
      description: 'A registered charitable trust committed to Seva, Vikash, and Samarpan through rural development, child education, medical healthcare camps, and social welfare in India.',
      taxID: '12A & 80G Tax-Exempt NGO India',
      nonprofitStatus: 'Nonprofit501c3',
      foundingLocation: {
        '@type': 'Place',
        name: 'Balrampur, Uttar Pradesh, India',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Balrampur',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'IN',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91 98765 43210',
          contactType: 'customer support',
          email: 'info@nipaniatrust.org',
          availableLanguage: ['en', 'hi'],
        },
      ],
      sameAs: [
        'https://facebook.com',
        'https://twitter.com',
        'https://instagram.com',
        'https://linkedin.com',
        'https://youtube.com',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Nipania Vikash Seva Trust',
      publisher: {
        '@id': `${BASE_URL}/#organization`,
      },
      inLanguage: 'en-IN',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-white">
        <SmoothScrollProvider>
          <ToastProvider>
            {children}
            <RecentDonationToast />
          </ToastProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
