# ARCHITECTURAL DECISIONS

> **Instructions for AI Agents:**
> Record major architectural and technical design decisions here.
> Use this format for every record:
> - Title: `## ADR-[Number]: [Title]`
> - Metadata: `Date:`, `Agent:`, `Status:`
> - Sections: `Context`, `Decision`, `Reason`, `Alternatives Considered`, `Consequences`

---

## ADR-001: Next.js 14 App Router & TypeScript Architecture

Date: 2026-09-01  
Agent: Initial Developer  
Status: ACCEPTED  

### Context
The Nipania Vikash Seva Trust web application requires a modern, responsive, and SEO-friendly public portal combined with a secure administrative dashboard for managing donations, volunteers, members, and documents.

### Decision
Use Next.js 14 with App Router, TypeScript, and React 18 Server/Client components.

### Reason
- Next.js App Router provides unified server-side rendering for public pages (great SEO for NGO credibility) and Route Handlers for backend APIs.
- TypeScript ensures type safety across data contracts, UI props, and API payloads.
- Single codebase simplifies deployment and maintenance.

### Alternatives Considered
- *Separate React SPA + Express.js backend*: Higher operational overhead and slower initial page loads for public visitors.
- *Remix / Vite*: Next.js ecosystem has stronger support for server actions and fullstack deployment integrations.

### Consequences
- All API routes are located under `src/app/api/*`.
- Interactive components require explicit `"use client"` directive.

---

## ADR-002: Prisma ORM with SQLite for Data Layer

Date: 2026-09-01  
Agent: Initial Developer  
Status: ACCEPTED  

### Context
The application needs structured relational modeling for 17+ domain entities (Users, Donations, Volunteers, Members, Projects, Events, IdCards, Documents, etc.) with easy local development and migration support.

### Decision
Adopt Prisma ORM with SQLite for local development (`prisma/dev.db`), keeping schemas declarative in `prisma/schema.prisma`.

### Reason
- Prisma provides auto-generated TypeScript types directly matching the database schema.
- SQLite requires zero external database installation for local development and demonstration.
- Prisma schema can be repointed to PostgreSQL or MySQL with minimal friction when preparing for scaled production.

### Alternatives Considered
- *Raw SQL / TypeORM / Drizzle*: Prisma provides superior auto-completion and schema migration simplicity.
- *MongoDB (Mongoose)*: Relational integrity (foreign keys between Projects & ProjectUpdates, Events & Registrations) is better served by relational databases.

### Consequences
- Production deployments must either persist the SQLite file or migrate `datasource db` in `prisma/schema.prisma` to PostgreSQL.

---

## ADR-003: Cookie-Based JWT Authentication & Role-Based Access Control (RBAC)

Date: 2026-09-01  
Agent: Initial Developer  
Status: ACCEPTED  

### Context
Administrative users have different responsibilities (e.g. Finance Managers should manage donations and reports, Volunteer Managers should manage volunteers, Content Managers should edit projects/news).

### Decision
Implement stateless JWT tokens stored in HTTP-only `auth_token` cookies with role-based permissions verified in `src/lib/auth.ts`.

### Reason
- Stateless verification avoids database lookup overhead on every protected request.
- Centralized `ROLE_PERMISSIONS` dictionary allows fine-grained role assignments across 8 distinct administrative roles.
- HTTP-only cookies prevent XSS token theft.

### Alternatives Considered
- *NextAuth.js / Auth0 / Clerk*: External auth providers require internet connectivity, API keys, and third-party vendor lock-in. Custom JWT keeps the NGO system fully self-contained.

### Consequences
- Admin API routes must check `getSession()` or `getSessionFromRequest(req)` and verify permissions with `hasPermission(role, module)`.

---

## ADR-004: File-Based Shared AI Memory & Multi-Agent Coordination System

Date: 2026-09-06  
Agent: Google Antigravity  
Status: ACCEPTED  

### Context
Multiple AI coding agents (Kilo Code and Google Antigravity) work on this codebase concurrently or sequentially. Because agents do not share live conversational context, lack of coordination can lead to code regressions, overwrites, duplicate work, and architectural divergence.

### Decision
Establish a persistent, file-based shared memory and coordination system at the repository root using structured Markdown files:
- `AGENTS.md` (Rules of engagement & lifecycle)
- `PROJECT_MEMORY.md` (Live verified state & architecture)
- `TASKS.md` (Shared task queue with ownership locks)
- `CHANGELOG_AI.md` (Audit log of agent changes)
- `DECISIONS.md` (Architectural decision records)

