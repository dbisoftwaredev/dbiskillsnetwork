# Plan id
PLAN-0007

# Title
Post-Pilot Deepening: W3C Verifiable Credentials v2.0, Confirmed CV Extraction, Proctored Telecom Simulations, Appeals Queue & Cloudflare R2 Object Storage

# Status
DRAFT (POST-PILOT — Deferred Until After 30 Nov 2026 Pilot)

# Created at
2026-11-20

# Updated at
2026-11-26

# Owner
JED

# Related plan
PLAN-0001, PLAN-0002, PLAN-0003 (Houses advanced capabilities trimmed from the November 2026 Pilot)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`StorageModule`, `CredentialsModule`, `ProctoringModule`, `AppealsModule`, `NotificationDispatchModule`)
- Frontend: `/frontend` (`/talent/profile/cv-import`, `/talent/wallet`, `/talent/assessments/[id]/appeal`, `/admin/assessments/appeals`)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

> *Once the November 2026 Pilot validates core onboarding, shareable QR Passports, basic MCQ assessments, and verified-employer shortlisting with initial anchor employers, DBI scales the platform for high-volume institutional operations. Employers require tamper-evident W3C Verifiable Credentials and scanned CAC/certificate object storage; busy technicians want confirmed CV extraction instead of manual typing; and candidates taking high-stakes lab/simulation assessments need formal integrity telemetry and human appeal workflows.*

---

# Summary

This **Post-Pilot** plan consolidates all advanced capabilities deliberately trimmed out of `PLAN-0001`, `PLAN-0002`, and `PLAN-0003` so the November 2026 Pilot stays lean and ships by **30 November 2026** without AI agent bloat:

