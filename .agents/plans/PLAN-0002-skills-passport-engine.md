# Plan id
PLAN-0002

# Title
Talent Profile, Competency Taxonomy & Digital Skills Passport Engine

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-11-16

# Owner
JED

# Related plan
PLAN-0001 (Builds directly upon foundational Auth, User Identity, and Goal-First Talent Onboarding)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`TaxonomyModule`, `PassportModule`, `CredentialsModule`, `ExplorerModule`)
- Frontend: `/frontend` (`/explorer`, `/talent/dashboard`, `/talent/profile/edit`, `/talent/passport`, `/talent/wallet`, `/p/[handle]`)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: Kelechi's Portable Telecom Record & Tower Maintenance Bidding**

Kelechi is an experienced RF (Radio Frequency) and Microwave Transmission Engineer based in Port Harcourt. Over the past 6 years, he has worked on base station upgrades across Rivers and Bayelsa States, attended specialized fiber training at DBI, and earned multiple manufacturer certifications. However, whenever he bids for contract roles with regional telecom vendors, he has to scan 14 separate paper certificates, email massive PDF attachments, and wait weeks while corporate HR departments try to call previous employers to confirm his credentials. Many smaller vendors simply ignore his application because verifying paper credentials is too slow and fraud-prone.

**How This Plan Fixes It:**
1. Kelechi logs into the **DBI Skills Network** and builds his **Digital Skills Passport**.
2. He searches the official **DBI Competency Taxonomy** and tags his validated skills: *Microwave Link Planning*, *Antenna Alignment*, *BTS Integration*, and *Fiber Splicing*.
3. He uploads his certificates and project portfolio to his **Credential Wallet**. DBI verifies his institute credentials and issues tamper-evident verified badges.
4. The platform generates a unique, shareable **Digital Skills Passport URL and QR Code** (`dbi.skills/p/kelechi-rf-eng`).
5. When bidding on new tower maintenance contracts, Kelechi simply provides his Passport link. Prospective employers scan his QR code, instantly view his verified technical competencies, distinct verification tiers (Self-Declared vs. Demonstrated vs. DBI-Verified), and verify his credentials with zero friction.

---

# Summary

PLAN-0002 implements the flagship individual asset of the DBI Skills Network: the **Digital Skills Passport** and the underlying **Competency Taxonomy Engine**. 

It delivers:
1. **Public Career Readiness Explorer (Value First, Registration Second — Strategy Section 10)**: Unauthenticated preview tool allowing prospective users to select a desired occupation, answer a short set of questions, and receive an instant provisional skills-gap snapshot before opening an account. Registering via `PLAN-0001` automatically saves this progress and unlocks the Passport.
2. **Telecom-First Hierarchical Competency Taxonomy (Strategy Section 9)**: Covers the six initial DBI occupational pathways—(1) RF/RAN & 4G/5G, (2) Fibre Optics & Transmission, (3) IP Networking & NOC, (4) Field Deployment & Tower/Power Infrastructure, (5) Cybersecurity & Cloud, and (6) Network Automation & Applied AI—compatible with ESCO occupational classifications and an employer-validated Nigerian telecom extension.
3. **Progressive Talent Profile Registry & User-Confirmed CV Import (Strategy Sections 4, 7 & 16)**: Accumulates occupations, location, work preferences, experience, projects, certifications, availability, and skills across three distinct tiers (*Declared*, *Demonstrated*, *Verified*) with evidence confidence indicators (*Verified*, *Provisional*, *Insufficient Evidence*). Any automated CV extraction requires explicit user confirmation before saving.
4. **Cryptographically Verifiable Credential Wallet (Strategy Section 5)**: Stores credentials with issuer metadata, competency links, issue/expiry dates, SHA-256 integrity hashes, revocation/status checks, and W3C Verifiable Credentials v2.0 / Open Badges compatible export.
5. **Interactive Digital Skills Passport & Selective Sharing**: Flagship portable profile with public URL, expiring purpose-limited private links, QR verification, PDF/JSON-LD export, and credential correction request pathways—always free at the core level and never displaying a single universal lifelong hiring-fit score.

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Public Career Readiness Explorer API**: Stateless endpoint providing instant provisional readiness analysis without requiring prior registration, plus token/payload hydration into the user's profile after signup.
  - **Competency Taxonomy Service**: Structured taxonomy hierarchy (`Domain -> Occupation/Pathway -> Skill -> Competency Level -> Required Evidence & Safety Standards`) aligned with ESCO mappings and Nigerian telecom extensions.
  - **Talent Profile & Confirmed CV Extraction Engine**: Progressive profile enrichment, work history, project references, availability controls, and draft CV parsing that requires user confirmation prior to persistence.
  - **Digital Skills Passport Service**: Aggregates verified credentials, demonstrated work samples, and declared capabilities into a consolidated passport object while enforcing that ratings remain domain- and skill-specific (no universal lifelong score).
  - **Credential Wallet, Status & Correction Service**: Stores certificates with SHA-256 integrity hashes, issuer metadata, expiration dates, revocation/verification status, and user-initiated correction requests.
  - **Public & Expiring Private Passport Sharing Gatekeeper**: Configurable handle generator (`/p/:handle`), expiring purpose-limited share tokens, and W3C VC v2.0 compatible machine-readable export honoring user-defined privacy settings (`PUBLIC`, `EMPLOYERS_ONLY`, `PRIVATE`).