### Reason
- Zero external runtime overhead (no databases, no third-party APIs, no extra servers needed).
- Fully visible to both human engineers and all AI agent ecosystems (Kilo Code, Antigravity, Cursor, Claude Code).
- Version-controlled via Git.

### Alternatives Considered
- *External Memory Database (Vector DB / Redis)*: Overengineered, costly, and difficult for other local agents to inspect without custom tooling.
- *Relying only on commit messages*: Commit messages lack task status, architectural rationale, and active work locks.

### Consequences
- Every AI agent working on the repo must follow the mandatory Read → Inspect → Work → Test → Update lifecycle defined in `AGENTS.md`.

---

## ADR-005: Client-Side ID Card & Document PDF/QR Generation

Date: 2026-09-01  
Agent: Initial Developer  
Status: ACCEPTED  

### Context
The NGO requires generating printable volunteer and member ID cards, event passes, and donation receipts with dynamic QR codes that link to public verification pages (`/verify/[id]`).

### Decision
Render ID cards and receipts in React components (`src/components/admin/IdCardRenderer.tsx`), utilizing `qrcode` for QR code rendering and `jspdf` + `html2canvas` for client-side PDF export and printing.

### Reason
- Offloads PDF rendering compute from the server to the client browser.
- Provides real-time visual preview before generating printable output.
- Verification URLs encoded in the QR code resolve directly to `/verify?code=...` for instant mobile-friendly verification.

### Alternatives Considered
- *Server-side Puppeteer / PDFKit*: Heavy server dependency with significant memory overhead.

### Consequences
- Complex custom badge layouts must remain rendered in standard DOM elements that `html2canvas` can capture accurately.

---

## ADR-006: Self-Service Application Correction & Resubmission Lifecycle

Date: 2026-09-06  
Agent: Google Antigravity  
Status: ACCEPTED  

### Context
When administrators review Volunteer or Membership applications, applications with errors (unclear photographs, incomplete addresses, misspelled names) are placed into `NEEDS_CORRECTION` with administrative remarks. Applicants need a seamless way to review the administrator's exact feedback, edit their details, upload replacement documents/photos, and resubmit without administrative bottlenecks.

### Decision
1. **Public Self-Service Portal**: Create `/correction` (search desk) and `/correction/[id]` (interactive form) allowing applicants to look up and access their records using their Application Reference ID (e.g. `NVS-VOL-000003`, `NVS-MEM-000001`) or raw UUID.
2. **Direct Action In Emails**: `sendCorrectionNoticeEmail` embeds a direct CTA button (`${appUrl}/correction/${referenceId}`) so the applicant can click straight into their pre-filled correction form.
3. **State Transition on Resubmission**:
   - Updates all corrected applicant fields.
   - Preserves audit trail by appending timestamped note to `adminRemarks` (`[Applicant corrected details & resubmitted on ...]`).
   - Automatically transitions status back to `PENDING`.
4. **Admin Panel Indication**:
   - Admin tables display a distinct `CORRECTIONS RECEIVED` badge on `PENDING` records that were resubmitted, allowing staff to quickly verify the fixes and issue the ID card.

### Reason
- Eliminates manual back-and-forth emails between applicants and NGO administrators.
- Allows immediate re-upload of photos directly to `/api/upload` with live preview.
- Guarantees data validation and audit logging before updating the database.

### Alternatives Considered
- *Manual email replies with image attachments*: Burdened staff with manual data entry and photo re-cropping.
- *Requiring applicants to fill an entirely new registration form*: Caused duplicate records and lost original reference IDs.

### Consequences
- Applications retain their original reference IDs (`volunteerId` / `memberId`).
- Admin can review corrected details immediately from the admin dashboard and approve with one click.

---

## ADR-007: Payment Gateway Integration & Admin-Controlled Membership Tier Fees (INR ₹)

Date: 2026-09-06  
Agent: Google Antigravity  
Status: ACCEPTED  

### Context
Nipania Vikash Seva Trust accepts donations and membership registrations. Membership has different tiers (General Member, Life Member, Executive Member, Patron). The NGO required:
1. Strict adherence to Indian currency (`INR ₹`) for all transactions and registrations.
2. An integrated Payment Gateway configuration section in the Admin Settings supporting Razorpay and Direct UPI QR transfers.
3. Complete administrative control to enable/disable membership fees, switch environments (Test/Live), validate API keys in real time, and dynamically configure fee amounts per tier.
4. Seamless registration flow where applicants can view real-time fees and pay via Gateway or Direct UPI QR with UTR tracking.

