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
- **ORM & Data Layer**: Prisma ORM with SQLite database engine (`prisma/schema.prisma`).

## Technology Stack
- **Framework**: Next.js 14.2.11 (App Router)
- **Runtime / UI**: React 18.3.1, React DOM 18.3.1
- **Language**: TypeScript 5.6.2
- **Styling**: Tailwind CSS 3.4.11, PostCSS 8.4.45, Autoprefixer 10.4.20
- **Theme**: Prestigious Royal Sapphire & Golden Amber NGO Trust Palette — A vibrant, attractive combination of luminous warm white/pearl reading canvas (`#FAFAF9` / `#F8FAFC`), paired with deep royal sapphire navy (`#0C234C` / `#0F3370`, distinctly blue and free of flat black), sacred saffron/gold gradients (`#F59E0B`/`#EA580C`), deep teal/emerald jewel tones (`#065F46`/`#093548`), and grassroots emerald live status indicators (`#10B981`).
- **Database ORM**: Prisma 5.19.1 (`@prisma/client`)
- **Database Engine**: SQLite (`prisma/dev.db`)
- **Authentication & Security**: `jsonwebtoken` (9.0.2), `bcryptjs` (2.4.3)
- **Email Delivery**: `nodemailer` (9.1.1)
- **ID Card & Document Export**: `qrcode` (1.5.4), `jspdf` (2.5.1), `html2canvas` (1.4.1)
- **Data Visualization**: `recharts` (2.12.7)
- **Icons**: `lucide-react` (0.441.0)
- **Utilities**: `date-fns` (3.6.0), `clsx` (2.1.1), `tailwind-merge` (2.5.2)

## Frontend
- **Public Routes (`src/app/`)**:
  - `/` (Home page: Hero, Mission/Vision, Impact Stats, Featured Projects, Areas of Work, Crisis Response, Ways to Help, Campaigns, Newsletter, Partners)
  - `/about` (Trust background, objectives, and leadership)
  - `/board-members` (Executive leadership, Advisory panel, and Trustees)
  - `/campaigns` & `/campaigns/[slug]` (Active and completed NGO campaigns and drives)
  - `/sponsor` (Dedicated SikhAid-inspired sponsorship directory for critical causes)
  - `/gallery` (Categorized media gallery with image/video views, connected directly to database records)
  - `/donate` (Donation checkout with Razorpay Subscriptions / e-Mandate architecture, UPI Autopay, Cards SI, Netbanking e-NACH, cause designation, and Section 80G tax exemption)
  - `/volunteer` (Volunteer application form and onboarding)
  - `/membership` (Membership tiers, application, and benefits)
  - `/verify` & `/verify/[id]` (Public ID card and certificate verification via QR code)
  - `/receipt/[id]` (Public donor Section 80G tax receipt viewer, direct print, and PDF download)
  - `/contact` (Contact form, office locations, and grievance details)
  - `/legal/*` (Terms, Privacy Policy, Volunteer Policy, Donation Refund Policy)
- **Admin Portal (`src/app/admin/`)**:
  - `/admin` (Analytics dashboard with key metrics, donation trends, volunteer stats)
  - `/admin/login` (Admin authentication interface)
  - `/admin/donations` (Donation records, full Edit and Delete management, offline receipt issuance, printable Section 80G A4 PDF certificates)
  - `/admin/compliance/80g` (Statutory Section 80G tax exemption, Form 10BD annual return preparation/filing, and Form 10BE certificate distribution hub)
  - `/admin/volunteers` (Volunteer applications, approval workflow, status)
  - `/admin/members` (Membership records, tier management, renewal tracking)
  - `/admin/id-cards` (ID card generator, badge printing, QR code binding)
  - `/admin/projects` (CRUD for community campaigns, targets, raised amounts, and social drives)
  - `/admin/sponsors` (CRUD for verified sponsorship causes, meal drives, dignity kits, education, and healthcare tiers)
  - `/admin/gallery` (CRUD for on-ground photo and video media gallery with live categories, featured toggle, and file uploads)
  - `/admin/board-members` (Board member and trustee directory management)
  - `/admin/content` (Dynamic CMS block editing for landing page copy)
  - `/admin/messages` (Inbound contact form messages and inquiry tracker)
  - `/admin/users` (Admin and staff user management with RBAC roles)
  - `/admin/settings` (Trust details, PAN, Darpan, Bank accounts, UPI IDs, SMTP config)
  - `/admin/payment-gateway` (Dedicated payment gateway studio: Razorpay, Cashfree, PhonePe, Paytm, Direct UPI QR & fee controls)
  - `/admin/audit-logs` (Security and operational audit trail logs)

