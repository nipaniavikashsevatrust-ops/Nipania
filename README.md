# Nipania Vikash Seva Trust

> **Official Web Portal & Management System for Nipania Vikash Seva Trust**  
> Dedicated to Seva (Selfless Service), Vikash (Community Development), and Samarpan (Wholehearted Dedication).

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![SEO Score](https://img.shields.io/badge/SEO_Score-76%2B%20%2F%20100-emerald?style=flat-square)](./FULL-AUDIT-REPORT.md)

---

## 🌟 Overview

The **Nipania Vikash Seva Trust** web portal is an end-to-end digital platform enabling transparent donations, automated Section 80G tax certificates, Form 10BD/10BE compliance filing, volunteer & membership enrollment, project showcases, and administrative governance.

---

## ✨ Key Features

### 🏛️ Public Experience
- **Hero & Mission Showcase**: High-impact visual storytelling highlighting rural upliftment, healthcare camps, and child education.
- **Direct & Online Donations**: Razorpay gateway and Instant UPI QR code generator (`upi://pay`) with 50% tax exemption under Section 80G.
- **Instant Tax Receipts & Verification**: Automated PDF generation for donor receipts with verifiable QR codes.
- **Form 10BE Compliance**: Donors can download official Form 10BE certificates issued by the Income Tax Department.
- **Volunteer & Membership Portals**: Easy application flows for on-ground community volunteers and official trust members.
- **Active Campaigns & Projects**: Live fundraising progress meters, updates, and transparency disclosures.
- **Photo & Drive Gallery**: Categorized field activity visual documentation.

### 🛡️ Administrative Dashboard (`/admin`)
- **Full Role-Based Access Control (RBAC)**: Roles for Super Admin, Finance Manager, Volunteer Manager, Content Manager, and Viewers.
- **Donation & Compliance Manager**: Track online/offline transactions, batch preparation for Form 10BD, and bulk Form 10BE dispatch.
- **ID Card Generation & Printing**: Automated printable ID cards with dynamic verification QR codes for volunteers, members, and trustees.
- **Content Management System (CMS)**: Manage board members, campaigns, impact stats, transparency reports, and photo galleries without touching code.
- **Security & Audit Logs**: Immutable audit log of every admin action, login attempt, and financial export.

### 🚀 Search Engine Optimization & AI Readiness
- **Complete Schema.org Structured Data**: Native JSON-LD for `Organization` (NGO), `WebSite`, and `BreadcrumbList`.
- **Dynamic Crawl Governance**: Native `robots.ts` and `sitemap.ts` dynamically serving search engines and 11 AI search crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.).
- **GEO / AI Search Ready**: Includes `/llms.txt` optimized for AI assistants (Perplexity, ChatGPT Search, Gemini).
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy configured in `next.config.mjs`.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Styling**: Tailwind CSS with custom palette (Warm Sand & Rich Slate)
- **Animation**: GSAP & Lenis Smooth Scroll
- **PDF Generation**: jsPDF & html2canvas
- **Payment Processing**: Razorpay & Direct UPI

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/nipaniavikashsevatrust-ops/Nipania.git
cd Nipania
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL and secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nipania_trust?sslmode=disable"
JWT_SECRET="your-secure-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database
```bash
# Push schema to database
npx prisma db push

# Seed initial admin user & trust settings
npm run prisma:seed
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Connect a PostgreSQL database (e.g. **Vercel Postgres**, **Neon**, or **Supabase**).
4. Set required Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`).
5. Deploy! Vercel automatically runs `postinstall` to generate the Prisma Client.

---

## 📄 License & Compliance

© 2026 Nipania Vikash Seva Trust. All rights reserved.  
Registered Charitable Trust | 80G & 12A Certified NGO, India.