1. **Controlled Object Storage (`Neon Object Storage` / `Cloudflare R2`), Malware Scanning & Media Processing (deferred from `PLAN-0001` & `PLAN-0002`)**: Private S3-compatible object storage using **Neon Object Storage** (`uploads` bucket already provisioned in `neon.ts` via `files-sdk/neon` and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_ENDPOINT_URL_S3` / `AWS_REGION`, with **Cloudflare R2** `files-sdk/r2` as an optional one-line adapter swap) for CAC/institutional verification evidence and Credential Wallet / RPL certificate files, using presigned upload URLs, SHA-256 integrity binding to existing Pilot metadata records, allowlisted MIME types, size caps, malware scanning, short-lived signed reviewer download URLs, and frontend avatar/logo cropper + inline PDF preview.
2. **External Multi-Channel Messaging & Queues (deferred from `PLAN-0001`)**: Redis-backed background job queues plus external SMS and approved WhatsApp Business notification dispatchers (keeping email + in-app in the Pilot).
3. **W3C Verifiable Credentials v2.0, Headless PDF & Credential Wallet Workflows (deferred from `PLAN-0002`)**: Cryptographically signed W3C VC v2.0 / Open Badges JSON-LD issuance (`GET /api/v1/passport/exports?format=pdf|vc-jsonld`), issuer key management & revocation status checking (`GET /api/v1/passport/credentials/:id/verify`), full Credential Wallet uploads & correction/dispute queues (`POST /api/v1/passport/credentials/:id/correction-request`), and expiring purpose-limited share links (`POST /api/v1/passport/share-links` & `POST /api/v1/passport/share-links/:id/revoke`).
4. **User-Confirmed CV Extraction (deferred from `PLAN-0002`)**: Assisted CV parsing preview (`POST /api/v1/talent/profile/cv-parse-preview`) and explicit confirmation persistence (`POST /api/v1/talent/profile/cv-parse-confirm`) with short raw-file retention.
5. **Telecom Simulations, Supervisor Endorsements, Integrity Telemetry & Appeals Queue (deferred from `PLAN-0003`)**: Interactive telecom simulation/work-sample runners, authorized supervisor endorsements (`POST /api/v1/assessments/endorsements`), focus-loss/malpractice review telemetry (flagged for human review, never opaque disqualification), physical campus booking slots (`GET /api/v1/assessments/:id/slots`, `POST /api/v1/assessments/:id/bookings`), and formal candidate appeal queues (`POST /api/v1/assessments/sessions/:sessionId/appeals`, `GET /api/v1/admin/assessments/appeals`, `PATCH /api/v1/admin/assessments/appeals/:appealId/decide`).

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Private Object Storage (`Neon Object Storage` / `Cloudflare R2`) & Malware Scanning Service**: S3-compatible presigned upload (`POST /api/v1/storage/presign-upload`) and short-lived signed reviewer download URLs (`GET /api/v1/storage/signed-download`) using `files-sdk/neon` (`uploads` bucket, provisioned in `neon.ts`) with optional `files-sdk/r2` Cloudflare R2 swap for CAC verification files and Credential Wallet / RPL certificates, with SHA-256 integrity binding, retention, and deletion enforcement.
  - **Redis Queue & External SMS/WhatsApp Dispatcher**: Asynchronous transactional/alert delivery honoring `PLAN-0001` channel, consent, and frequency rules.
  - **W3C VC v2.0 Issuer Signing, Status & Export Service**: Independent issuer proof generation, revocation lists, verification endpoint, and headless PDF Passport rendering.
  - **Confirmed CV Extraction & Wallet Correction Service**: Ephemeral CV parsing into draft structures (never persisted until confirmed) plus credential status correction requests.
  - **Simulations, Lab Bookings, Endorsements & Appeals Service**: Capacity-checked DBI campus lab bookings, work-sample artifacts, supervisor endorsements, integrity flags, and independent appeal review state machines.

- **Endpoints**
  - `[ ]` `POST /api/v1/storage/presign-upload` & `GET /api/v1/storage/signed-download` - Private S3-compatible (`files-sdk/neon` `uploads` bucket / `files-sdk/r2`) presigned upload and short-lived signed reviewer download links for `PLAN-0001` CAC/institutional verification and `PLAN-0002` Credential Wallet / RPL files, preserving SHA-256 integrity binding with Pilot metadata records.
  - `[ ]` `POST /api/v1/talent/profile/cv-parse-preview` & `POST /api/v1/talent/profile/cv-parse-confirm` - Draft CV parsing and explicit user-confirmed profile persistence.
  - `[ ]` `POST /api/v1/passport/credentials` & `GET /api/v1/passport/credentials` - Full file-backed Credential Wallet storage.
  - `[ ]` `POST /api/v1/passport/credentials/:id/correction-request` & `GET /api/v1/passport/credentials/:id/verify` - Credential correction intake and cryptographic/status verification.
  - `[ ]` `POST /api/v1/passport/share-links` & `POST /api/v1/passport/share-links/:id/revoke` - Expiring, purpose-limited private share tokens and revocation.
  - `[ ]` `GET /api/v1/passport/exports?format=pdf|vc-jsonld` - Server-rendered PDF and W3C VC v2.0 JSON-LD export.
  - `[ ]` `GET /api/v1/assessments/:id/slots` & `POST /api/v1/assessments/:id/bookings` - Physical DBI lab scheduling.
  - `[ ]` `POST /api/v1/assessments/endorsements` - Authorized supervisor/employer skill endorsement with evidence reference.
  - `[ ]` `POST /api/v1/assessments/sessions/:sessionId/appeals`, `GET /api/v1/admin/assessments/appeals`, `PATCH /api/v1/admin/assessments/appeals/:appealId/decide` - Human-in-the-loop assessment appeal and malpractice review workflow.

- **Implement in Phases**
  - **Phase 1: Controlled Object Storage, Wallet Uploads & Expiring Share Links**
    - Add Drizzle schemas and migrations for `stored_objects`, `credential_wallet_items`, `credential_corrections`, and `passport_share_links`.
    - Enforce MIME/size checks, tenant/owner scoping, and integration tests.
  - **Phase 2: W3C VC v2.0 Signing, Headless PDF & Confirmed CV Import**
    - Implement key-backed VC v2.0 proofs, revocation status lists, CV preview-confirm flow, and export tests.
  - **Phase 3: Lab Bookings, Endorsements, Integrity Telemetry, Appeals & SMS/WhatsApp Queues**
    - Implement lab booking capacity constraints, appeal segregation of duties, and Redis-backed SMS/WhatsApp dispatchers.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Private Document Preview & Image Cropper**: In-browser PDF/document viewer for CAC reviewers and logo/avatar cropper.
  - **Full Credential Wallet & Correction Center**: Certificate upload, expiry tracking, cryptographic verification badge, and correction forms.
  - **Confirmed CV Import Review Modal**: Side-by-side diff allowing talent to approve or discard parsed CV fields before saving.
  - **Assessment Appeal & Lab Booking UI**: Campus lab calendar picker, focus-loss notice, and candidate appeal submission/admin resolution panels.

- **Sub Features**
  - Expiring share-link management drawer with revoke buttons.
  - Server-generated PDF & W3C VC JSON-LD download triggers.

- **Pages**
  - `[ ]` `/talent/wallet` - Full file-backed Credential Wallet and correction requests.
  - `[ ]` `/talent/profile/cv-import` - Confirmed CV extraction preview & field approval view.
  - `[ ]` `/talent/assessments/[id]/appeal` - Candidate score/malpractice appeal submission page.
  - `[ ]` `/admin/assessments/appeals` - DBI reviewer panel for human-in-the-loop appeal resolution.

- **Implement in Phases**
  - **Phase 1**: Wallet UI, expiring link drawer, and document upload/preview primitives.
  - **Phase 2**: Confirmed CV import review flow and signed VC/PDF export triggers.
  - **Phase 3**: Campus lab booking UI, candidate appeals, and admin appeal resolution queue with Playwright E2E coverage.

# Implementation progress — 2026-11-26 (Cloudflare R2 Object Storage Target)
- Standardized the Post-Pilot external object storage target on **Cloudflare R2 (S3-compatible object storage)** using `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.
- Confirmed seamless Pilot-to-Post-Pilot continuity: Pilot submissions in `PLAN-0001` (`organization_verification_submissions`) and `PLAN-0002` (`credential_wallet_items` / RPL requests) capture client-computed `documentSha256` + `documentName` metadata in PostgreSQL without storing binary files on Render's ephemeral disk, allowing `PLAN-0007` `StorageModule` presigned R2 uploads (`POST /api/v1/storage/presign-upload`) and reviewer signed downloads (`GET /api/v1/storage/signed-download`) to bind directly to existing SHA-256 hashes via an `objectKey` column.
