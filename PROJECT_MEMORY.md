# PROJECT MEMORY

## Project Overview
- **Name**: Nipania Vikash Seva Trust (Web Platform)
- **Organization Type**: Non-Governmental Organization (NGO) / Charitable Trust
- **Core Mission**: Community welfare, healthcare outreach, education, women empowerment, environmental initiatives, emergency relief, and donor/volunteer governance.
- **Platform Scope**: Public-facing trust portal (landing pages, donations, events, membership, volunteers, transparency reports, ID card verification) + comprehensive Admin Backoffice (`/admin`) for operational management.

## Current Architecture
- **Application Type**: Fullstack Next.js Application with App Router architecture.
- **Language**: TypeScript throughout (strict typing enabled in `tsconfig.json`).
- **Rendering Model**: Server Components by default with client components (`"use client"`) for interactive interfaces (modals, forms, charts, PDF generation).
- **Styling**: Tailwind CSS with custom colors, CSS variables in `globals.css`, and utility merging (`clsx`, `tailwind-merge`).
- **ORM & Data Layer**: Prisma ORM with PostgreSQL database engine (`prisma/schema.prisma`).
- **Organizational Architecture**:
  - `DONOR` -> Financial Contribution -> Receipt / Section 80G Tax Exemption
  - `VOLUNTEER` -> Public Application -> Admin Review/Approval -> Volunteer ID (`HRMEWT-V-XXXXXX`) -> QR Verification -> Service -> Certificates
  - `CERTIFICATE` -> Recognition of Service / Merit / Appreciation -> A4 Landscape PDF -> QR Verification (`HRMEWT-CERT-XXXXXX`)
  - `TRUSTEE` -> Trust Governance & Oversight
  - `STAFF` -> Operational Administration
  - **PUBLIC MEMBERSHIP**: Retired. No enrollment, forms, or tier fees. `/membership` permanently redirects (308) to `/volunteer`.

## Legal Entity Naming Status
- **Trust Deed Name**: `"H.R. MEMORIAL EDUCATIONAL AND WELFARE TRUST"`
- **Operating / Public Brand Name**: `"Nipania Vikash Seva Trust"`
- **Status**: `Organizational naming relationship requires human confirmation.` No artificial DBA or merger was invented. All statutory legal texts, certificates, and ID card disclaimers cite the exact Deed name, while public domain branding remains configurable.

## Technology Stack
- **Framework**: Next.js 14.2.11 (App Router)
- **Runtime / UI**: React 18.3.1, React DOM 18.3.1
- **Language**: TypeScript 5.6.2
- **Styling**: Tailwind CSS 3.4.11, PostCSS 8.4.45, Autoprefixer 10.4.20
- **Theme**: Prestigious Royal Sapphire & Golden Amber NGO Trust Palette — A vibrant, attractive combination of luminous warm white/pearl reading canvas (`#FAFAF9` / `#F8FAFC`), paired with deep royal sapphire navy (`#0C234C` / `#0F3370`), sacred saffron/gold gradients (`#F59E0B`/`#EA580C`), deep teal/emerald jewel tones (`#065F46`/`#093548`), and grassroots emerald live status indicators (`#10B981`).
- **Database ORM**: Prisma 5.19.1 (`@prisma/client`)
- **Database Engine**: PostgreSQL (Prisma Accelerate remote pool)
- **Authentication & Security**: `jsonwebtoken` (9.0.2), `bcryptjs` (2.4.3)
- **Email Delivery**: `nodemailer` (9.1.1)
- **Document & Certificate Export**: `qrcode` (1.5.4), `jspdf` (2.5.1), `html2canvas` (1.4.1)
- **Data Visualization**: `recharts` (2.12.7)
- **Icons**: `lucide-react` (0.441.0)
- **Utilities**: `date-fns` (3.6.0), `clsx` (2.1.1), `tailwind-merge` (2.5.2)

