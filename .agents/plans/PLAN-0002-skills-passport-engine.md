# Plan id
PLAN-0002

# Title
Talent Profile, 6-Pathway Telecom Taxonomy, Readiness Explorer & Digital Skills Passport (PILOT — Target: 26 Nov 2026)

# Status
DRAFT (PILOT TARGET — Target: 26 Nov 2026)

# Created at
2026-10-31

# Updated at
2026-11-26

# Owner
JED

# Related plan
PLAN-0001 (Builds directly upon foundational Auth, User Identity, and Goal-First Talent Onboarding); PLAN-0007 (Houses deferred post-pilot Credential Wallet file uploads, W3C VC v2.0 signing, CV parsing & headless PDF export)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`TaxonomyModule`, `PassportModule`, `ExplorerModule`)
- Frontend: `/frontend` (`/explorer`, `/talent/dashboard`, `/p/[handle]`)
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
4. The platform generates a unique, shareable **Digital Skills Passport URL and QR Code** (illustrative only: `https://<configured-domain>/p/kelechi-rf-eng`).
5. When bidding on new tower maintenance contracts, Kelechi simply provides his Passport link. Prospective employers scan his QR code, instantly view his verified technical competencies, distinct verification tiers (Self-Declared vs. Demonstrated vs. DBI-Verified), and verify his credentials with zero friction.

---

# Summary

PLAN-0002 implements the flagship individual asset of the DBI Skills Network: the **Digital Skills Passport** and the underlying **Competency Taxonomy Engine**. 