### Decision
1. **Currency Standard**:
   - Currency is fixed to `INR` across all payment APIs, client views, receipt PDFs, and admin settings.
2. **Settings Configuration**:
   - Persist gateway parameters in `TrustDetail`: `paymentGatewayEnabled`, `paymentGatewayProvider`, `paymentGatewayMode`, `razorpayKeyId`, `razorpayKeySecret`, `paymentCurrency`, `membershipFeeEnabled`, and tiered charges (`generalMemberFee`, `lifeMemberFee`, `executiveMemberFee`, `patronMemberFee`).
3. **Public Payment Endpoint (`/api/payment`)**:
   - `GET`: Serves sanitized configuration (public key, mode, active tier fees, UPI ID) to registration pages.
   - `POST`: Validates credentials format and connectivity (`action: "TEST_GATEWAY"`) and creates INR orders.
4. **Hybrid Payment Workflow**:
   - Allows applicants to either use Razorpay Online Gateway or Direct UPI QR transfer with UTR/Transaction ID entry.
   - Admin members portal displays fee amount, payment status (`PAID`, `PENDING`, `FAILED`), payment method, and transaction reference ID for verification before approval.

### Reason
- Eliminates hardcoded fees and gives NGO leadership real-time control over their donation and membership revenue.
- Protects secret keys by keeping `razorpayKeySecret` confidential to admin/server environments.
- Ensures total compliance with Indian financial standards (INR currency).

### Alternatives Considered
- *Hardcoded static membership charges in frontend code*: Inflexible when trust bylaws or board decisions adjust membership subscription rates.
- *Third-party SaaS checkout redirects*: Lost trust branding and degraded applicant onboarding conversion rates.

### Consequences
- The trust can toggle between Test and Live environments seamlessly.
- Changing fee tiers in admin immediately updates the public registration form.

---

## ADR-008: Direct Native Print Dialog & Complete Separation of Admin and User Receipt Architectures

Date: 2026-09-07  
Agent: Google Antigravity  
Status: ACCEPTED  

### Context
Previously, clicking "Print 80G Official Receipt" in the public donor checkout flow (`/donate`) opened an administrative backoffice URL (`/admin/donations/print/[id]`) in a separate browser tab or window. In the admin donations dashboard (`/admin/donations`), clicking print also opened an external popup window (`window.open`), requiring redundant manual verification clicks and degrading user experience.
The NGO required:
1. Public donors must NEVER be directed to the `/admin` backoffice.
2. Clicking print in either the admin backoffice or public platform must DIRECTLY trigger the browser's native print preview dialog (`window.print()`) in-place without opening new tabs or windows.
3. User platform and admin panel receipt architectures must be completely separated while adhering to identical legal Section 80G A4 compliance.

### Decision
1. **Separation of Concerns**:
   - The user platform retains full independence: donor checkout renders its own in-place Section 80G Certificate using `<Section80GCertificate>` within a print-only container (`.receipt-print-area`).
   - Added a dedicated public donor receipt route at `/receipt/[id]` for external donor verification and self-service downloads without requiring administrative privileges.
   - Admin panel manages its own internal print container and actions within `/admin/donations`.
2. **Direct In-Place Browser Print**:
   - Eliminated `window.open` calls across both platforms.
   - Trigger `window.print()` directly.
   - Using CSS `@media print` with `.receipt-print-area`, all surrounding user navigation and admin layout chrome are hidden (`display: none !important`), and only the clean A4 certificate is sent to the printer/PDF dialog.
3. **Reusable A4 Certificate Component (`Section80GCertificate.tsx`)**:
   - Centralized official certificate markup with double borders, official letterhead, donor PAN (Form 10BE), amount in figures and INR words, statutory Section 80G declaration, verification QR code, and authorized signatory.

### Reason
- Protects administrative route privacy from public exposure.
- Improves donor trust and satisfaction with immediate, frictionless native printing.
- Eliminates popup blocker interruptions caused by `window.open`.

### Alternatives Considered
- *Hidden iframe loading PDF blobs*: Modern browsers restrict programmatic printing on embedded PDF viewer plugins for security reasons.
- *Redirecting donors to third-party PDF viewers*: Poor user experience and breaks trust branding.