- **Endpoints**
  - `[ ]` `POST /api/v1/public/career-readiness-explorer` - Public unauthenticated readiness evaluation returning a provisional gap snapshot and hydration token.
  - `[ ]` `GET /api/v1/taxonomy/domains` - Retrieve telecom and ICT domains, occupational pathways, and skill clusters.
  - `[ ]` `GET /api/v1/taxonomy/skills` - Searchable skills registry with autocomplete, proficiency levels, and required evidence standards.
  - `[ ]` `GET /api/v1/talent/profile/me` - Get logged-in talent profile details, availability, and completion breakdown.
  - `[ ]` `PATCH /api/v1/talent/profile/me` - Update professional headline, bio, location, work preferences, availability status, and hydrate Explorer snapshot.
  - `[ ]` `POST /api/v1/talent/profile/cv-parse-preview` - Parse uploaded CV into structured draft fields requiring explicit user confirmation before saving.
  - `[ ]` `POST /api/v1/passport/skills` - Attach declared skill to passport with self-rated proficiency and optional evidence reference.
  - `[ ]` `DELETE /api/v1/passport/skills/:id` - Remove declared skill from profile.
  - `[ ]` `POST /api/v1/passport/credentials` - Upload certification/credential or project evidence with issuer details for wallet storage.
  - `[ ]` `GET /api/v1/passport/credentials` - List talent credential wallet items with verification and expiry status.
  - `[ ]` `POST /api/v1/passport/credentials/:id/correction-request` - Submit a user correction or status review request for a credential record.
  - `[ ]` `GET /api/v1/passport/me` - Generate full compiled Digital Skills Passport data (including machine-readable W3C VC v2.0 / JSON-LD export option).
  - `[ ]` `PATCH /api/v1/passport/visibility` - Update passport privacy settings (`PUBLIC`, `EMPLOYERS_ONLY`, `PRIVATE`).
  - `[ ]` `POST /api/v1/passport/share-links` - Generate an expiring, purpose-limited private share link for an unverified or private passport.
  - `[ ]` `GET /api/v1/passport/public/:handle` - Public, employer-scoped, or token-scoped read-only passport view with QR verification metadata.

