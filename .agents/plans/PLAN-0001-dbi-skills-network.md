# Plan id
PLAN-0001

# Title
Foundational Identity, Multi-Tenant Organization Management & Authentication Engine

# Status
IN_PROGRESS

# Created at
2026-10-31

# Updated at
2026-11-02

# Owner
JED

# Related plan
None. (Serves as root foundational plan for PLAN-0002 through PLAN-0006)

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

At the same time, Babatunde, a prospective network technician in Ibadan, visits the platform. He needs a fast, frictionless sign-up experience with email or social sign-in, multi-factor authentication (MFA) to safeguard his professional record, and transparent consent toggles that comply with the Nigeria Data Protection Act (NDPA)—giving him explicit control over which companies can see his contact info.

Meanwhile, a DBI Operations Administrator needs a secure back-office queue where they can inspect Horizon Telecoms' submitted CAC documents, conduct institutional due diligence, and approve or reject their verification status with one click, ensuring no fraudulent businesses can exploit talent data.

**How This Plan Fixes It:**
1. Delivers a clean, multi-tenant authentication engine in `/backend` and `/frontend` supporting both individual **Talent** accounts and multi-seat **Organization** accounts.
2. Implements the complete **Organization Lifecycle**: creation, profile enrichment, member invitations with role-based access control (RBAC), and document submission for official verification.
3. Provides a dedicated **DBI Verification Queue** where platform administrators review corporate documents and grant "Verified Organization" status with audit logs.
4. Enforces NDPA-compliant consent agreements and multi-factor authentication from day one.

---

# Summary

This foundational plan implements the core security, identity, and organizational infrastructure for the entire DBI Skills Network. 

It establishes:
1. Complete **Authentication & Identity Service** (Sign up, Sign in, Password Reset, Email Verification, MFA, Session Refresh).
2. **Multi-Tenant Organization Management** (Create company/agency profiles, manage branches, invite colleagues, assign granular RBAC roles: Owner, Admin, Recruiter, Reviewer).
3. **Organization Verification Workflow** (CAC registration capture, document upload, DBI administrative review, verification badge issuance).
4. **NDPA Compliance & Audit Trails** (Explicit consent flags, privacy preferences, and security event logging).
5. **Project Scaffolding**: Initializes the modular `/backend` (NestJS) and `/frontend` (Next.js) directories with design tokens and automated test harnesses following the *"Tests as the spec"* principle.

---

# For Backend API (`/backend` - NestJS with Microservices Growth Path)

- **Features**
  - **Modular Architecture Scaffolding**: NestJS application structure with isolated domain modules: `AuthModule`, `UsersModule`, `OrganizationsModule`, `VerificationModule`, `ConsentModule`, `CommunicationModule`, and `AuditModule`.
  - **Authentication & Security Engine**: JWT access/refresh token rotation, argon2/bcrypt password hashing, email OTP-based Multi-Factor Authentication (MFA), and rate limiting.
  - **Organization Management & Multi-Tenancy**: Organization profile creation, CAC registration numbers, company size, telecom/digital sub-sector categorization, workspace settings, and team seat provisioning.
  - **Role-Based Access Control (RBAC)**: Fine-grained permissions (`SUPER_ADMIN`, `DBI_ADMIN`, `ORG_OWNER`, `ORG_ADMIN`, `ORG_RECRUITER`, `TALENT`).
  - **Organization Verification Subsystem**: Multi-step verification lifecycle (`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`), document upload storage integration, and administrative approval actions.
  - **NDPA Consent & Notification Separation Engine**: Separates transactional notifications from optional marketing. Granular consent logging, legal terms versioning, unsubscribe/suppression preference management, and NDPA compliance audit trails.

- **Endpoints**
  - `POST /api/v1/auth/signup` - Register user account (Talent or Organization Representative) with mandatory NDPA consent recording.
  - `POST /api/v1/auth/signin` - Authenticate user, issue access and refresh tokens.
  - `POST /api/v1/auth/refresh` - Rotate and issue new access token.
  - `POST /api/v1/auth/signout` - Invalidate active session/token.
  - `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password` - Password recovery flow.
  - `POST /api/v1/auth/mfa/setup` & `POST /api/v1/auth/mfa/verify` - Multi-factor authentication activation.
  - `POST /api/v1/auth/mfa/challenge` - Complete sign-in with an email OTP when MFA is enabled.
  - `GET /api/v1/users/me` - Retrieve current user profile and active organization memberships.
  - `PATCH /api/v1/users/me` - Update personal details and notification preferences.
  - `GET /api/v1/users/me/communication-preferences` - Retrieve transactional vs. marketing communication consent and channel preferences (Email/SMS/WhatsApp).
  - `PATCH /api/v1/users/me/communication-preferences` - Update channel preferences and optional marketing opt-in/opt-out.
  - `POST /api/v1/organizations` - Create a new organization workspace.
  - `GET /api/v1/organizations/:id` - Fetch organization details and verification status.
  - `PATCH /api/v1/organizations/:id` - Update organization profile, contact, and branding info.
  - `POST /api/v1/organizations/:id/members/invite` - Invite a team member with designated RBAC role.
  - `GET /api/v1/organizations/:id/members` - List organization members and their roles.
  - `DELETE /api/v1/organizations/:id/members/:userId` - Remove a member from the organization workspace.
  - `POST /api/v1/organizations/:id/verification/submit` - Upload CAC documents and submit organization for DBI review.
  - `GET /api/v1/admin/organizations/verifications` - DBI admin endpoint: list pending organization verification requests.
  - `PATCH /api/v1/admin/organizations/:id/verification/decide` - DBI admin endpoint: approve or reject organization with reason.