### Consequences
- Native print works consistently across modern desktop and mobile browsers.
- Donors can print their official receipt in one click without leaving their donation confirmation screen.

---

## ADR-009: Section 80G / Form 10BD / Form 10BE Statutory Compliance Architecture

Date: 2026-09-07  
Agent: Google Antigravity  
Status: ACCEPTED  

### Context
Under Rule 18AB of the Indian Income Tax Rules, 1962, donations claiming tax deductions under Section 80G must be reported by the charitable trust in an annual return: **Form 10BD**, filed electronically on the Income Tax Department portal on or before May 31st following the financial year. Following successful processing, the Income Tax Department issues official **Form 10BE** certificates.
The NGO platform previously provided instantaneous digital Section 80G donation receipts, but lacked the necessary infrastructure to:
1. Automatically compute and assign Indian Financial Years (April 1 to March 31).
2. Validate donor PAN and address syntax against Income Tax Department standards.
3. Group eligible donations into traceable 10BD filing batches and export standardized preparation CSVs.
4. Manage authentic, government-issued Form 10BE PDF certificates (never falsely auto-generated) and deliver them automatically to donors via email and secure portal download.

### Decision
1. **Never Falsely Generate Official Form 10BE**:
   - The platform strictly distinguishes between the immediate Section 80G donation receipt (generated by the trust) and the official annual Form 10BE certificate (issued by the Income Tax Department).
   - Form 10BE PDFs are uploaded by NGO administrators after downloading them from the government e-filing portal.
2. **Indian Financial Year Engine (`src/lib/financialYear.ts`)**:
   - Implemented strict April 1 – March 31 boundary calculations (`YYYY-YY` format).
   - Automatically assigns `financialYear` to every donation at creation time.
