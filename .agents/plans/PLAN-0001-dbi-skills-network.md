# Plan id
PLAN-0001

# Title
Foundational Identity, Goal-First Onboarding & Organization Verification (PILOT — Target: 23 Nov 2026)

# Status
IN_PROGRESS

# Created at
2026-10-31

# Updated at
2026-11-20

# Owner
JED

# Related plan
None. (Serves as root foundational plan for PLAN-0002 through PLAN-0007)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (NestJS modular architecture: Auth, Users, Organizations, Audit, and NDPA Consent modules)
- Frontend: `/frontend` (Next.js App Router: Auth flows, Org onboarding, Member management, Design tokens)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: Horizon Telecoms' Company Onboarding & Babatunde's Talent Signup**

Horizon Telecoms is a national fiber infrastructure provider in Nigeria looking to hire and upskill fiber engineers through the DBI Skills Network. Before Horizon can search for talent, sponsor cohorts, or verify employee credentials, they need an official corporate presence on the platform. Their HR Director, Amina, visits the portal. She needs to register Horizon Telecoms, provide CAC (Corporate Affairs Commission) registration details, upload corporate credentials for DBI admin verification, and invite her recruitment team members with specific roles (e.g., Billing Admin, Recruiter, Talent Evaluator).

At the same time, Babatunde, a prospective network technician in Ibadan, visits the platform. Rather than facing a long, bureaucratic CV form, his onboarding begins with *"What would you like to achieve?"*—letting him pick his primary goal (*Find a job*, *Grow income from existing skills*, *Reach a dream occupation*, or *Build expert reputation*) and complete initial setup in 3–5 minutes on a low-data mobile connection with save-and-resume support. If he tried the public Career Readiness Explorer before registering (*"Value first, registration second"*), signing up automatically saves his provisional skills-gap snapshot. He also gets multi-factor authentication (MFA) to safeguard his record and transparent Nigeria Data Protection Act (NDPA) consent and frequency controls over service alerts versus optional marketing.

Meanwhile, a DBI Operations Administrator needs a secure back-office queue (protected by privileged-account MFA) where they can inspect Horizon Telecoms' submitted CAC documents, conduct institutional due diligence, and approve or reject their verification status with one click, reducing fraudulent access risk through controlled approval and tenant-scoped authorization (verification alone cannot eliminate fraud).

**How This Plan Fixes It:**
1. Delivers a clean, multi-tenant authentication engine in `/backend` and `/frontend` supporting both individual **Talent** accounts and multi-seat **Organization** accounts (Employers/Telecom Operators, Government Bodies, Donors/NGOs, and Training Partners).
2. Implements the **3–5 Minute Goal-First Talent Onboarding** (*"What would you like to achieve?"*) with save-and-resume state, low-data mobile UX, and seamless preservation of pre-signup Career Readiness Explorer progress.
3. Implements the complete **Organization Lifecycle**: creation, institutional categorization, profile enrichment, member invitations with role-based access control (RBAC), and document submission for official verification.
4. Provides a dedicated **DBI Verification Queue** where platform administrators review corporate/institutional documents and grant "Verified Organization" status with immutable audit logs.
5. Enforces NDPA-compliant consent agreements, transactional vs. marketing notification separation with frequency preferences, and multi-factor authentication from day one—while keeping core talent registration and passport access 100% free.

---

# Summary

This foundational plan implements the core security, identity, onboarding, and organizational infrastructure for the entire DBI Skills Network, aligned with the product strategy (`DBI_Skills_Network_Illustrated_Product_Strategy.txt`, Sections 3, 7, 8, 10, 14, 17, 18, and Appendix A–B).

It establishes:
1. Complete **Authentication & Identity Service** (Minimal-friction Sign up, Sign in, Password Reset, Email Verification, Email OTP MFA, Session Refresh, and mandatory MFA for privileged admin roles).
2. **Goal-First Talent Onboarding (3–5 Minute Flow)**: Starts with *"What would you like to achieve?"* across four audience tracks (*Early Career*, *Experienced Field Talent*, *Senior Experts*, *Freelancers*), supports save-and-resume, preserves pre-signup Career Readiness Explorer snapshots, and requires explicit user confirmation for any imported/parsed CV data.
3. **Multi-Tenant Organization Management** (Create employer, telecom operator, government, donor/NGO, or training partner workspaces; invite colleagues; assign granular RBAC roles: `OWNER`, `ADMIN`, `RECRUITER`, `REVIEWER`).
4. **Organization Verification Workflow** (CAC registration & institutional credential capture, controlled document upload, DBI administrative review, verification badge issuance).
5. **NDPA Governance, Communication Separation & Audit Trails** (Explicit versioned consent ledger, strict separation of transactional service alerts from optional marketing, channel & frequency preferences across Email/SMS/In-App/WhatsApp, non-profiling safeguards, and security audit logging).
6. **Project Scaffolding**: Initializes the modular `/backend` (NestJS + Drizzle ORM) and `/frontend` (Next.js App Router) directories with design tokens and automated test harnesses following the *"Tests as the spec"* principle.