## Backend
- **API Route Handlers (`src/app/api/`)**:
  - `/api/auth/*` (Login, logout, session verification)
  - `/api/donations/*` (Donation creation, `/api/donations/[id]/receipt` PDF stream, `/api/donations/[id]/10be` secure PDF, list, filter)
  - `/api/compliance/*` (80G compliance stats, Form 10BD validation, Form 10BD CSV streaming export, Form 10BD filing batches, Form 10BE upload, single/bulk Form 10BE email delivery)
  - `/api/volunteers/*` (Registration submission, approval/rejection, listing)
  - `/api/members/*` (Application submission, status update, listing)
  - `/api/id-cards/*` (Issue ID card, QR data generation, public verification)
  - `/api/auth/*` (Login, session validation, logout, forgot-password, reset-password)
  - `/api/donations/*` (Public donations, list, receipt, verification, stats)
  - `/api/compliance/*` (Statutory Section 80G, Form 10BD annual returns, Form 10BE certificate distribution)
  - `/api/volunteers/*` (Registration and management)
  - `/api/members/*` (Registration, category fees in INR ₹, membership approvals)
  - `/api/id-cards/*` (Credential generation and public verification)
  - `/api/projects/*` (Initiatives and campaigns)
  - `/api/events/*` (Community programs and registrations)
  - `/api/documents/*` (Public transparency and regulatory uploads)
  - `/api/news/*` (Articles and media press)
  - `/api/contact/*` (Inquiries and grievance handling)
  - `/api/newsletter/*` (Newsletter subscription management)
  - `/api/settings/*` (Trust configuration, bank details, organization info)
  - `/api/payment/*` (Payment gateway settings, key validation, orders, public fees in INR ₹)
  - `/api/smtp/*` (SMTP email configuration and test email dispatcher)
  - `/api/stats/*` (Impact metrics and dashboard statistics)
  - `/api/users/*` (Staff and admin user CRUD)
  - `/api/audit-logs/*` (Querying security and operational audit logs)
  - `/api/gallery/*` (Unified gallery endpoint with category filtering and Prisma sync)
  - `/api/upload/*` (File and asset upload handler)

## Database
- **Engine**: SQLite via Prisma ORM (`prisma/schema.prisma`, file at `prisma/dev.db`)
- **Key Models**:
  - `User`: Administrative staff and officers with roles, password hashes, and password reset tokens (`resetToken`, `resetTokenExpiry`)
  - `TrustDetail`: Singleton table for trust registration, PAN, 12A/80G/CSR/FCRA numbers, bank accounts, UPI ID, SMTP config, Razorpay gateway settings (Test/Live), and membership fee controls (INR ₹)
  - `ImpactStat`: Key organizational performance indicators (e.g. 50,000+ lives touched)
  - `Donation`: Financial contributions, donor details, PAN, 80G eligibility, Indian financial year, Form 10BD filing batch status, Form 10BE certificate number & PDF storage, email tracking, and cryptographic secure access tokens
  - `TenBDFiling`: Annual Form 10BD statutory submission batches with financial year, filing status, acknowledgement number, filing date, and audit notes
  - `Volunteer`: Volunteer applications, skills, availability, categories, ID card status
  - `Member`: General, Life, Executive, and Patron membership registry with fee amount, payment status (PAID/PENDING/FAILED), UTR transaction ID, and validity dates
  - `IdCard`: Unified identification card registry (Volunteer, Member, Staff, Trustee) with QR verification
  - `Project` & `ProjectUpdate`: NGO projects with target amounts, raised funds, beneficiary counts, and milestones
  - `Event` & `EventRegistration`: Community events, registrations, guest capacity
  - `GalleryItem`: Media showcase (photos/videos) across categories
  - `Document`: Governance and transparency documents (12A, 80G, Annual Reports)
  - `NewsArticle`: Press releases, news updates, and articles
  - `ContactMessage`: Grievance and contact submissions with status and admin notes
  - `NewsletterSubscriber`: Email subscription list
  - `AuditLog`: Action logs (User, Module, Action, Timestamp, IP)
  - `ContentBlock`: Key-value CMS blocks for customizable page copy
  - `BoardMember`: Trustees and leadership directory with tenure and designations

## Authentication
- **Mechanism**: JWT tokens signed with `JWT_SECRET` stored in HTTP-only cookie `auth_token` or sent via `Authorization: Bearer <token>` header.
- **Password Hashing**: `bcryptjs` for secure password hashing and verification.
- **Roles & Permissions (RBAC)**:
  - `SUPER_ADMIN`: Full access (`*`)
  - `ADMIN`: Core management access (donations, compliance, volunteers, members, projects, events, gallery, content, documents, messages, settings, id_cards)
  - `FINANCE_MANAGER`: Donations, compliance, donors, financial reports
  - `VOLUNTEER_MANAGER`: Volunteers, volunteer ID cards, events
  - `MEMBER_MANAGER`: Members, member ID cards
  - `CONTENT_MANAGER`: Content blocks, projects, events, gallery, documents, news
  - `PROJECT_MANAGER`: Projects, events, reports
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
