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

---

## 3. Modifying Plans & Creating New Plans

Agents and contributors are authorized to update existing plans or create new ones as needed:
1. **Updating Existing Plans**:
   - Mark completed endpoints, pages, and phase checklist items (`[x]`) in the relevant `.agents/plans/PLAN-XXXX-*.md` file.
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
   - **Backend (`/backend/src/`)**: Keep domain logic inside isolated NestJS modules (`auth/`, `organizations/`, `users/`, `verification/`, `audit/`). Only touch `backend/src/app.module.ts` to register your module.
   - **Frontend (`/frontend/app/`)**: Work inside your route group (`/auth/*`, `/onboarding/*`, `/organization/*`, `/settings/*`, `/admin/*`) and shared UI components (`/frontend/components/*`).
2. **Database Schema & Drizzle Migrations (`backend/src/schema.ts` & `backend/drizzle/`)**:
   - **Never edit or delete existing committed migration files** (`0000` through `0003` and any subsequent committed SQL files).
   - Always `git pull origin dev` immediately before modifying `backend/src/schema.ts` and running `npm.cmd run db:generate -w backend` so Drizzle's `meta/_journal.json` sequence does not fork.
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