---

# For Backend API (`/backend` - NestJS with Microservices Growth Path)

- **Features**
  - **Modular Architecture Scaffolding**: NestJS application structure with isolated domain modules: `AuthModule`, `UsersModule`, `OrganizationsModule`, `VerificationModule`, `ConsentModule`, `CommunicationModule`, and `AuditModule`.
  - **Authentication & Security Engine**: JWT access/refresh token rotation, Argon2id password hashing, email OTP-based Multi-Factor Authentication (MFA), privileged-account MFA enforcement, and rate limiting.
  - **Goal-First Talent Onboarding & Explorer State Hydration (Strategy Sections 7 & 10)**: Captures "What would you like to achieve?" goals (`FIND_JOB`, `GROW_INCOME`, `REACH_DREAM_OCCUPATION`, `BUILD_EXPERT_REPUTATION`), audience persona (`EARLY_CAREER`, `EXPERIENCED_TECHNICIAN`, `SENIOR_EXPERT`, `FREELANCER`), target occupation, save-and-resume step state, and accepts a short-lived, single-use pre-registration Career Readiness Explorer handoff token after identity binding and user confirmation; PLAN-0002 owns the Explorer evaluation itself.
  - **Organization Management & Multi-Stakeholder Multi-Tenancy (Strategy Sections 3 & 8)**: Organization profile creation supporting multiple institutional types (`EMPLOYER`, `TELECOM_OPERATOR`, `GOVERNMENT`, `DONOR_NGO`, `TRAINING_PARTNER`), CAC registration numbers, company size, telecom/digital sub-sector categorization, workspace settings, and team seat provisioning.
  - **Role-Based Access Control (RBAC)**: Fine-grained platform and workspace permissions (`SUPER_ADMIN`, `DBI_ADMIN`, `OWNER`, `ADMIN`, `RECRUITER`, `REVIEWER`, `TALENT`).
  - **Organization Verification Subsystem**: Multi-step verification lifecycle (`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`), controlled document upload integration, and administrative approval/rejection actions with human review reasons.
  - **NDPA Consent, Rights & Notification Separation Engine (Strategy Sections 14 & 17)**: Strictly separates transactional service notifications (vacancy alerts, assessment reminders, credential expiry) from optional marketing. Tracks versioned legal terms/privacy consent, channel opt-ins (`EMAIL`, `SMS`, `IN_APP`, `WHATSAPP`), frequency preferences (`IMMEDIATE`, `DAILY_DIGEST`, `WEEKLY_DIGEST`, `NONE`), suppression lists, and NDPA data-subject rights (consent history, portable data export, correction requests).

