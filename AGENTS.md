# AGENTS.md — Multi-Agent & Contributor Operational Guide

Welcome to the **DBI Skills Network** repository. Every AI coding agent and human contributor **must read this file first** before planning, editing code, running migrations, or merging branches.

---

## 1. Quick Links to `.agents` Documentation & Plans

All operational rules, serial logs, model handoff guides, and numbered implementation plans live in [`.agents/`](./.agents/):

### Core Governance & Logs
- **[Agent Operation & Planning Rules (`.agents/README.md`)](./.agents/README.md)** — Core principles (*Tests as the Spec*, *Fewer Rules*, *Tiered Planning*, *Design Preservation*).
- **[Serial Activity & Execution Log (`.agents/logs/activity.log.md`)](./.agents/logs/activity.log.md)** — Chronological log of all agent sessions, plan updates, and verification runs.
- **[Model Capability & Handoff Protocol (`.agents/docs/gemini-flash-handoff.md`)](./.agents/docs/gemini-flash-handoff.md)** — Division of labor between fast scaffolding models and deep reasoning models.
- **[Official Plan Template (`.agents/plans/TEMPLATE.md`)](./.agents/plans/TEMPLATE.md)** — Standard template for creating new `PLAN-XXXX` files.

### Product Strategy & Setup References
- **[Product Strategy & Functional Blueprint (`DBI_Skills_Network_Illustrated_Product_Strategy.txt`)](./DBI_Skills_Network_Illustrated_Product_Strategy.txt)** — Source of truth for product engines, UX mandates, NDPA compliance, and commercial rules.
- **[Project Quick Start & Environment Guide (`README.md`)](./README.md)** — Local startup order, lean `backend/.env` configuration, and verification commands.
- **[Cross-Plan Contracts & Release Gates (`.agents/docs/CROSS_PLAN_CONTRACTS.md`)](./.agents/docs/CROSS_PLAN_CONTRACTS.md)** — Ownership of canonical records, privacy boundaries, integration semantics and cross-engine acceptance gates.
- **[External Review Notes (`docs/DBI_PLAN_REVIEW_2026-11-16.md`)](./docs/DBI_PLAN_REVIEW_2026-11-16.md)** — Scope, key corrections and remaining approvals.

### Implementation Plans (`.agents/plans/`)
1. **[`PLAN-0001`: Foundational Identity, Multi-Tenant Organization Management & Authentication Engine](./.agents/plans/PLAN-0001-dbi-skills-network.md)** — **`IN_PROGRESS`** *(Current Primary Focus)*
2. **[`PLAN-0002`: Talent Profile, Competency Taxonomy & Digital Skills Passport Engine](./.agents/plans/PLAN-0002-skills-passport-engine.md)** — `DRAFT` *(Covers Talent Pre-Signup Explorer & Profile Onboarding)*
3. **[`PLAN-0003`: SkillVerify Assessment Runner & Practical Telecom Lab Evaluation System](./.agents/plans/PLAN-0003-skillverify-assessment-engine.md)** — `DRAFT`
4. **[`PLAN-0004`: CareerGPS Role Readiness, Interactive Competency Radar & LMS Bridge](./.agents/plans/PLAN-0004-careergps-radar-lms-bridge.md)** — `DRAFT`
5. **[`PLAN-0005`: OpportunityHub & Sponsored Workforce Development Cohort Exchange](./.agents/plans/PLAN-0005-opportunityhub-sponsored-cohorts.md)** — `DRAFT`
6. **[`PLAN-0006`: WorkforceIQ Macro Labor Intelligence & Sectoral Workforce Atlas](./.agents/plans/PLAN-0006-workforceiq-macro-intelligence.md)** — `DRAFT`

---

## 2. Current Sprint Target & Priority