It delivers:
1. **Public Career Readiness Explorer (Value First, Registration Second — Strategy Section 10)**: Unauthenticated preview tool allowing prospective users to select a desired occupation, answer a short set of questions, and receive an instant provisional skills-gap snapshot before opening an account. Registering via `PLAN-0001` offers to redeem a short-lived, single-use snapshot token during PLAN-0001 signup, saving the user-confirmed provisional results and unlocking the Passport.
2. **Telecom-First Hierarchical Competency Taxonomy (Strategy Section 9)**: Covers the six initial DBI occupational pathways—(1) RF/RAN & 4G/5G, (2) Fibre Optics & Transmission, (3) IP Networking & NOC, (4) Field Deployment & Tower/Power Infrastructure, (5) Cybersecurity & Cloud, and (6) Network Automation & Applied AI—compatible with ESCO occupational classifications and an employer-validated Nigerian telecom extension.
3. **Progressive Talent Profile Registry & User-Confirmed CV Import (Strategy Sections 4, 7 & 16)**: Accumulates occupations, location, work preferences, experience, projects, certifications, availability, and skills across three distinct tiers (*Declared*, *Demonstrated*, *Verified*) with evidence confidence indicators (*Verified*, *Provisional*, *Insufficient Evidence*). Any automated CV extraction requires explicit user confirmation before saving.
4. **Credential Wallet, Recognition of Prior Learning (RPL) & Verifiable Issuance (Strategy Section 5)**: Stores credential evidence with issuer metadata, competency links, issue/expiry dates, SHA-256 file hashes, issuer verification and status checks; separately issues cryptographically signed W3C Verifiable Credentials v2.0 / Open Badges compatible artifacts when the DBI issuer workflow is approved. A file hash alone is not an issuer signature. When a talent holds recognized standard qualifications or industry certifications (e.g., Cisco CCNA, CCNP, Huawei HCIA/HCIP, CompTIA, FOA CFOT, or DBI diplomas) and submits the certification/document evidence, a Platform Admin (`DBI_ADMIN` / `SUPER_ADMIN` with MFA) can verify the document and grant **Recognition of Prior Learning (RPL)** on the mapped taxonomy skills—promoting those skills directly to `evidenceTier: VERIFIED` (with `confidence: VERIFIED` and provenance/verification label `VERIFIED_VIA_RPL` / `"Verified (RPL / Certification)"`) without forcing the individual to re-take a redundant SkillVerify assessment. Both private profile/passport endpoints (`GET /api/v1/passport/me`, `GET /api/v1/talent/profile/me`) and public/employer Skills Passport views (`GET /api/v1/passport/public/:handle`) return the verified tag, verification source (`SKILLVERIFY_ASSESSMENT` vs. `RPL_CERTIFICATION`), and verified issuer/qualification label while keeping private certificate file/ID details unexposed on public output.
5. **Interactive Digital Skills Passport & Selective Sharing**: Flagship portable profile with public URL, expiring purpose-limited private links, QR verification, PDF/JSON-LD export, and credential correction request pathways—always free at the core level and never displaying a single universal lifelong hiring-fit score.

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Public Career Readiness Explorer API**: Stateless endpoint providing instant provisional readiness analysis without requiring prior registration, plus token/payload hydration into the user's profile after signup.
  - **Competency Taxonomy Service**: Structured taxonomy hierarchy (`Domain -> Occupation/Pathway -> Skill -> Competency Level -> Required Evidence & Safety Standards`) aligned with ESCO mappings and Nigerian telecom extensions.
  - **Talent Profile & Confirmed CV Extraction Engine**: Progressive profile enrichment, work history, project references, availability controls, and draft CV parsing that requires user confirmation prior to persistence.
  - **Digital Skills Passport Service**: Aggregates verified credentials, demonstrated work samples, and declared capabilities into a consolidated passport object while enforcing that ratings remain domain- and skill-specific (no universal lifelong score).
  - **Credential Wallet, Status & Correction Service**: Stores certificates with SHA-256 integrity hashes, issuer metadata, expiration dates, revocation/verification status, and user-initiated correction requests.
  - **Recognition of Prior Learning (RPL) & Admin Credential-to-Skill Verification**: Enables Platform Admins (`DBI_ADMIN` / `SUPER_ADMIN` with MFA) to inspect submitted industry certifications/documents (e.g., CCNA, CCNP, HCIA/HCIP, FOA CFOT) and approve RPL skill verification, tagging mapped skills as `VERIFIED` (`verificationSource: 'RPL_CERTIFICATION'`, `verifiedLabel: 'Verified via RPL (CCNA)'`) across private profile and public Skills Passport responses without requiring redundant re-testing.
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
  - `[ ]` `POST /api/v1/passport/credentials` - Upload certification/credential or project evidence with issuer and RPL certification metadata (`qualificationCode`, e.g., `CCNA`, `CCNP`, `documentName`, `documentSha256`, `issuer`, `issueDate`, `expiryDate`, `mappedSkillIds`) for wallet storage and optional RPL verification review.
  - `[ ]` `GET /api/v1/passport/credentials` - List talent credential wallet items with verification, RPL status, mapped skills, and expiry status.
  - `[ ]` `GET /api/v1/admin/passport/rpl-verifications` - Platform admin (`DBI_ADMIN` / `SUPER_ADMIN`) endpoint: list pending Recognition of Prior Learning (RPL) certification/document verification requests.
  - `[ ]` `PATCH /api/v1/admin/passport/rpl-verifications/:credentialId/decide` - Platform admin endpoint: approve or reject RPL certification verification with human-reviewed reason and audit log entry; approval promotes mapped `passport_skills` to `evidenceTier: VERIFIED`, `confidence: VERIFIED`, and attaches the verified RPL tag/label (`verificationSource: 'RPL_CERTIFICATION'`) on both private profile (`GET /api/v1/passport/me`) and public passport (`GET /api/v1/passport/public/:handle`) views without requiring redundant testing.
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
    - Implement QR links to an issuer-signed credential/status verification route (the QR image alone is not a cryptographic proof) and W3C Verifiable Credentials v2.0 JSON-LD export structure.
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

# Plan review and implementation hardening — 2026-11-16

> **Review-only update.** No PLAN-0002 endpoint or UI was verified as implemented. Retain `DRAFT` and every original unchecked item. Strategy references in the original plan were not re-validated because the referenced strategy file was not included in this review.

## Domain boundaries and canonical data model
- PLAN-0002 is the **sole owner** of `taxonomy`, `talent_profiles`, `passport_skills`, `credential_wallet_items`, `passport_share_links` and public Explorer scoring. PLAN-0001 owns the authentication record and goal-first onboarding core state. PLAN-0003 writes signed evidence/assessment outcomes to the Passport through a controlled domain service, not direct cross-module SQL writes.
- Distinguish three independent axes on every claimed skill: **evidence tier** (`DECLARED`, `DEMONSTRATED`, `VERIFIED`), **evidence confidence** (`VERIFIED`, `PROVISIONAL`, `INSUFFICIENT_EVIDENCE`), and **per-skill proficiency** (`nullable 1.0–5.0` only if the rubric justifies it). An uploaded file is not automatically `VERIFIED`; only a recognized issuer, authorized assessor, or audited Platform Admin (`DBI_ADMIN` / `SUPER_ADMIN`) RPL verification decision can assign `VERIFIED` status. Specifically, `VERIFIED` skill status on a Passport can be granted via two audited pathways: (1) a finalized `PLAN-0003` SkillVerify assessment/lab sign-off (`verificationSource: 'SKILLVERIFY_ASSESSMENT'`), or (2) a Platform Admin **Recognition of Prior Learning (RPL)** decision on a verified standard certification/document such as CCNA or CCNP (`verificationSource: 'RPL_CERTIFICATION'`). For safety-critical physical fieldwork (e.g., tower climbing/rigging, live laser/OTDR or high-voltage handling in `PLAN-0003`), RPL verifies the theoretical/vendor qualification while any mandatory physical safety gate remains governed by DBI safety policy. Preserve source/provenance, rubric/RPL decision reference, and dates.
- Make the six domain labels and skill IDs versioned canonical taxonomy records; external ESCO codes are explicit mappings, not proof that a Nigerian employer has endorsed the skill. Retire/deprecate rather than delete used IDs, with aliases and migration-safe version history.