3. **Form 10BD Preparation, Validation & Export (`src/lib/tenBd.ts`)**:
   - Real-time pre-filing auditing validates PAN regex (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`), full correspondence address, and 80G eligibility.
   - Generates statutory Form 10BD CSV with mandatory disclaimer preventing confusion with official Form 10BE certificates.
4. **Filing Batch Lifecycle (`TenBDFiling` Model)**:
   - Batches transition from `DRAFT` -> `EXPORTED` -> `FILED` -> `ACCEPTED`.
   - Recording the Income Tax Acknowledgement Number and Filing Date automatically updates all associated donations to `FILED`, unlocking Form 10BE management.
5. **Secure Document Storage & Tokenized Access (`/api/donations/[id]/10be`)**:
   - Uploaded Form 10BE PDFs undergo file signature (magic byte `%PDF-`) and size verification (<10MB).
   - Public download requires a cryptographically random, unguessable `secureAccessToken` or an authenticated administrative session, preventing unauthorized access or enumeration of donor tax certificates.
6. **Form 10BE Mailer Subsystem (`src/lib/mailer.ts`)**:
   - Built single and bulk email delivery with error isolation and progress reporting. Attaches the authentic Form 10BE PDF with branded notices and legal disclaimers.
7. **Extensible Compliance Provider Abstraction (`ComplianceProvider.ts`)**:
   - Defined `IComplianceProvider` interface with `ManualIncomeTaxWorkflow` (active standard) and `FutureIncomeTaxApiProvider` (future direct API integration stub).

### Reason
- Ensures strict statutory compliance with the Income Tax Act, 1961.
- Eliminates donor audit scrutiny and rejected tax exemptions by delivering authentic Form 10BE certificates.
- Protects confidential donor PAN and tax records from public enumeration.
- Provides NGO trustees with real-time auditability and peace of mind during annual filing cycles.

### Alternatives Considered
- *Auto-generating a pseudo Form 10BE PDF template internally*: Illegal and non-compliant with Income Tax regulations, as only certificates generated by the Income Tax Department bearing official government barcodes and digital signatures are valid for donor tax returns.
- *Public unrestricted download of 10BE PDFs by receipt ID*: Rejected due to severe donor privacy and tax data security risks.

### Consequences
- NGO administrators have a centralized, intuitive 3-tab compliance dashboard (`/admin/compliance/80g`).
- Donors can reliably access both their immediate 80G receipts and their year-end Form 10BE certificates.
- The system is architecturally prepared for future Income Tax direct API e-filing integrations without requiring schema refactoring.

---

## ADR-010: Volunteer-First Participation and Certificate Architecture

Date: 2026-09-11  
Agent: Google Antigravity  
Status: ACCEPTED  

### Context
1. **Organizational Disconnect**: The platform previously featured a public membership system offering paid enrollment tiers (General, Life, Executive, Patron) with registration fee controls. In Indian charitable trust governance, public membership with fee charging creates legal ambiguities regarding trust ownership, governance, and charitable status.
2. **True NGO Model**: The organization's actual operational model is:
   - **Donors** contribute funds and receive Section 80G tax receipts and Form 10BE certificates.
   - **Volunteers** contribute service and time (without fees) and receive Volunteer IDs (`HRMEWT-V-XXXXXX`), orientation, and formal **Certificates of Recognition** (`HRMEWT-CERT-XXXXXX`).
   - **Trustees** oversee governance.
   - **Staff** manage daily operations.
3. **Legal Deed vs. Operating Name**: The registered Trust Deed specifies the legal name `"H.R. MEMORIAL EDUCATIONAL AND WELFARE TRUST"`, whereas public digital assets use `"Nipania Vikash Seva Trust"`. Per strict coordination principles, no artificial relationship was invented; formal cross-reference was recorded as `Organizational naming relationship requires human confirmation.` All legal documents, certificates, and ID card disclaimers cite the exact Deed name.

### Decision
1. **Retire Public Membership Entirely**:
   - Removed all public membership CTAs, forms, fee controls, and sitemap entries.
   - Configured a permanent 308 redirect from `/membership` to `/volunteer`.
   - Preserved historical `Member` database records as read-only archives with zero data deletion.
   - Retired `MEMBER_MANAGER` role and transferred permissions to `VOLUNTEER_MANAGER` and `PROJECT_MANAGER`.
2. **Database-Backed Certificate Model (`Certificate`)**:
   - Added `Certificate` model in Prisma with unique `certificateNumber` (`HRMEWT-CERT-XXXXXX`), `certificateType`, `recipientName`, `recipientEmail`, `description`, `issueDate`, `status` (`DRAFT`, `ISSUED`, `REVOKED`), `verificationCode`, `verificationUrl`, `signatoryName`, `signatoryTitle`, `revokedAt`, and `revocationReason`.
   - Associated certificates with `Volunteer`, `Event`, and `Project` records.
3. **High-Resolution A4 Landscape PDF Engine (`src/lib/certificatePdf.ts`)**:
   - Programmatically renders A4 landscape certificates (297mm x 210mm) using `jspdf`.
   - Incorporates deep navy and gold double ornamental borders, Trust Deed legal header, recipient citation, dynamic QR verification code, issue date, and authorized signatory blocks.
4. **Universal Verification Portal (`/verify` & `/verify/[id]`)**:
   - Single unified verification entrypoint for both ID Cards (`HRMEWT-V-XXXXXX`) and Certificates (`HRMEWT-CERT-XXXXXX`).
   - Server-side database lookup checks validity in real time.
   - Distinct visual handling for `ISSUED`, `REVOKED` (prominently displaying revocation date and mandatory reason), `DRAFT`, `ACTIVE`, and `NOT FOUND` states.
   - Strict privacy shielding prevents exposure of phone numbers, full emails, or personal addresses.
5. **Certificate Admin Studio (`/admin/certificates`)**:
   - Comprehensive studio enabling draft creation, live visual preview modal, issue action, revocation modal with mandatory recorded reason, single/bulk email dispatch with attached PDF, and binary streaming download.
6. **Volunteer System & ID Cards**:
   - Standardized Volunteer ID format to `HRMEWT-V-XXXXXX` with atomic collision-safe generation loop.
   - Added Recognized Service Certificates drawer section in `/admin/volunteers` for quick credential issuance.
   - Updated ID Card templates with official Trust Deed legal notice and removed member badge themes.

### Reason
- Aligns the digital platform with the charitable trust's true legal and operational governance structure.
- Protects the trust's charitable integrity by eliminating paid public membership claims.
- Establishes a verifiable, tamper-evident certificate registry that motivates volunteers, donors, and partners.
- Preserves audit trails and avoids any destructive database operations.

### Consequences
- Volunteers are now the central participatory engine of the trust.
- Certificates issued to volunteers, sponsors, and partners are backed by immutable database records and public QR verification.
- Admin dashboard and sidebar reflect operational reality (Donations, Volunteers, Certificates, Compliance).