- **First Target**: **User Auth & New User Onboarding**
- **Target Delivery**: **Monday, 23 November 2026**
- **Scope**:
  - Complete the remaining backend and frontend items in **[`PLAN-0001`](./.agents/plans/PLAN-0001-dbi-skills-network.md)**:
    - **Backend (`/backend`)**: `UsersModule` (`/api/v1/users/me` & `/api/v1/users/me/communication-preferences` including goal-first onboarding state), organization verification submission (`POST /api/v1/organizations/:organizationId/verification/submit`), DBI admin verification review endpoints (`GET /api/v1/admin/organizations/verifications`, `PATCH /api/v1/admin/organizations/:organizationId/verification/decide`), and `audit_logs`. *(Note: Backend Phase 1 & 2 for `AuthModule` and `OrganizationModule` are already implemented.)*
    - **Frontend (`/frontend`)**: Reusable UI primitives, authentication pages (`/auth/login`, `/auth/signup`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/mfa`), 3–5 minute Goal-First Talent Onboarding (`/onboarding/talent` — *"What would you like to achieve?"*), Organization Onboarding Wizard (`/onboarding/organization`), organization workspace views (`/organization/*`), NDPA consent dashboard (`/settings/privacy-consent`), and DBI admin verification queue (`/admin/verifications`).
  - Connect into **[`PLAN-0002`](./.agents/plans/PLAN-0002-skills-passport-engine.md)** onboarding surfaces where appropriate:
    - Public unauthenticated **Career Readiness Explorer** (`/explorer`, `POST /api/v1/public/career-readiness-explorer` — *"Value first, registration second"*) and initial **Talent Profile / Passport** handoff (`/talent/dashboard`, `/talent/profile/edit`).
- After User Auth & Onboarding are complete and verified on `dev`, execution proceeds sequentially through the remaining feature plans (`PLAN-0002` through `PLAN-0006`).
- **Cross-plan exception**: only the minimal PLAN-0002 Explorer/token/profile handoff required for the PLAN-0001 onboarding sprint may begin in parallel; keep an explicit contract and integration tests. Do not mark all PLAN-0002 features started or complete because the thin handoff shipped.

---

## 3. Modifying Plans & Creating New Plans

Agents and contributors are authorized to update existing plans or create new ones as needed:
1. **Updating Existing Plans**:
   - Mark completed endpoints, pages, and phase checklist items (`[x]`) in the relevant `.agents/plans/PLAN-XXXX-*.md` file.
   - Only check a task after linking a commit/PR and successful evidence from the appropriate tests. A document review, proposed endpoint, scenario or source plan note is **not** proof of implementation.
   - Update the `# Updated at` date and append a dated `# Implementation progress — YYYY-MM-DD` section at the bottom of the plan.
2. **Creating New Plans**:
   - Copy [`.agents/plans/TEMPLATE.md`](./.agents/plans/TEMPLATE.md) to `.agents/plans/PLAN-XXXX-<slug>.md` using the next sequential number.
   - Include a clear non-technical **Scenario / Example** before the **Summary**, followed by Backend API and Frontend sections with phased delivery.
   - For small bug fixes, copy edits, or minor styling tweaks, a full numbered `PLAN-XXXX` file is not required (follow the *Lightweight Plans* rule in [`.agents/README.md`](./.agents/README.md)).
3. **Logging**:
   - Every meaningful agent run, plan change, or feature milestone must be appended to [`.agents/logs/activity.log.md`](./.agents/logs/activity.log.md).

---

## 4. Git Workflow & Multi-Agent Collision Prevention Rules

Multiple developers and AI agents work on this repository concurrently. Follow these rules strictly so agents do not overwrite each other's work or break builds:

### 4.1 Branch Promotion Pipeline (`feature branch -> dev -> production`)
```text
your-feature-branch  ──►  dev  ──►  production
```
1. **Always Work in a Feature Branch**:
   - Branch off the latest `dev` branch before making changes:
     ```powershell
     git checkout dev
     git pull origin dev
     git checkout -b feat/plan-0001-<short-scope>
     ```
   - Examples of clean, scoped branch names:
     - `feat/plan-0001-users-me-api`
     - `feat/plan-0001-org-verification-api`
     - `feat/plan-0001-auth-screens`
     - `feat/plan-0001-talent-onboarding-ui`
     - `feat/plan-0001-org-onboarding-ui`
2. **Merge to `dev` First**:
   - Before merging your feature branch into `dev`, pull/rebase the latest `origin/dev`, resolve any conflicts locally, and run the full verification suite (Section 5).
   - Never force-push (`git push --force`) to `dev` or `production`.
3. **Promote `dev` to `production`**:
   - `production` only receives tested, verified merges from `dev`. Never commit or branch hotfixes directly onto `production` without syncing `dev`.

### 4.2 Avoiding File & Schema Collisions Across Agents
1. **Scope Your Slices Narrowly**:
   - **Backend (`/backend/src/`)**: Keep domain logic inside isolated NestJS modules (`auth/`, `organizations/`, `users/`, `verification/`, `audit/`). Change shared bootstrap/config/router files only when necessary for an agreed cross-cutting contract and include targeted regression tests; register new modules explicitly in `backend/src/app.module.ts`.
   - **Frontend (`/frontend/app/`)**: Work inside your route group (`/auth/*`, `/onboarding/*`, `/organization/*`, `/settings/*`, `/admin/*`) and shared UI components (`/frontend/components/*`).
2. **Database Schema & Drizzle Migrations (`backend/src/schema.ts` & `backend/drizzle/`)**:
   - **Never edit or delete existing committed migration files** (`0000` through `0003` and any subsequent committed SQL files).
   - Always `git pull origin dev` immediately before modifying `backend/src/schema.ts` and running `npm.cmd run db:generate -w backend` so Drizzle's `meta/_journal.json` sequence does not fork.
   - Assign a single migration owner per branch/merge window; let CI verify ordered migrations against a fresh database and a migrated existing snapshot. Never resolve migration conflicts by renumbering/editing committed SQL.
3. **Respect Working Tree & Uncommitted Files**:
   - Never run destructive git commands (`git reset --hard`, `git checkout -- .`, `git clean -fd`) that could wipe uncommitted work in a shared workspace.
   - Never commit real `.env` files, credentials, or build artifacts (`node_modules/`, `.next/`, `dist/`, `test-results/`).

---

## 5. Architecture, Design & Verification Invariants

1. **Tests as the Spec**:
   - Write or update automated unit, integration, or Playwright E2E tests alongside every backend endpoint and frontend flow.
   - On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution policy blocks `.ps1` wrappers:
     ```powershell
     npm.cmd test
     npm.cmd run typecheck
     npm.cmd run build
     npm.cmd run test:browser
     ```
2. **Design System & UX Mandate**:
   - Do not alter existing UI designs, layouts, or color tokens without explicit instruction.
   - Strictly use the 5-color palette defined in `frontend/app/globals.css` and [`.agents/README.md`](./.agents/README.md):
     - Midnight Navy: `#10263B`
     - Ocean Teal: `#128F8A`
     - Electric Mint: `#64DCD1`
     - Cloud White: `#F2F5FA`
     - Warm Gold: `#D9AB60`
   - Ensure talent flows are mobile-first, low-data friendly, and support save-and-resume; ensure institutional/admin dashboards are desktop-optimized and WCAG AA accessible.
3. **Lean Environment Configuration**:
   - Only `backend/.env` is used (copied from `backend/.env.example`).
   - Do **not** introduce a frontend `.env` file; all browser `/api/*` requests proxy to the NestJS backend (`127.0.0.1:3001`) via Next.js rewrites in `frontend/next.config.mjs`.



---

## 6. Cross-Plan Data Contracts, Privacy Boundaries & Sequencing (reviewed 2026-11-16)

1. **Ownership is explicit**: PLAN-0001 controls identities, organization verification, roles, preference/legal-basis records and audit; PLAN-0002 controls Explorer, taxonomy, Passport and credential storage; PLAN-0003 controls assessments/rubrics/evaluator results; PLAN-0004 controls role suitability, pathway advice and Moodle bridge; PLAN-0005 controls jobs/applications/cohorts/Expert Circle; PLAN-0006 controls privacy-reviewed aggregate releases and B2B licensing. Consult `.agents/docs/CROSS_PLAN_CONTRACTS.md` before altering shared enums or user journeys.
2. **Three separate evidence concepts**: `DECLARED/DEMONSTRATED/VERIFIED` is a skill evidence tier; `VERIFIED/PROVISIONAL/INSUFFICIENT_EVIDENCE` is confidence; a nullable `1.0–5.0` proficiency applies only to a skill with sufficient rubric evidence. Moodle course completion alone **never** promotes skills to DBI-Verified.
3. **Safety and privacy first**: platform roles must not be confused with organization roles; DBI evaluators require assignment-level permission. No bulk talent search without authorized verified employer and talent disclosure permission; no private credential fields in public Passport output; no small-cell statistics exposed in dashboards or exports. `k >= 10` is a minimum, not a legal safe harbor.
4. **Keep candidate economics fair**: applications are free, payment does not influence suitability/ranking and any expert designation requires evidence-based human review. Financial collection or disbursement is not authorized by a workforce cohort UI plan alone.
5. **Document review is not code verification**: the 2026-11-16 edits were conducted from the seven uploaded Markdown files, without access to the working repo or the separately referenced product strategy text. Existing `[x]` markers and implementation logs reflect the authors' source claims, not independent re-testing. Do not reclassify them as reviewed evidence.

## 7. Release Quality, Evidence & Security Gates

- Every public route and admin action needs unit, integration and Playwright tests where appropriate; include unauthenticated, other-tenant, expired/revoked, replay, rate-limit and idempotency cases. Ensure accessibility checks for keyboard, screen reader, reduced motion and low-bandwidth flows.
- On plan update, record the exact repo/branch/commit, migration ID, test commands/result, reviewer, demo/acceptance link and any unresolved risk in `.agents/logs/activity.log.md`. A plan can be `IN_PROGRESS` while approval metadata remains `DRAFT`; **do not infer approval** from execution status.
- Obtain DBI domain-owner approval for practical safety rubrics and issuer signing; obtain privacy/legal review for data-processing lawful bases, employer disclosure, retention, institutional API contracts and WorkforceIQ aggregate release. Don't claim verified legal compliance without review.
- Cross-plan integration contract tests must cover Explorer -> signup; SkillVerify -> Passport; Moodle -> learning evidence -> readiness; readiness -> opportunity matching; cohort/application events -> privacy-safe aggregate dashboards.
- Follow the repository's documented **npm workspaces / Windows `npm.cmd`** workflow unless a separate, coordinated package-manager migration is explicitly approved. Do not inadvertently introduce an alternative lockfile.