- **Implement in Phases**
  - **Phase 1: Project Initialization & Identity Domain (Weeks 1-2)**
    - Scaffold `/backend` NestJS project with PostgreSQL, Prisma/TypeORM, Redis, and Jest test runner.
    - Implement database schema for `User`, `Account`, `RefreshToken`, `ConsentRecord`, and `AuditLog`.
    - Automated tests as the spec: Unit and integration tests for user registration, login, token refresh, and NDPA consent capture.
  - **Phase 2: Organization Workspace & RBAC (Weeks 3-4)**
    - Implement database schema for `Organization`, `OrganizationMember`, and `OrganizationRole`.
    - Build organization creation, member invitation with secure tokenized email links, and role guard decorators (`@Roles()`).
    - Integration test suite testing permission boundaries (e.g., verifying a recruiter cannot edit organization billing or invite admins).
  - **Phase 3: Verification Engine & Admin Queue (Weeks 5-6)**
    - Implement document upload handlers (secure S3/MinIO storage with virus/file-type validation).
    - Build organization verification state machine and DBI administrative review endpoints.
    - Audit logging integration recording all administrative verification approvals and denials.

---

# For Frontend (`/frontend` - Next.js App Router & Design System)

- **Features**
  - **Design System Tokens & Foundation**: Strict adherence to the platform color palette:
    - Midnight Navy: `#10263B`
    - Ocean Teal: `#128F8A`
    - Electric Mint: `#64DCD1`
    - Cloud White: `#F2F5FA`
    - Warm Gold: `#D9AB60`
  - **Unified Authentication Experience**: Modern, high-conversion authentication screens with clear switching between Talent and Employer signup.
  - **Organization Onboarding Wizard**: Multi-step guided wizard for company profile setup, industry categorization, and team invitations.
  - **Organization Verification Portal**: Clear document upload interface with live verification status tracker (`Pending Review`, `Verified Badge`, `Needs Revision`).
  - **Team Member Management**: Table showing active members, pending invitations, role dropdowns, and invite modal.
  - **DBI Admin Verification Queue**: High-density back-office dashboard for reviewing submitted CAC documents and granting verification.

- **Sub Features**
  - Form validation with Zod / React Hook Form.
  - Password strength meter and inline NDPA consent agreement modals.
  - Instant avatar/logo image cropper and document PDF upload preview.
  - Mobile-responsive layout for talent and desktop-optimized layout for organization admins.

- **Pages**
  - `/` - Landing page with distinct "Join as Talent" and "Register Your Organization" CTA buttons.
  - `/auth/login` - Unified Sign-in page.
  - `/auth/signup` - Sign-up entry with role selector (Talent vs. Organization).
  - `/auth/verify-email` - Email verification landing page.
  - `/auth/forgot-password` & `/auth/reset-password` - Password recovery flow.
  - `/auth/mfa` - Two-factor authentication challenge page.
  - `/onboarding/organization` - Multi-step organization creation wizard.
  - `/organization/dashboard` - Organization central hub.
  - `/organization/profile` - Organization settings, branding, and details.
  - `/organization/members` - Team seat management and role assignments.
  - `/organization/verification` - CAC document submission and verification progress tracker.
  - `/settings/privacy-consent` - NDPA transparency dashboard with consent logs and notification preferences (Email/SMS/WhatsApp opt-in switches).
  - `/admin/verifications` - DBI Admin queue for reviewing and approving organizations.

- **Implement in Phases**
  - **Phase 1: Next.js Scaffolding & Design System Tokens (Weeks 1-2)**
    - Initialize `/frontend` with Next.js (App Router, TypeScript, Tailwind CSS).
    - Setup Tailwind theme matching `#10263B`, `#128F8A`, `#64DCD1`, `#F2F5FA`, `#D9AB60`.
    - Build core UI primitives (Button, Input, Card, Modal, Badge, Toast, Table) with unit tests.
  - **Phase 2: Authentication & Onboarding UI (Weeks 3-4)**
    - Build `/auth/login`, `/auth/signup`, MFA challenge, and organization creation wizard.
    - Integrate with Backend API using typed React Query / Server Actions.
    - Automated user journey tests (Playwright) covering signup, login, and token refresh.
  - **Phase 3: Organization Management & Verification Views (Weeks 5-6)**
    - Implement member management tables, invitation modals, and verification file upload interfaces.
    - Build DBI Admin verification queue with document previewers and approval modals.
    - End-to-end regression testing and WCAG AA accessibility audit.

# Implementation progress — 2026-11-02
- User authorized proceeding with the environment-lean foundation scaffold.
- Created npm workspaces for Next.js and NestJS, PostgreSQL connectivity/readiness checks, a same-origin API proxy, design tokens, a responsive illustrative landing page, tests, and startup documentation.
- One backend environment file; no frontend environment file. Redis and unused integration secrets deferred until required.
- Identity, authentication, consent persistence, organization RBAC, database migrations, and verification workflows remain pending. This plan is not complete.

# Implementation progress — 2026-11-04
- Added email OTP MFA enrollment and sign-in challenge endpoints. Codes are one-time, expire after five minutes, are limited to five attempts, and are stored as keyed hashes. Enabling MFA revokes existing refresh sessions.
- Added one-time password reset tokens sent through Brevo. Reset requests return the same response for existing and unknown accounts; completing a reset updates the password and revokes refresh sessions.
- Email OTP MFA and password recovery reuse the configured Brevo sender; no additional MFA- or password-reset-specific environment variables are needed. Frontend MFA screens, account MFA management, organizations, and verification workflows remain pending.
