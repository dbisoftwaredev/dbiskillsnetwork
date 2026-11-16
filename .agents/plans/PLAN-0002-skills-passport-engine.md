# Plan id
PLAN-0002

# Title
Talent Profile, Competency Taxonomy & Digital Skills Passport Engine

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-10-31

# Owner
JED

# Related plan
PLAN-0001 (Builds directly upon foundational Auth and User Identity)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`TaxonomyModule`, `PassportModule`, `CredentialsModule`)
- Frontend: `/frontend` (`/talent/profile`, `/talent/passport`, `/passport/[handle]`)
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
1. **Public Career Readiness Explorer (Value First, Registration Second)**: Unauthenticated preview tool allowing prospective users to select an occupation, complete a quick self-check, and receive an instant provisional skills-gap snapshot before signing up.
2. **Hierarchical Competency Taxonomy**: Telecom-first standard framework spanning RF Engineering, Fiber Optics, 5G Core, Cloud, Cybersecurity, and Software.
3. **Progressive Talent Profile Registry**: Declarative, demonstrated, and verified skill tiers with evidence attachments.
4. **Cryptographically Verifiable Credential Wallet**: Digital credential storage with verifiable metadata, issuer audit, and SHA-256 hash signatures.
5. **Interactive Digital Skills Passport**: High-polish web and mobile passport card with QR code sharing, customizable privacy visibility (Public / Verified Employers / Private), and PDF export capabilities.

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Public Career Readiness Explorer API**: Stateless endpoint providing instant provisional readiness analysis without requiring prior registration (powers "Value first, registration second").
  - **Competency Taxonomy Service**: Structured taxonomy hierarchy (Domain -> Cluster -> Skill -> Competency Level -> Evidence Standards).
  - **Talent Profile Engine**: Progressive profile enrichment, work history, education, portfolio links, and location preferences.
  - **Digital Skills Passport Service**: Aggregates verified credentials, declared capabilities, and verification levels into a consolidated passport object.
  - **Credential Wallet & Cryptographic Hash Issuance**: Stores certificates with SHA-256 integrity hashes, issuer metadata, expiration dates, and verification status.
  - **Public Passport Sharing & Privacy Gatekeeper**: Configurable handle generator (`/p/:handle`) honoring user-defined privacy settings (Public, Employers Only, Private).

- **Endpoints**
  - `POST /api/v1/public/career-readiness-explorer` - Public unauthenticated readiness evaluation returning provisional gap snapshot.
  - `GET /api/v1/taxonomy/domains` - Retrieve industry domains and skill clusters.
  - `GET /api/v1/taxonomy/skills` - Searchable skills registry with autocomplete and proficiency levels.
  - `GET /api/v1/talent/profile/me` - Get logged-in talent profile details.
  - `PATCH /api/v1/talent/profile/me` - Update professional headline, bio, location, and availability status.
  - `POST /api/v1/passport/skills` - Attach declared skill to passport with self-rated proficiency and optional evidence.
  - `DELETE /api/v1/passport/skills/:id` - Remove skill from profile.
  - `POST /api/v1/passport/credentials` - Upload certification/credential with issuer details for wallet storage.
  - `GET /api/v1/passport/credentials` - List talent credential wallet items.
  - `GET /api/v1/passport/me` - Generate full compiled Digital Skills Passport data.
  - `PATCH /api/v1/passport/visibility` - Update passport privacy settings (PUBLIC, EMPLOYERS_ONLY, PRIVATE).
  - `GET /api/v1/passport/public/:handle` - Public or employer-scoped read-only passport view with QR verification metadata.

- **Implement in Phases**
  - **Phase 1: Taxonomy & Database Modeling (Weeks 1-2)**
    - Seed database with standardized Telecom, ICT, and Software competency taxonomies.
    - Write Prisma/TypeORM schemas for `TaxonomyDomain`, `Skill`, `TalentProfile`, `PassportSkill`, and `CredentialWallet`.
    - Unit tests asserting taxonomy retrieval and profile creation contracts.
  - **Phase 2: Credential Wallet & Passport Assembly (Weeks 3-4)**
    - Implement credential upload handler and SHA-256 hash generation for credential integrity.
    - Build passport compilation service distinguishing self-declared, peer-endorsed, and DBI-verified skills.
    - Integration tests covering public access controls and privacy rule enforcement.
  - **Phase 3: QR Code Generation & PDF Export (Weeks 5-6)**
    - Implement signed QR code generator pointing to verified passport handles.
    - PDF export generation service utilizing headless renderer.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Digital Skills Passport Card**: Flagship UI component featuring Midnight Navy (`#10263B`), Ocean Teal (`#128F8A`), Electric Mint (`#64DCD1`), and Warm Gold (`#D9AB60`) verification badges.
  - **Profile Enrichment Studio**: Guided wizard for entering work history, education, certifications, and portfolio media.
  - **Interactive Taxonomy Skill Picker**: Fast, searchable multi-select with autocomplete, proficiency level sliders (Novice -> Master), and evidence upload prompts.
  - **Credential Wallet UI**: Grid showing active certificates, issuing bodies, expiration alerts, and digital badges.
  - **Public Passport View**: Beautiful, responsive, standalone mobile and desktop page for recruiters scanning QR codes.

- **Sub Features**
  - Live QR code generator with modal download (PNG / SVG).
  - One-click PDF Passport download button.
  - Instant privacy toggle switch with clear visual indicator of current visibility mode.

- **Pages**
  - `/explorer` - Public unauthenticated Career Readiness Explorer delivering value before registration.
  - `/talent/dashboard` - Talent home displaying profile completion percentage and passport preview.
  - `/talent/profile/edit` - Personal info, career preferences, and portfolio manager.
  - `/talent/passport` - Complete Digital Skills Passport management and preview.
  - `/talent/wallet` - Credential Wallet with certificate upload and verification status.
  - `/p/[handle]` - Public shareable verified passport page.

- **Implement in Phases**
  - **Phase 1: Profile & Skills UI Components (Weeks 1-2)**
    - Build Taxonomy Skill Selector with search, level sliders, and tag chips.
    - Implement Talent Profile layout with mobile-first responsiveness.
    - Component unit tests with React Testing Library.
  - **Phase 2: Digital Skills Passport View & Wallet (Weeks 3-4)**
    - Implement the flagship Passport Card with responsive flip/detail views.
    - Build Credential Wallet grid and certificate upload modal.
  - **Phase 3: Public QR Landing Page & PDF Export (Weeks 5-6)**
    - Build `/p/[handle]` standalone public verification page.
    - Test responsive layouts and QR scanning journeys on mobile devices.