## Frontend
- **Public Routes (`src/app/`)**:
  - `/` (Home page: Hero, Mission/Vision, Impact Stats, Featured Projects, Crisis Response, Campaigns, Partners)
  - `/about` (Trust background, objectives, and leadership)
  - `/board-members` (Executive leadership, Advisory panel, and Trustees)
  - `/campaigns` & `/campaigns/[slug]` (Active and completed NGO campaigns and drives)
  - `/sponsor` (Dedicated sponsorship directory for critical causes)
  - `/gallery` (Categorized media gallery with image/video views)
  - `/donate` (Donation checkout with Razorpay Subscriptions / e-Mandate architecture, UPI Autopay, Cards SI, Section 80G tax exemption)
  - `/volunteer` (Primary public participation portal: application form, orientation, volunteer charter)
  - `/csr` (Corporate Social Responsibility partnership portal: Schedule VII focus areas, 100% compliance metrics, interactive enquiry form)
  - `/membership` (Permanent 308 redirect to `/volunteer`)
  - `/verify` & `/verify/[id]` (Universal verification portal: validates both Certificates `HRMEWT-CERT-XXXXXX` and ID cards `HRMEWT-V-XXXXXX` against live DB)
  - `/receipt/[id]` (Public donor Section 80G tax receipt viewer, direct print, and PDF download)
  - `/contact` (Contact form, office locations, and grievance details)
  - `/legal/*` (Terms, Privacy Policy, Volunteer Policy, Donation Refund Policy)
- **Admin Portal (`src/app/admin/`)**:
  - `/admin` (Analytics dashboard with live donations, active volunteers, issued certificates, and audit logs)
  - `/admin/login` (Admin authentication interface)
  - `/admin/donations` (Donation records, offline receipt issuance, Section 80G certificates)
  - `/admin/compliance/80g` (Section 80G, Form 10BD annual return filing, and Form 10BE distribution)
  - `/admin/csr` (Corporate Social Responsibility partnership pipeline: status stages, notes log, 1-click email/WhatsApp connect, CSV export)
  - `/admin/volunteers` (Volunteer applications, approval workflow, status, and recognized certificates drawer)
  - `/admin/certificates` (Dedicated Certificate Studio: metrics, draft creation, live visual preview modal, issue, revoke with mandatory reason, email dispatch with PDF attachment, PDF binary streaming)
  - `/admin/id-cards` (ID card generator, badge printing, QR code binding for Volunteers, Staff, Trustees)
  - `/admin/projects` (CRUD for community campaigns and social drives)
  - `/admin/sponsors` (CRUD for verified sponsorship causes)
  - `/admin/gallery` (CRUD for on-ground photo and video media gallery)
  - `/admin/board-members` (Board member and trustee directory management)
  - `/admin/content` (Dynamic CMS block editing for landing page copy)
  - `/admin/messages` (Inbound contact form messages and inquiry tracker)
  - `/admin/users` (Admin and staff user management with RBAC roles)
  - `/admin/settings` (Trust details, PAN, Darpan, Bank accounts, UPI IDs, SMTP config)
  - `/admin/payment-gateway` (Payment gateway studio: Razorpay, Cashfree, PhonePe, Paytm, Direct UPI QR for donations)
  - `/admin/audit-logs` (Security and operational audit trail logs)