- **Endpoints**
  - `[x]` `GET /api/v1/health` & `GET /api/v1/health/ready` - Process liveness and PostgreSQL readiness checks.
  - `[x]` `POST /api/v1/auth/signup` - Register user account (`TALENT` or `ORGANIZATION_REPRESENTATIVE`) with minimal friction, versioned terms acceptance and privacy notice acknowledgement (`TERMS`, `PRIVACY` records), with separate optional `MARKETING` opt-in; legal-basis mapping requires validation before release.
  - `[x]` `POST /api/v1/auth/verify-email` - Verify email address using one-time verification token.
  - `[x]` `POST /api/v1/auth/signin` - Authenticate user, issue access and refresh tokens (or MFA challenge token when MFA is enabled).
  - `[x]` `POST /api/v1/auth/refresh` - Rotate and issue new access token.
  - `[x]` `POST /api/v1/auth/signout` - Invalidate active session/refresh token.
  - `[x]` `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password` - Password recovery flow via Brevo transactional email.
  - `[x]` `POST /api/v1/auth/mfa/setup` & `POST /api/v1/auth/mfa/verify` - Email OTP multi-factor authentication enrollment and activation.
  - `[x]` `POST /api/v1/auth/mfa/challenge` - Complete sign-in with an email OTP when MFA is enabled.
  - `[ ]` `GET /api/v1/users/me` - Retrieve current user profile, onboarding state/goal, consent records, and active organization memberships. *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*
  - `[ ]` `PATCH /api/v1/users/me` - Update personal details, primary goal (`FIND_JOB`, `GROW_INCOME`, `REACH_DREAM_OCCUPATION`, `BUILD_EXPERT_REPUTATION`), audience persona, and save-and-resume onboarding progress (including hydrating pre-signup Readiness Explorer results). *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*
  - `[ ]` `GET /api/v1/users/me/communication-preferences` - Retrieve transactional vs. marketing communication consent, channel preferences (`EMAIL`, `SMS`, `IN_APP`, `WHATSAPP`), and frequency settings (`IMMEDIATE`, `DAILY_DIGEST`, `WEEKLY_DIGEST`, `NONE`). *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*
  - `[ ]` `PATCH /api/v1/users/me/communication-preferences` - Update channel/frequency preferences and optional marketing opt-in/opt-out with audit logging. *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*
  - `[x]` `GET /api/v1/organizations` - List organization workspaces for the authenticated user.
  - `[x]` `POST /api/v1/organizations` - Create a new organization workspace and assign creator as `OWNER`.
  - `[x]` `POST /api/v1/organizations/invitations/accept` - Accept an organization invitation for the invited email address.
  - `[x]` `GET /api/v1/organizations/:organizationId` - Fetch organization details and verification status.
  - `[x]` `PATCH /api/v1/organizations/:organizationId` - Update organization profile, CAC number, and sector info (`OWNER` / `ADMIN`).
  - `[x]` `POST /api/v1/organizations/:organizationId/members/invite` - Invite a team member with designated RBAC role (`ADMIN`, `RECRUITER`, `REVIEWER`).
  - `[x]` `GET /api/v1/organizations/:organizationId/members` - List organization members and their roles.
  - `[x]` `DELETE /api/v1/organizations/:organizationId/members/:userId` - Remove a member from the organization workspace.
  - `[ ]` `POST /api/v1/organizations/:organizationId/verification/submit` - Upload CAC/institutional document metadata (`documentName`, `documentSha256`, optional `notes`) and submit organization for DBI review. *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*
  - `[ ]` `GET /api/v1/admin/organizations/verifications` - DBI admin endpoint: list pending organization verification requests. *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*
  - `[ ]` `PATCH /api/v1/admin/organizations/:organizationId/verification/decide` - DBI admin endpoint: approve or reject organization with human-reviewed reason and audit log entry. *(Code merged to `dev` in commit `011b737` with policy unit tests; awaiting live DB/integration test evidence to mark `[x]`)*

- **Implement in Phases**
  - **Phase 1: Project Initialization & Identity Domain (Weeks 1-2) — Completed on Backend**
    - Scaffold `/backend` NestJS project with PostgreSQL, Drizzle ORM (`drizzle-orm` + `drizzle-kit`), Argon2id, `@nestjs/throttler`, Swagger/OpenAPI docs, and Node test runner (`node --test`). (Redis deferred until needed.)
    - Implement Drizzle database schema (`backend/src/schema.ts`) and migrations (`0000`–`0003`) for `users`, `consent_records`, `email_verification_tokens`, `password_reset_tokens`, `refresh_tokens`, and `email_otp_challenges`.
    - Automated tests as the spec: Unit and integration tests for user registration, email verification, password reset, MFA, login, token refresh, and NDPA consent capture.
  - **Phase 2: Organization Workspace & RBAC (Weeks 3-4) — Completed on Backend**
    - Implement Drizzle database schema for `organizations`, `organization_members`, and `organization_invitations` (`organization_role`: `OWNER`, `ADMIN`, `RECRUITER`, `REVIEWER`).
    - Build organization creation, member invitation with secure tokenized email links, invitation acceptance, and role guard decorators (`@OrganizationRoles()`, `OrganizationRoleGuard`).
    - Policy and integration test suite testing permission boundaries (`organization-policy.test.ts`).
  - **Phase 3: User Onboarding State, Communication Preferences, Verification Engine & Admin Queue (Weeks 5-6) — Pending**
    - Implement `UsersModule` (`/users/me` and `/users/me/communication-preferences`) for profile inspection, goal-first talent onboarding state (save-and-resume + Explorer snapshot attachment), consent history, and channel/frequency preferences.
    - Implement controlled document upload handlers and organization verification state machine (`UNVERIFIED` -> `PENDING_REVIEW` -> `VERIFIED` / `REJECTED`).
    - Build DBI administrative review endpoints (`GET /api/v1/admin/organizations/verifications`, `PATCH /api/v1/admin/organizations/:organizationId/verification/decide`) with platform-level admin role enforcement (`SUPER_ADMIN`, `DBI_ADMIN`) and privileged MFA checks; workspace `ADMIN` and `REVIEWER` are never platform administrators.
    - Implement `audit_logs` schema and audit logging recording all administrative verification approvals, rejections, consent changes, and sensitive security events.

---

# For Frontend (`/frontend` - Next.js App Router & Design System)