- **Implement in Phases**
  - **Phase 1: Taxonomy, Explorer & Drizzle Schema Modeling (Weeks 1-2)**
    - Seed database with the 6 standardized Telecom and ICT competency domains (RF/RAN & 4G/5G, Fibre & Transmission, IP/NOC, Field Deployment & Power, Cybersecurity/Cloud, Network Automation & Applied AI).
    - Implement Drizzle ORM schemas (`backend/src/schema.ts`) and migrations for `taxonomy_domains`, `skills`, `talent_profiles`, `passport_skills`, `credential_wallet_items`, and `passport_share_links`.
    - Implement `POST /api/v1/public/career-readiness-explorer` and unit/integration tests (`node --test`) asserting taxonomy retrieval, Explorer evaluation, and profile creation contracts.
  - **Phase 2: Credential Wallet, CV Confirmation & Passport Assembly (Weeks 3-4)**
    - Implement credential upload handler, SHA-256 hash generation, and correction request workflow.
    - Build passport compilation service clearly distinguishing *Self-Declared*, *Demonstrated*, and *DBI-Verified* skills alongside evidence confidence (*Verified*, *Provisional*, *Insufficient Evidence*).
    - Integration tests covering `PUBLIC`, `EMPLOYERS_ONLY`, `PRIVATE`, and expiring share-link access controls.
  - **Phase 3: QR Verification, W3C VC Export & PDF Generation (Weeks 5-6)**
    - Implement signed QR code verification metadata and W3C Verifiable Credentials v2.0 JSON-LD export structure.
    - Build print/PDF export support and end-to-end verification tests.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Public Career Readiness Explorer (`/explorer`)**: Zero-account interactive occupation selector and quick self-check delivering an instant provisional skills-gap snapshot with a one-click "Save Progress & Create Free Passport" CTA.
  - **Talent Command Centre (`/talent/dashboard` — Strategy Section 8)**: Highlights professional identity, passport share button, verification status, current career goal, readiness summary, and the next most useful action—designed as a professional command centre rather than an administrative form.
  - **Digital Skills Passport Card**: Flagship UI component featuring Midnight Navy (`#10263B`), Ocean Teal (`#128F8A`), Electric Mint (`#64DCD1`), and Warm Gold (`#D9AB60`) verification badges, with distinct visual separation between Declared, Demonstrated, and Verified capabilities.
  - **Profile Enrichment Studio & Confirmed CV Import**: Guided, save-and-resume editor for work history, project references, certifications, availability controls, and a review-and-confirm modal for parsed CV data.
  - **Interactive Taxonomy Skill Picker**: Fast, searchable multi-select with autocomplete, proficiency level selectors, and evidence upload prompts.
  - **Credential Wallet UI**: Grid showing active certificates, issuing bodies, expiration alerts, verification status, and correction request actions.
  - **Public & Private-Link Passport View**: Responsive, low-bandwidth mobile and desktop verification page for recruiters scanning QR codes or opening expiring links.

- **Sub Features**
  - Live QR code generator with modal download (PNG / SVG) and expiring private link generator.
  - One-click PDF and machine-readable JSON-LD Passport export buttons.
  - Instant privacy toggle switch (`Public`, `Verified Employers Only`, `Private`) with clear visual indicator.

- **Pages**
  - `[ ]` `/explorer` - Public unauthenticated Career Readiness Explorer delivering value before registration.
  - `[ ]` `/talent/dashboard` - Talent command centre displaying goal progress, next recommended action, and passport preview.
  - `[ ]` `/talent/profile/edit` - Progressive profile editor, availability controls, confirmed CV import, and portfolio manager.
  - `[ ]` `/talent/passport` - Complete Digital Skills Passport management, selective sharing links, and preview.
  - `[ ]` `/talent/wallet` - Credential Wallet with certificate upload, verification status, and correction requests.
  - `[ ]` `/p/[handle]` - Public or token-authorized shareable verified passport page.

- **Implement in Phases**
  - **Phase 1: Career Readiness Explorer & Talent Command Centre (Weeks 1-2)**
    - Build `/explorer` public flow and connect state handoff into `/auth/signup` and `/onboarding/talent`.
    - Build `/talent/dashboard`, `/talent/profile/edit`, and the Taxonomy Skill Selector with mobile-first low-data responsiveness.
    - Automated component and Playwright tests.
  - **Phase 2: Digital Skills Passport View & Credential Wallet (Weeks 3-4)**
    - Implement the flagship Passport Card (`/talent/passport`) and Credential Wallet (`/talent/wallet`) with upload and correction modals.
  - **Phase 3: Public QR Landing Page, Expiring Links & Export (Weeks 5-6)**
    - Build `/p/[handle]` standalone verification page, QR modal, and print/PDF export.
    - End-to-end Playwright verification on desktop and mobile viewports.

# Implementation progress — 2026-11-16 (Strategy & Architecture Alignment)
- Aligned `PLAN-0002` with `DBI_Skills_Network_Illustrated_Product_Strategy.txt` (Sections 4, 5, 6, 7, 8, 9, 10, 16, 17, and Appendix B) and the repo's Drizzle ORM / NestJS / Next.js architecture:
  - Added the 6 telecom-first competency pathways and ESCO-compatible Nigerian telecom taxonomy structure.
  - Added expiring private share links, W3C Verifiable Credentials v2.0 machine-readable export, credential correction requests, user-confirmed CV import preview, and explicit prohibition of a single universal lifelong hiring score.
  - Connected `/explorer` (*"Value first, registration second"*) directly into `PLAN-0001` signup and `/onboarding/talent` hydration.

