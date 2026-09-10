# Mandatory SEO Generation Guidelines for Nipania Trust

Every AI Agent modifying or creating pages, layouts, or public routes MUST automatically implement and maintain these SEO standards:

## 1. Next.js Metadata API
- Every public route under `src/app/` must export descriptive `metadata` or `generateMetadata()`.
- **Title Tag**: Clear and branded: `Page Name | Nipania Vikash Seva Trust`.
- **Description**: 140–160 characters, concise and action-oriented.
- **Canonical URL**: Always define `alternates: { canonical: 'https://nipaniatrust.org/<path>' }`.
- **OpenGraph & Twitter Card**:
  - `openGraph`: title, description, url, siteName ('Nipania Vikash Seva Trust'), images (`/logo.png` or page featured image), type ('website' or 'article').
  - `twitter`: card ('summary_large_image'), title, description, images.

## 2. Structured Data (Schema.org JSON-LD)
- Include `<script type="application/ld+json">` for appropriate Schema.org entities:
  - Global: `NGO` / `Organization` with name, url, logo, contactPoint, taxID (80G/12A).
  - Breadcrumbs: `BreadcrumbList` on sub-pages.
  - Events/Campaigns: `Event` or `Article` schemas where applicable.

## 3. Heading & Semantic Structure
- Exactly one `<h1>` per page reflecting primary topic.
- Maintain logical heading order (`h1` -> `h2` -> `h3`). Never skip heading levels for styling.
- All `<img>` tags or Next.js `<Image>` must have descriptive, keyword-accurate `alt` text.

## 4. Crawling & AI Search (GEO/AEO)
- Maintain `src/app/robots.ts` and `src/app/sitemap.ts`.
- Ensure `public/llms.txt` is updated whenever major services, donation drives, or organization details change.

## 5. Security & Link Health
- Internal navigation links must point to final URLs without redirect hops (e.g. use `/campaigns` not `/events`).
- Verify no broken internal links using `npm run seo:links`.