- **Features**
  - **Design System Tokens & Visual Mandate (Strategy Section 18)**: Strict adherence to the platform color palette and global SaaS aesthetic (not a bureaucratic registry):
    - Midnight Navy: `#10263B`
    - Ocean Teal: `#128F8A`
    - Electric Mint: `#64DCD1`
    - Cloud White: `#F2F5FA`
    - Warm Gold: `#D9AB60`
  - **Unified Authentication Experience**: Low-friction authentication screens with clear switching between Talent and Institutional/Organization signup, requiring only minimal identity and NDPA consent fields upfront.
  - **3–5 Minute Goal-First Talent Onboarding Wizard (Strategy Sections 7 & 10)**: Begins with *"What would you like to achieve?"* (*Find a job*, *Grow income from existing skills*, *Reach a dream occupation*, *Build expert reputation*), selects audience track (*Early career*, *Experienced field talent*, *Senior experts*, *Freelancers*), saves any pre-signup Career Readiness Explorer progress, supports save-and-resume, and requires explicit user confirmation for any parsed CV inputs.
  - **Organization Onboarding Wizard**: Multi-step guided wizard for institutional profile setup (Employer/Telecom Operator, Government, Donor/NGO, Training Partner), sub-sector categorization, and team invitations.
  - **Organization Verification Portal**: Clear document upload interface with live verification status tracker (`Unverified`, `Pending Review`, `Verified Badge`, `Rejected / Needs Revision`).
  - **Team Member Management**: Table showing active members, pending invitations, role dropdowns (`OWNER`, `ADMIN`, `RECRUITER`, `REVIEWER`), and invite modal.
  - **DBI Admin Verification Queue**: High-density back-office dashboard for reviewing submitted CAC/institutional documents and granting or rejecting verification with audit reasons.

- **Sub Features**
  - Save-and-resume onboarding state and bandwidth-conscious, low-data mobile-first layout for talent; desktop-optimized layout for institutional admins.
  - WCAG-oriented color contrast, keyboard accessibility, and `prefers-reduced-motion` support.
  - Password strength meter and inline NDPA consent agreement modals separating service notifications from optional marketing.
  - Document upload preview for CAC and institutional verification files, with private storage, type/size validation, malware-scanning workflow, and short-lived reviewer download URLs.

- **Pages**
  - `[x]` `/` - Landing page with distinct "Join as Talent" and "Register Your Organization" CTA buttons and preview profiles.
  - `[ ]` `/auth/login` - Unified Sign-in page.
  - `[ ]` `/auth/signup` - Minimal-friction Sign-up entry with role selector (Talent vs. Organization) and pre-signup Explorer session preservation.
  - `[ ]` `/auth/verify-email` - Email verification landing page.
  - `[ ]` `/auth/forgot-password` & `/auth/reset-password` - Password recovery flow.
  - `[ ]` `/auth/mfa` - Two-factor authentication challenge and setup page.
  - `[ ]` `/onboarding/talent` - 3–5 minute Goal-First Talent Onboarding (*"What would you like to achieve?"* -> goal & aspiration -> skill declaration / confirmed CV import -> provisional insight & Passport handoff) with save-and-resume.
  - `[ ]` `/onboarding/organization` - Multi-step organization creation wizard and team invitation acceptance flow.
  - `[ ]` `/organization/dashboard` - Organization central hub.
  - `[ ]` `/organization/profile` - Organization settings, institutional type, branding, and details.
  - `[ ]` `/organization/members` - Team seat management and role assignments.
  - `[ ]` `/organization/verification` - CAC/institutional document submission and verification progress tracker.
  - `[ ]` `/settings/privacy-consent` - NDPA transparency dashboard with versioned consent logs, transactional vs. marketing separation, channel toggles (`Email`/`SMS`/`In-App`/`WhatsApp`), and frequency preferences.
  - `[ ]` `/admin/verifications` - DBI Admin queue for reviewing and approving/rejecting organizations.