## Data privacy, sharing, CV imports and proof verification
- PUBLIC returns only fields the user deliberately opted to publish. `EMPLOYERS_ONLY` must check an authenticated, verified employer **plus** explicit talent discovery/share permission; `PRIVATE` returns nothing without a valid owner-issued scoped token. Do not expose sensitive phone, birth date, personal email, exact address, unredacted IDs, CV source files or internal verification notes by default.
- Share tokens are random, hashed at rest, scoped to passport version/allowed fields, optionally organization-bound, expire, can be revoked and are rate-limited. Use `Cache-Control: no-store` on private responses. QR codes are URL transport, not evidence of issuer authenticity.
- Separate **uploaded evidence integrity** (SHA-256) from **issuer authentication and verifiable credential issuance** (digital signature/proof, trusted issuer key, verified holder binding, expiration and revocation/status). JSON-LD-shaped output is not a verifiable credential unless its required securing and verification profile is implemented and independently tested. Use test vectors for forged, expired and revoked credentials.
- CV parsing must be preview-only until the talent explicitly confirms each field; restrict file size/type, scan uploads, encrypt objects, support correction/deletion and never retain raw CV files indefinitely by default. Public Explorer data must have short retention/TTL and cannot silently create a persistent user profile.

## Proposed contract additions / adjustments
- `[ ]` `POST /api/v1/public/career-readiness-explorer/redeem` — authenticated redemption using single-use token, user confirmation and idempotency key; coordinate with PLAN-0001 `/users/me` onboarding state to avoid duplicate hydration.
- `[ ]` `POST /api/v1/talent/profile/cv-parse-confirm` — save only specifically accepted draft fields, with field provenance and expected profile version.
- `[ ]` `POST /api/v1/passport/share-links/:id/revoke` — owner-driven link revocation, with audited reason.
- `[ ]` `GET /api/v1/passport/credentials/:id/verify` — privacy-safe verification result including issuer identity, integrity, issuance, expiry, revocation and signature-validation outcome.
- `[ ]` `GET /api/v1/passport/exports?format=pdf|vc-jsonld` — separate exports from `/passport/me` JSON to avoid conflating machine-readable format, PDF and cryptographic proof; gate signed VC export until issuer keys, proof suite and verification tests exist.
- `[ ]` `GET /api/v1/taxonomy/versions` — supported taxonomy versions and migration/alias metadata for downstream PLAN-0003–0006 consumers.

## Acceptance criteria
- `[ ]` Guest Explorer response is explicitly **provisional**, cannot be interpreted as formal DBI verification, and expires safely; replayed/expired hydration tokens are rejected without failing registration.
- `[ ]` Verify that `PUBLIC`, `EMPLOYERS_ONLY`, and `PRIVATE` access checks reject anonymous probing, other tenant lookups, raw file enumeration, revoked/expired share links and unexpected export formats.
- `[ ]` Demonstrated/verified evidence cannot be raised by talent profile edits, self-rating, file upload or CV parsing alone. Missing assessment evidence stays `INSUFFICIENT_EVIDENCE`, not a fabricated zero competency.
- `[ ]` Digital signatures, issuer trust, revocation and expiry produce correctly different outcomes for genuine, tampered, expired and revoked signed credentials. Contract tests pin the W3C v2.0 representation selected by DBI.
- `[ ]` Offline/print PDF is marked with a generated-at timestamp and a revalidation URL; subsequent revocations make online validation show the new status even if someone retains an old PDF.

## Phased release gate / dependencies
- P0: taxonomy + Explorer contract + progressive talent profile + access-controlled read-only Passport (after PLAN-0001 identity).
- P1: upload/issuer-validation workflow, private shares, correction and revocation.
- P2: signed W3C VC/Open Badges interoperability after key-management and validator design approval. Do not advertise standards conformance before the signature and revocation tests pass.

