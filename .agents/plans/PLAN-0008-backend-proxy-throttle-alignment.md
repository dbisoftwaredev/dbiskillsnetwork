# Plan id
PLAN-0008

# Title
Production Proxy IP Forwarding, Throttle Resilience & Google Identity Backend Alignment

# Status
DRAFT

# Created at
2026-11-23

# Updated at
2026-11-23

# Owner
JED

# Related plan
PLAN-0001 (Foundational Identity & Authentication Engine)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`main.ts`, `AuthModule`, `AuthController`, `ConfigModule`)
- Tests: `backend/test/`
- Documentation: `.agents/plans/PLAN-0001-dbi-skills-network.md`, `.agents/logs/activity.log.md`

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: Shared Gateway False Positives on Render & Cloud Deployments**

Tunde and five of his colleagues at an IT hub in Ikeja, Lagos, are applying to join the DBI Skills Network pilot simultaneously from the same shared fiber broadband connection. At the same time, the frontend web application hosted on Render (`dbiskillsnetwork-frontend.onrender.com`) proxies server-side signup actions from its container cluster to the backend API (`dbiskillsnetwork-backend.onrender.com`).

Because the Express backend initially lacked `trust proxy` configuration and had tight rate limits (5 requests per 60 seconds), all incoming requests appeared to originate from the exact same reverse-proxy IP address. After the fifth colleague clicked "Sign Up", subsequent valid registration attempts were rejected with an HTTP 429 error ("Too many attempts. Wait a minute, then try again.")—even though each applicant was a completely distinct user.

**How This Plan Fixes It:**
1. **5x Rate Limit Relaxation**: Multiplies all public authentication throttle limits by 5 (e.g. signup limit relaxed from 5/min to 25/min, global module throttle relaxed from 30/min to 150/min), preventing false-positive lockouts.
2. **Reverse Proxy Client IP Awareness**: Enables `app.set('trust proxy', 1)` in NestJS Express bootstrap so the rate limiter accurately evaluates the real client IP passed through `X-Forwarded-For` rather than the reverse proxy's shared egress IP.
3. **Plan & Schema Sync**: Synchronizes the Plan register with backend changes introduced during frontend onboarding updates (`account_setup_tokens`, `google_auth_challenges`, `google_identities`, and Drizzle migration `0006`).
4. **Zero Frontend Impact**: The entire fix lives strictly in `/backend` and backend configuration without touching any frontend UI or design elements.

---

# Summary

This plan addresses backend operational gaps surfaced during cloud deployment and frontend authentication updates. 

It provides:
1. **Throttler Capacity Expansion**: Increases limits across all `@Throttle()` auth endpoints by 5x (signup from 5 to 25/min; verify-email from 10 to 50/min; refresh from 20 to 100/min; global limit from 30 to 150/min).
2. **Proxy Header Resolution (`trust proxy`)**: Configures Express behind Render/Cloudflare/reverse proxies to inspect `X-Forwarded-For` headers so individual users are not pooled into a single rate-limiting bucket.
3. **Full Non-Visual Test Verification**: Confirms all 17 backend integration suites, Drizzle migration integrity, TypeScript checks, and OpenAPI/Swagger contracts continue to pass cleanly.
4. **Pilot Alignment**: Updates `PLAN-0001` documentation to record the addition of `POST /auth/complete-account-setup`, `POST /auth/google`, and `POST /auth/google/challenge` without altering Track A Pilot deadlines.

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Reverse Proxy IP Resolution**: Configures `app.set('trust proxy', 1)` on `NestExpressApplication` instance in `backend/src/main.ts`.
  - **Resilient Rate Limiting**: Updates `ThrottlerModule` root configuration from 30 to 150 requests/min and scales controller-level `@Throttle()` decorators by 5x.
  - **Deferred Account Setup & Google Identity Schema Sync**: Reconciles Drizzle migration `0006_parched_eternals.sql` with the core identity domain.

- **Endpoints (Audited & Updated Limits)**
  - `POST /api/v1/auth/signup` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/complete-account-setup` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/google/challenge` - Relaxed to 50 requests/min.
  - `POST /api/v1/auth/google` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/verify-email` - Relaxed to 50 requests/min.
  - `POST /api/v1/auth/forgot-password` - Relaxed to 15 requests/min.
  - `POST /api/v1/auth/reset-password` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/signin` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/mfa/setup` - Relaxed to 15 requests/min.
  - `POST /api/v1/auth/mfa/verify` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/mfa/challenge` - Relaxed to 25 requests/min.
  - `POST /api/v1/auth/refresh` - Relaxed to 100 requests/min.
  - `POST /api/v1/auth/signout` - Relaxed to 100 requests/min.

- **Implement in Phases**
  - **Phase 1: Proxy & Throttle Adjustment (Completed)**
    - Configured `NestExpressApplication` with `trust proxy = 1`.
    - Raised global and endpoint-specific rate limit ceilings by 5x.
  - **Phase 2: Automated Contract & Unit Verification (Completed)**
    - Verified all 17 backend integration and unit test suites pass (`npm.cmd test -w backend`).
    - Verified TypeScript typecheck and compilation (`npm.cmd run typecheck`, `npm.cmd run build`).
  - **Phase 3: Plan Synchronization & Serial Logging (Completed)**
    - Updated `PLAN-0001` implementation log to reflect backend additions.
    - Filed `PLAN-0008` in `.agents/plans/` and appended execution details to `.agents/logs/activity.log.md`.

---

# For Frontend
- **Design Invariant**: No frontend code, components, or UI styles modified. Frontend remains untouched in accordance with backend-only scope rules.