## Backend
- **API Route Handlers (`src/app/api/`)**:
  - `/api/auth/*` (Login, logout, session verification, forgot-password, reset-password)
  - `/api/donations/*` (Donation creation, receipt PDF stream, Form 10BE PDF, listing)
  - `/api/compliance/*` (80G stats, Form 10BD validation/export/filing, Form 10BE distribution)
  - `/api/volunteers/*` (Registration submission, atomic candidate generation `HRMEWT-V-XXXXXX`, approvals, relations)
  - `/api/certificates/*` (`GET` listing, `POST` creation with collision-safe number `HRMEWT-CERT-XXXXXX`, `GET` / `PATCH` / `DELETE` for `[id]`, `[id]/pdf` binary streaming, `[id]/email` dispatch)
  - `/api/id-cards/*` (Issue ID card, QR data generation, public verification)
  - `/api/projects/*` (Initiatives and campaigns)
  - `/api/events/*` (Community programs and registrations)
  - `/api/documents/*` (Governance and regulatory uploads)
  - `/api/news/*` (Articles and media press)
  - `/api/contact/*` (Inquiries and grievance handling)
  - `/api/newsletter/*` (Newsletter subscription management)
  - `/api/settings/*` (Trust configuration, bank details, organization info)
  - `/api/payment/*` (Payment gateway settings, key validation, order creation)
  - `/api/smtp/*` (SMTP email configuration and test email dispatcher)
  - `/api/stats/*` (Impact metrics and dashboard statistics)
  - `/api/users/*` (Staff and admin user CRUD)
  - `/api/audit-logs/*` (Querying security and operational audit logs)
  - `/api/gallery/*` (Unified gallery endpoint with category filtering)
  - `/api/upload/*` (File and asset upload handler)

## Database
- **Engine**: PostgreSQL via Prisma ORM (`prisma/schema.prisma`)
- **Key Models**:
  - `User`: Administrative staff and officers with roles and password hashes
  - `TrustDetail`: Singleton table for trust registration, PAN, 12A/80G/CSR/FCRA numbers, bank accounts, UPI ID, SMTP config, payment gateway settings
  - `Certificate`: Full lifecycle certificate model (`certificateNumber` format `HRMEWT-CERT-XXXXXX`, `certificateType`, `title`, `recipientName`, `recipientEmail`, `description`, `issueDate`, `status` DRAFT/ISSUED/REVOKED, `verificationCode`, `verificationUrl`, `signatoryName`, `signatoryTitle`, `revokedAt`, `revocationReason`, relations to `Volunteer`, `Event`, `Project`)
  - `Volunteer`: Volunteer records, skills, availability, categories, `volunteerId` format `HRMEWT-V-XXXXXX`, ID card, relation to `Certificate[]`
  - `Member`: Deprecated legacy archive table (retained read-only for audit integrity; zero active public interaction)
  - `IdCard`: Unified identification card registry (`VOLUNTEER`, `STAFF`, `TRUSTEE`) with QR verification
  - `Donation`: Financial contributions, donor details, PAN, 80G eligibility, Indian financial year, Form 10BD filing batch status, Form 10BE certificate number & PDF storage
  - `TenBDFiling`: Annual Form 10BD statutory submission batches
  - `Project` & `ProjectUpdate`: Community initiatives and drives
  - `Event` & `EventRegistration`: Community events and registrations
  - `BoardMember`: Trustees and leadership directory
  - `AuditLog`: Security and governance activity trail

## Authentication & RBAC
- **Mechanism**: JWT tokens signed with `JWT_SECRET` stored in HTTP-only cookie `auth_token` or sent via `Authorization: Bearer <token>` header.
- **Roles & Permissions (RBAC)**:
  - `SUPER_ADMIN`: Full access (`*`)
  - `ADMIN`: Core management access (donations, compliance, volunteers, certificates, projects, events, gallery, content, documents, messages, settings, id_cards)
  - `FINANCE_MANAGER`: Donations, compliance, donors, financial reports
  - `VOLUNTEER_MANAGER`: Volunteers, volunteer ID cards, certificates, events
  - `CONTENT_MANAGER`: Content blocks, projects, events, gallery, documents, news
  - `PROJECT_MANAGER`: Projects, events, certificates, reports
  - `VIEWER`: Read-only access (`view_only`)

## APIs
- All backend endpoints are structured under Next.js App Router Route Handlers (`src/app/api/.../route.ts`).
- Standardized JSON responses with HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Automatic audit logging integration on critical mutations via `src/lib/audit.ts` (`logAuditAction`).