---

# Pilot Scope (Target: Thu, 26 Nov 2026) & Trimmed Post-Pilot Features

To keep the **30 November 2026 Month-End Pilot** lean and prevent AI agents from bloating `PLAN-0002`, only the deliverables below are executed during the November Pilot (**24–26 Nov 2026**). All other items are deferred to **`PLAN-0007`**.

### Lean Pilot Deliverables (IN Scope for 26 Nov 2026)
- **Backend (Jed)**:
  - Seed the **6 Telecom/ICT domains**, ~20 core skills, and 4 pilot role benchmarks.
  - `POST /api/v1/public/career-readiness-explorer` — stateless 5-question self-check for a target occupation returning a provisional readiness band, missing skills, and a short-lived one-use redemption token (`explorer.snapshot_created.v1`).
  - `GET /api/v1/taxonomy/domains` & `GET /api/v1/taxonomy/skills`.
  - `GET /api/v1/talent/profile/me` & `PATCH /api/v1/talent/profile/me` (including one-time Explorer snapshot redemption with explicit user confirmation).
  - `POST /api/v1/passport/skills` & `DELETE /api/v1/passport/skills/:id` — stores skills with separate `evidenceTier` (`DECLARED` / `DEMONSTRATED` / `VERIFIED`), `confidence` (`VERIFIED` / `PROVISIONAL` / `INSUFFICIENT_EVIDENCE`), and nullable `proficiency` (`1.0–5.0`, null when unassessed) per `.agents/docs/CROSS_PLAN_CONTRACTS.md`.
  - `GET /api/v1/passport/me`, `PATCH /api/v1/passport/visibility` (`PUBLIC`, `EMPLOYERS_ONLY`, `PRIVATE`), and `GET /api/v1/passport/public/:handle` (never exposes private contact/credential fields on public output, while displaying verified skill tags/labels including `RPL_CERTIFICATION` vs. `SKILLVERIFY_ASSESSMENT` provenance).
  - **Lean Recognition of Prior Learning (RPL) Metadata & Admin Verification** (using the same lightweight `documentName` + `documentSha256` + `qualificationCode`/`issuer` + `mappedSkillIds` metadata pattern as `PLAN-0001` organization verification—hashed client-side in the browser and stored in PostgreSQL, ready to bind to our provisioned **Neon Object Storage** `uploads` bucket via `files-sdk/neon` or Cloudflare R2 `files-sdk/r2` via `StorageModule`):
    - `POST /api/v1/passport/rpl-requests` (or `POST /api/v1/passport/credentials` with metadata + `mappedSkillIds`) & `GET /api/v1/passport/credentials` — talent submits standard qualification/certification metadata (e.g., CCNA, CCNP) linked to target taxonomy skills for RPL review.
    - `GET /api/v1/admin/passport/rpl-verifications` & `PATCH /api/v1/admin/passport/rpl-verifications/:credentialId/decide` — Platform Admin (`DBI_ADMIN` / `SUPER_ADMIN` with MFA) reviews and approves/rejects RPL verification; approval immediately promotes mapped `passport_skills` to `VERIFIED` (`verificationSource: 'RPL_CERTIFICATION'`, `verifiedLabel`) across `/talent/dashboard` (`GET /api/v1/passport/me`, `GET /api/v1/talent/profile/me`) and `/p/[handle]` (`GET /api/v1/passport/public/:handle`).
- **Frontend (Kate)**:
  - `/explorer` — Public 1-page Career Readiness Explorer with *"Sign up to save your snapshot"* CTA linking into `/auth/signup`.
  - `/talent/dashboard` — Lean Talent Command Centre displaying career goal, Explorer readiness snapshot, inline profile/skill editor (keeping `/talent/profile/edit` and `/talent/passport` lightweight or embedded tabs), RPL certification submission metadata form, and Passport share link.
  - `/p/[handle]` — Public / Verified-Employer Digital Skills Passport Card with client-side QR code and distinct `DECLARED` vs. `VERIFIED` badges (showing RPL verified labels such as `Verified via RPL (CCNA)` when granted by Platform Admin). Use browser `window.print()` print stylesheet for PDF save instead of a backend headless renderer.