- **Implement in Phases**
  - **Phase 1: Next.js Scaffolding & Design System Tokens (Weeks 1-2) — Partially Completed**
    - `[x]` Initialize `/frontend` with Next.js (App Router, TypeScript), same-origin `/api/*` rewrite proxy, and landing page (`/`).
    - `[x]` Setup CSS design tokens matching `#10263B`, `#128F8A`, `#64DCD1`, `#F2F5FA`, `#D9AB60`.
    - `[ ]` Build reusable core UI primitives (Button, Input, Card, Modal, Badge, Toast, Table) with unit tests.
  - **Phase 2: Authentication & Goal-First / Institutional Onboarding UI (Weeks 3-4) — Pending**
    - `[ ]` Build `/auth/login`, `/auth/signup`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/mfa`.
    - `[ ]` Build `/onboarding/talent` (3–5 minute *"What would you like to achieve?"* flow with save-and-resume and low-data mobile UX) and `/onboarding/organization` wizard.
    - `[ ]` Integrate with Backend `/api/v1/auth/*`, `/api/v1/users/me*`, and `/api/v1/organizations/*` endpoints via same-origin proxy.
    - `[ ]` Automated user journey tests (Playwright) covering signup, email verification, login, MFA challenge, token refresh, talent goal onboarding, and organization onboarding.
  - **Phase 3: Organization Management, Privacy & Verification Views (Weeks 5-6) — Pending**
    - `[ ]` Implement `/organization/dashboard`, `/organization/profile`, `/organization/members` (member management tables & invitation modals), `/organization/verification`, and `/settings/privacy-consent`.
    - `[ ]` Build `/admin/verifications` DBI Admin verification queue with document inspection and approval/rejection modals.
    - `[ ]` End-to-end regression testing and WCAG AA / reduced-motion / low-bandwidth accessibility audit.

# Implementation progress — 2026-11-02
- User authorized proceeding with the environment-lean foundation scaffold.
- Created npm workspaces for Next.js and NestJS, PostgreSQL connectivity/readiness checks, a same-origin API proxy, design tokens, a responsive illustrative landing page, tests, and startup documentation.
- One backend environment file; no frontend environment file. Redis and unused integration secrets deferred until required.
- Identity, authentication, consent persistence, organization RBAC, database migrations, and verification workflows remain pending. This plan is not complete.

# Implementation progress — 2026-11-04
- Added email OTP MFA enrollment and sign-in challenge endpoints. Codes are one-time, expire after five minutes, are limited to five attempts, and are stored as keyed hashes. Enabling MFA revokes existing refresh sessions.
- Added one-time password reset tokens sent through Brevo. Reset requests return the same response for existing and unknown accounts; completing a reset updates the password and revokes refresh sessions.
- Email OTP MFA and password recovery reuse the configured Brevo sender; no additional MFA- or password-reset-specific environment variables are needed. Frontend MFA screens, account MFA management, organizations, and verification workflows remain pending.

# Implementation progress — 2026-11-16 (Plan Review, Strategy Alignment & Codebase Audit)
- Audited `/backend`, `/frontend`, and `DBI_Skills_Network_Illustrated_Product_Strategy.txt` (Sections 3, 7, 8, 10, 14, 17, 18, and Appendix A–B) against `PLAN-0001`:
  - **Strategy Alignment Updates Added to `PLAN-0001`**:
    - **Goal-First Talent Onboarding (Section 7)**: Added the 3–5 minute *"What would you like to achieve?"* onboarding flow (`/onboarding/talent` and `PATCH /api/v1/users/me`) across the four talent segments (*Early career*, *Experienced field talent*, *Senior experts*, *Freelancers*), with save-and-resume state, mandatory user confirmation for parsed CV data, and low-data mobile UX.
    - **Pre-Signup Readiness Explorer Hydration (Section 10)**: Ensured registration and onboarding preserve provisional snapshots from the unauthenticated Career Readiness Explorer (*"Value first, registration second"*).
    - **Multi-Stakeholder Institutional Types (Sections 3 & 8)**: Expanded organization onboarding and profiles to cover Employers/Telecom Operators, Government Bodies/Regulators, Donors/NGOs, and Training Partners.
    - **Communication Frequency & NDPA Governance (Sections 14 & 17)**: Added notification frequency controls (`IMMEDIATE`, `DAILY_DIGEST`, `WEEKLY_DIGEST`, `NONE`), `IN_APP` channel support alongside `EMAIL`/`SMS`/`WHATSAPP`, non-profiling safeguards, and privileged-account MFA enforcement.
  - **Backend Phase 1 & Phase 2 Complete**:
    - `AuthModule` (`backend/src/auth/`) fully implements `signup`, `verify-email`, `forgot-password`, `reset-password`, `signin`, `mfa/setup`, `mfa/verify`, `mfa/challenge`, `refresh`, and `signout` with Argon2id hashing, keyed token hashes, Brevo transactional emails, and `@nestjs/throttler`.
    - `OrganizationModule` (`backend/src/organizations/`) fully implements workspace listing (`GET /organizations`), creation (`POST /organizations`), profile retrieval/updates (`GET/PATCH /organizations/:organizationId`), tokenized email invitations (`POST /organizations/:organizationId/members/invite`, `POST /organizations/invitations/accept`), member listing/removal (`GET/DELETE /organizations/:organizationId/members`), and RBAC enforcement (`OrganizationRoleGuard`, `canManageRole` policy).
    - Drizzle ORM schema (`backend/src/schema.ts`), 4 SQL migrations (`backend/drizzle/0000`–`0003`), and Swagger/OpenAPI documentation (`/api/docs`, `/api/docs-json`) are in place and covered by automated tests (`foundation.test.ts`, `auth-email.test.ts`, `organization-policy.test.ts`, `swagger.test.ts`).
  - **Next Execution Priorities to Complete `PLAN-0001`**:
    1. **Backend Phase 3**: Implement `UsersModule` (`/users/me`, `/users/me/communication-preferences` including goal-first onboarding state and frequency preferences), organization verification submission (`POST /organizations/:organizationId/verification/submit`), DBI admin verification review queue (`GET /admin/organizations/verifications`, `PATCH /admin/organizations/:organizationId/verification/decide`), and `audit_logs` persistence.
    2. **Frontend Phase 1–3**: Build shared UI primitives, authentication pages (`/auth/*`), 3–5 minute goal-first talent onboarding (`/onboarding/talent`), organization onboarding wizard (`/onboarding/organization`), workspace management views (`/organization/*`), NDPA consent dashboard (`/settings/privacy-consent`), and DBI admin queue (`/admin/verifications`), backed by Playwright E2E tests.

# Plan review and implementation hardening — 2026-11-16

> **Review-only update.** The completed checkboxes and 2026-11-02/04/16 implementation notes above are preserved from the submitted plan; the live repository and product strategy source file were **not provided** for independent re-audit. The `# Status` value `IN_PROGRESS` means execution is underway; `# Approval` remains `DRAFT` and is a *separate* approval field, not proof of approval.

## Ownership, critical path and shared contracts
- PLAN-0001 owns identity, refresh sessions, privileged-account MFA, profile/onboarding core fields, institution verification, tenant permission evaluation, notices/preferences, rights-request intake, and append-only administrative audit events. PLAN-0002 owns the public Explorer calculation, initial talent-profile enrichment, taxonomy and Passport. Agree on the handoff API **before** building overlapping onboarding screens.
- `users.id` is the identity source of truth; `organizations.id` identifies tenant/workspace; every institution-scoped query must independently authorize `(actor_id, organization_id, capability)` and must not trust an organization ID sent by a browser. Define platform roles (`SUPER_ADMIN`, `DBI_ADMIN`) separately from workspace roles (`OWNER`, `ADMIN`, `RECRUITER`, `REVIEWER`) and the talent account type; forbid self-elevation and cross-tenant record access.
- Organization state machine: `UNVERIFIED -> PENDING_REVIEW -> VERIFIED | REJECTED`; rejected applications may be corrected and re-submitted with a **new review event**, never by mutating historical decisions. For non-CAC government/NGO/training institutions, support a configurable alternative-document checklist and reviewer justification rather than requiring a CAC number universally.
- Explorer handoff: PLAN-0002 issues an opaque, expiring, single-use token linked to a minimal provisional snapshot. PLAN-0001 redeems it only after authentication, validates purpose and ownership, attaches it idempotently, and never silently overwrites a user-confirmed field. Invalid/expired token cannot block normal signup.
- Identity sessions: rotate refresh tokens atomically, detect replay and revoke the token family, revoke on password reset/MFA credential change, throttle OTP attempts by account and network, and record security events without logging token plaintext or OTP contents. Current email OTP is the documented baseline; evaluate phishing-resistant MFA (passkeys/WebAuthn or TOTP) separately for privileged roles before production.

## Privacy, communications and institution safety decisions
- Distinguish (a) terms acceptance, (b) notice acknowledgement, (c) lawful-basis/purpose records, and (d) affirmative optional marketing consent. Do not make optional marketing a registration condition. Service-critical messages are not automatically marketing; user-requested vacancy digests are preference-controlled. Provide defaults, unsubscribe/suppression behavior, and contact-channel verification before WhatsApp/SMS delivery.
- Define rights-request intake and fulfillment for access, correction, export, withdrawal where applicable, and deletion subject to lawful retention. Capture request owner, legal basis, deadline, outcome and audit reference; run a DPIA and obtain legal/DBI privacy review before exposing candidate discovery or external data sharing.
- Organization verification evidence is private and encrypted at rest; use allowlisted MIME types, size caps, malware checks, access-controlled object references and short-lived review URLs. Retention/deletion and reviewer separation of duties must be specified. `VERIFIED` does not itself grant access to private profiles without PLAN-0002 visibility/PLAN-0005 recruitment permissions.

## Required contract additions (proposed; not marked implemented)
- `[ ]` `GET /api/v1/users/me/consents` — display recorded terms/notice versions and voluntary marketing consent history.
- `[ ]` `POST /api/v1/users/me/data-requests` — authenticated access/correction/export/deletion intake with status tracking.
- `[ ]` `GET /api/v1/organizations/:organizationId/verification` — owner/admin read of current request, evidence manifest and reason codes (no raw public storage URL).
- `[ ]` `GET /api/v1/admin/audit-events` — platform-admin-filtered audit search; sensitive fields redacted.
- `[ ]` `PATCH /api/v1/organizations/:organizationId/members/:userId/role` — only if UI role dropdown is retained; otherwise make role display read-only to avoid advertising a missing capability.
- `[ ]` `GET /api/v1/users/me/onboarding` or existing `GET /users/me` **must** return `step`, `version`, `goal`, `persona`, `saved_at`, and Explorer handoff status; `PATCH /users/me` requires optimistic concurrency/idempotency for resume across devices.

## Definition of done and test gates
- `[ ]` Anonymous, talent, unverified organization, verified organization, workspace `OWNER/ADMIN/RECRUITER/REVIEWER`, DBI admin and super-admin can access **only** their approved routes and tenant records; test both REST and direct object-ID manipulation.
- `[ ]` Invitation token cannot be reused, accepted from an unintended email, or used to elevate the invitee above the inviter's grantable role; last `OWNER` cannot be removed accidentally.
- `[ ]` Organization evidence upload/review/rejection/resubmission produces immutable actor/time/reason events and cannot expose private documents through public asset/CDN routes.
- `[ ]` Signup -> email verification -> MFA -> refresh -> goal-first resume -> optional Explorer handoff and organization verification run in Playwright mobile/desktop suites, including failed and interrupted network requests.
- `[ ]` Legal/privacy review signs off the actual purposes, lawful bases, retention schedule, processor list, and external channels. Do not label the application 'NDPA compliant' solely because a consent checkbox exists.
- `[ ]` Sprint gate for **23 November 2026**: evaluate only the acceptance criteria above and the remaining originally listed PLAN-0001 tasks; record any unmet work as an explicit follow-on, never silently mark a checklist complete.

## Priority order and review scope

The immediate target is working authentication and user onboarding by **Monday, 23 November 2026**. Execute the following in priority order; this sequence does not mark any item complete:

1. **Restore API startup** — Resolve the validation-package loading issue, confirm a reproducible installation, and verify PostgreSQL and transactional email configuration.
2. **Build shared UI components** — Provide reusable buttons, inputs, cards, notifications and form validation using the existing design tokens and accessibility requirements.
3. **Build authentication screens** — Implement signup, email verification, login, password recovery and MFA, connected to the existing authentication APIs through the same-origin proxy.
4. **Build goal-first talent onboarding** — Implement goal selection, basic profile details, career aspirations, and save-and-resume using the existing user APIs; verify remaining onboarding contracts, concurrency and integration requirements.
5. **Build organization onboarding** — Implement institutional setup, team invitations and invitation acceptance, and entry into the organization workspace using the existing organization APIs.
6. **Verify complete journeys** — Test authentication and onboarding on desktop and mobile, including permissions, accessibility, interrupted sessions and recovery. Write targeted tests alongside each implementation step; this final step verifies the combined experience.

**Immediate implementation slice:** API startup -> authentication screens -> talent onboarding, supported by shared UI components.

**Following priorities:** Complete organization management screens, privacy and communication preferences, secure verification-document upload/storage, and the DBI admin review queue. Preserve all existing PLAN-0001 acceptance and release gates; the onboarding target does not imply that these remaining items are complete or excluded from the plan.

**Review and expansion:** This priority order is the current working sequence and **can be expanded or refined upon review** of implementation findings, dependencies, security/privacy requirements, stakeholder feedback and acceptance criteria. Record material scope or sequencing changes in this plan and the activity log; do not infer approval or completion from a review.

## Open contracts and decisions

1. Verify and finish remaining `UsersModule`, tenant-permission and audit contracts rather than rebuilding APIs already present. Existing user and verification APIs require integration and acceptance evidence.
2. Agree the minimal PLAN-0002 Explorer handoff contract (token TTL, redemption, ownership binding and idempotency) before changing either side. Only the thin onboarding handoff is in scope; keep invalid/expired Explorer tokens from blocking normal signup.
3. Confirm the administrative permission matrix, evidence retention, privacy-review owner and privileged MFA upgrade path. No approval is assumed in this document.

# Implementation progress — 2026-11-19 (Management Status & Onboarding Target)

DBI Skills Network has moved from planning into active backend development, with key account, organization, security, and verification services underway.

The frontend remains a preview page, with full user functionality and integration still pending. The project is currently at the foundational development stage, with major ecosystem features still ongoing.

We plan to have user onboarding working by **Monday, 23 November 2026**.

- **Priority**: Complete and integrate the authentication and goal-first user onboarding experience for this target. Preserve the existing acceptance and release gates.
- **Report**: [Management Progress Report](../../docs/DBI_PROJECT_STATUS_2026-11-19.md).
- **Status**: PLAN-0001 remains IN_PROGRESS. This records the user-confirmed delivery target and management wording; no implementation checklist or approval status is changed. Existing verification findings and remaining integration work still apply.

# Implementation progress — 2026-11-19 (Priority Order & Review Flexibility)

- Recorded the user-requested six-step priority order: restore API startup; build shared UI components; implement authentication screens; implement talent onboarding; implement organization onboarding; verify complete journeys.
- Identified organization management, privacy/preferences, secure verification-document handling and admin review screens as following priorities, with existing acceptance gates retained.
- Explicitly stated that the priority order can be expanded or refined upon review, with material changes logged.
- Target remains Monday, 23 November 2026, for working user onboarding. PLAN-0001 remains IN_PROGRESS; no completion checkbox or approval status changed.

---

# Pilot Anti-Bloat Guardrails & Jed vs. Kate Split (Target: 23 Nov 2026)

To hit the **Monday, 23 Nov 2026** onboarding milestone and **Monday, 30 Nov 2026** Pilot deadline with a 2-person team (**Jed** = Full-Stack/Backend, **Kate** = Frontend), AI agents working on `PLAN-0001` **must** obey this trimmed Pilot cut:

### What IS in the Pilot (`PLAN-0001`)
- **Backend (Jed — merged to `dev` in commit `011b737`)**:
  - `AuthModule`, `OrganizationModule`, `UsersModule`, `VerificationModule`, and `AuditService` with Drizzle migrations `0000`–`0005`.
  - Remaining Pilot action for Jed: run `npm.cmd run db:migrate -w backend` on live PostgreSQL, seed an initial `DBI_ADMIN` account (with MFA), and verify Swagger (`/api/docs-json`) + live DB integration tests.
- **Lean Frontend Screens (Kate — `/frontend` only, strictly against `/api/docs-json`)**:
  - `/auth/login`, `/auth/signup`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/mfa`
  - `/onboarding/talent` — single-page or compact 3-step card selecting primary goal (`FIND_JOB`, `GROW_INCOME`, `REACH_DREAM_OCCUPATION`, `BUILD_EXPERT_REPUTATION`), persona, and target occupation with save-and-resume via `PATCH /api/v1/users/me`.
  - `/onboarding/organization` & `/organization/dashboard` — compact workspace view combining organization profile, member invite table, and CAC metadata verification submission (`POST /api/v1/organizations/:organizationId/verification/submit`). *(Note: `/organization/profile`, `/organization/members`, and `/organization/verification` may be rendered as tabs/sections inside `/organization/dashboard`—or share one layout—to halve frontend UI build effort for Kate.)*
  - `/settings/privacy-consent` — simple preference toggles calling `GET`/`PATCH /api/v1/users/me/communication-preferences`.
  - `/admin/verifications` — simple table calling `GET /api/v1/admin/organizations/verifications` with Approve / Reject + reason modal calling `PATCH /api/v1/admin/organizations/:organizationId/verification/decide`.

### What is TRIMMED to `PLAN-0007` (Agents MUST NOT build in Pilot)
- No S3/MinIO object storage, presigned uploads, or virus-scanning pipelines (use existing SHA-256 + `documentName` metadata endpoint).
- No avatar/logo image cropper or inline PDF viewer library.
- No Redis queues or external SMS/WhatsApp provider SDKs (keep preference toggles in DB; keep email via Brevo + in-app only).

# Implementation progress — 2026-11-20 (Pilot Scope Trim & Backend Phase 3 Merge)
- **Backend Phase 3 Implemented & Merged to `dev` (`011b737`)**:
  - Added `UsersModule` (`GET`/`PATCH /api/v1/users/me`, `GET`/`PATCH /api/v1/users/me/communication-preferences`), `AuditService` (`audit_logs`), `VerificationModule` (`POST /api/v1/organizations/:organizationId/verification/submit`, `GET /api/v1/admin/organizations/verifications`, `PATCH /api/v1/admin/organizations/:organizationId/verification/decide`), `PlatformAdminGuard` (requires DB `DBI_ADMIN`/`SUPER_ADMIN` + MFA enabled), and Drizzle migrations `0004` and `0005`.
  - Passed `npm.cmd run typecheck`, `npm.cmd test` (16 backend + 2 frontend tests), and `npm.cmd run build`; live PostgreSQL migration and integration tests remain pending before marking Phase 3 endpoints `[x]`.
- **Pilot Scope Trim**:
  - Moved heavy storage/virus-scan/cropper/PDF viewer/Redis/SMS-WhatsApp dispatchers out of the Pilot into **`PLAN-0007`** so Kate can ship the lean `/frontend` auth and onboarding UI by **Monday, 23 Nov 2026**. `PLAN-0001` remains `IN_PROGRESS`.