## Important Components
- `src/components/public/Navbar.tsx`: Responsive navigation header with active routes, mega dropdowns, donate CTA.
- `src/components/public/Footer.tsx`: Comprehensive footer with organizational links, 80G tax benefit notice, social links.
- `src/components/public/HeroSection.tsx`: Dynamic hero banner with key CTA buttons.
- `src/components/public/BoardMembersSection.tsx`: Showcase of trust leadership.
- `src/components/admin/AdminSidebar.tsx`: Admin dashboard navigation with role-based visibility.
- `src/components/admin/AdminNavbar.tsx`: Admin topbar with session info and quick actions.
- `src/components/admin/IdCardRenderer.tsx`: Interactive printable ID card preview and export engine.

## Current Implementation Status
- Complete functional NGO platform baseline implemented.
- Database schema established, seeded with initial mock/seed data (`prisma/seed.js`).
- Public pages and admin dashboard UI fully assembled.
- PDF generation and QR code creation integrated on client side.
- Shared AI memory and multi-agent coordination system active.

## Recently Completed
- Project initialization and dependency configuration.
- Prisma schema definition with 17 data models covering all NGO operations.
- Admin dashboard layout and 14 operational submodules.
- Establishment of shared AI memory system (`AGENTS.md`, `PROJECT_MEMORY.md`, `TASKS.md`, `CHANGELOG_AI.md`, `DECISIONS.md`).
- Complete theme redesign with modern indigo/teal/emerald color palette (2026-09-06).
- Photo upload functionality for trustee ID card stamps and admin panel photo sections (2026-09-06).
- Modern ID card design with improved layout and stamp photo support (2026-09-06).
- Stories From Ground section overhaul with balanced 8-story grid, category filtering, and image lightbox modal (2026-09-06).
- Admin modal top spacing fix (`my-auto max-h-[92vh]`) across all administrative popups (2026-09-06).
- ID card typography & contrast overhaul with readable 10px-16px font sizes and sharp QR validation (2026-09-06).
- Navbar 100% opaque background on scroll to eliminate text bleeding (2026-09-06).
- Direct 80G Receipt Print & Separation of Admin and User Platforms with in-place `window.print()` and public `/receipt/[id]` route (2026-09-07).
- Removal of Transparency section from public portal (redirected to `/about`) and admin panel cleanup (redirected `/admin/transparency` to `/admin`, cleaned RBAC permissions) (2026-09-10).
- Added high-resolution local documentary photograph (`/images/women-empowerment.jpg`) for the "Women Empowerment & Self-Reliance" section on `/work` and synchronized project database records (2026-09-10).

## Currently In Progress
- None (All requested improvements completed and verified)

## Known Problems
- Database engine is currently local SQLite (`prisma/dev.db`). For heavy concurrent production usage, migration to PostgreSQL or MySQL will be required.
- Image uploads are currently stored as URLs (direct URLs, Unsplash, Cloudinary); a direct cloud S3/Cloudinary upload pipeline can be added if direct file uploads are needed.

## Known Technical Debt
- Automated test coverage (unit/e2e tests) needs to be set up.
- Environment variables for SMTP and JWT need live production values configured before deployment.

## Important Constraints
- Preserve Next.js 14 App Router patterns.
- Do not bypass `src/lib/auth.ts` RBAC permission checks on administrative API endpoints.
- Ensure all mutations on sensitive models (Donations, Users, Settings) record an audit log using `logAuditAction`.
- Maintain exact Prisma schema relationships and migration discipline.

## Environment / Configuration Notes
- `.env` requires:
  - `DATABASE_URL="file:./dev.db"`
  - `JWT_SECRET` (Secure JWT secret string)
  - Optional SMTP credentials: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Deployment
- Can be deployed to Vercel or any Node.js hosting platform (Docker, VPS, AWS ECS).
- Build command: `npm run build` (executes `prisma generate && next build`).
- Start command: `npm run start`.

## Next Recommended Steps
1. Add automated testing framework (Jest / React Testing Library / Playwright).
2. Configure live payment gateway integration (Razorpay / Cashfree / Stripe) for donation processing.
3. Add multi-language support (Hindi / English) for community outreach.

## Last Updated
2026-09-10

## Last Updated By
Google Antigravity