### Trimmed to `PLAN-0007` (Agents MUST NOT build in Pilot)
- `POST /api/v1/talent/profile/cv-parse-preview` & `POST /api/v1/talent/profile/cv-parse-confirm` (AI/LLM CV parsing).
- Malware-scanning pipelines, credential correction sub-queues (`POST /api/v1/passport/credentials/:id/correction-request`), and cryptographic credential status endpoints (`GET /api/v1/passport/credentials/:id/verify`) — **Neon Object Storage** (`uploads` bucket via `files-sdk/neon`) is provisioned and verified, while lightweight metadata-based RPL certification submission and Platform Admin RPL skill verification remain in scope for `PLAN-0002`.
- `POST /api/v1/passport/share-links` & `POST /api/v1/passport/share-links/:id/revoke` (expiring share tokens).
- W3C Verifiable Credentials v2.0 JSON-LD cryptographic signing (`GET /api/v1/passport/exports?format=vc-jsonld`) and server-side headless PDF rendering.

# Implementation progress — 2026-11-20 (Pilot Scope Trim)
- Trimmed `PLAN-0002` into a 3-day **Pilot target (Thu, 26 Nov 2026)** covering the 6-pathway taxonomy seed, public `/explorer`, progressive profile + declared/verified skills, and shareable `/p/[handle]` QR Passport Card with browser print-to-PDF.
- Moved CV parsing, file-backed Credential Wallet uploads, expiring share tokens, correction workflows, W3C VC v2.0 signing, and headless PDF rendering to **`PLAN-0007`** (Post-Pilot). `PLAN-0002` remains `DRAFT (PILOT TARGET)`.

# Implementation progress — 2026-11-26 (Recognition of Prior Learning — RPL Admin Skill Verification)
- Added **Recognition of Prior Learning (RPL)** workflow to `PLAN-0002` so Platform Admins (`DBI_ADMIN` / `SUPER_ADMIN` with MFA) can verify submitted standard qualifications and uploaded certification document metadata (e.g., CCNA, CCNP, HCIA/HCIP, FOA CFOT, DBI diplomas) via `GET /api/v1/admin/passport/rpl-verifications` and `PATCH /api/v1/admin/passport/rpl-verifications/:credentialId/decide`.
- Approved RPL certifications promote mapped `passport_skills` to `evidenceTier: VERIFIED` and `confidence: VERIFIED` with `verificationSource: 'RPL_CERTIFICATION'` and a human-readable verified RPL tag/label returned on both private profile/passport responses (`GET /api/v1/talent/profile/me`, `GET /api/v1/passport/me`) and public/employer Passport responses (`GET /api/v1/passport/public/:handle`), avoiding redundant SkillVerify re-testing while keeping raw certificate IDs/documents private.
- Included lightweight SHA-256 + metadata RPL submission & admin verification in the Pilot deliverables while keeping Cloudflare R2 raw binary uploads, malware scanning, and correction sub-queues deferred to `PLAN-0007`.

# Implementation progress — 2026-11-26 (Backend Modules, Migration 0007 & Unit/Swagger Tests on `feat/plan-0002-taxonomy-explorer-passport-api`)
- Implemented `TaxonomyModule` (`taxonomy.seed.ts` with 6 Telecom/ICT domains, 20 core skills, and 4 role benchmarks; `GET /api/v1/taxonomy/domains`, `GET /api/v1/taxonomy/skills`), `ExplorerModule` (`POST /api/v1/public/career-readiness-explorer`), `StorageModule` (`POST /api/v1/storage/presign-upload`, `GET /api/v1/storage/signed-download` backed by `files-sdk/neon` `uploads` bucket), and `PassportModule` (`GET`/`PATCH /api/v1/talent/profile/me`, `POST`/`DELETE /api/v1/passport/skills`, `GET /api/v1/passport/me`, `PATCH /api/v1/passport/visibility`, `GET /api/v1/passport/public/:handle`, `POST`/`GET /api/v1/passport/credentials`, `GET /api/v1/admin/passport/rpl-verifications`, `PATCH /api/v1/admin/passport/rpl-verifications/:credentialId/decide`).
- Added Drizzle schema tables and generated migration `backend/drizzle/0007_wandering_praxagora.sql`.
- Verified `npm.cmd run typecheck -w backend`, `npm.cmd run build -w backend`, and `npm.cmd test -w backend` (24/24 tests passing, including `swagger.test.ts`, `taxonomy-explorer.policy.test.ts`, `passport-rpl.policy.test.ts`, and `storage.policy.test.ts`).
- Remaining before marking endpoints `[x]`: apply migration `0007_wandering_praxagora.sql` to live PostgreSQL (`npm.cmd run db:migrate -w backend`) and run live DB integration checks.
