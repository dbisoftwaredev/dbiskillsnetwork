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

#### Track A — Month-End Pilot Plans (Hard Deadline: Monday, 30 November 2026)
1. **[`PLAN-0001`: Foundational Identity, Goal-First Onboarding & Organization Verification](./.agents/plans/PLAN-0001-dbi-skills-network.md)** — **`IN_PROGRESS`** *(Target: **Mon, 23 Nov 2026** — Backend complete on `dev`; Frontend UI + live DB migration remaining)*
2. **[`PLAN-0002`: Talent Profile, 6-Pathway Telecom Taxonomy, Readiness Explorer & Digital Skills Passport](./.agents/plans/PLAN-0002-skills-passport-engine.md)** — `DRAFT (PILOT TARGET)` *(Target: **Thu, 26 Nov 2026** — Lean Taxonomy, Explorer, Profile & Shareable QR Passport)*
3. **[`PLAN-0003`: SkillVerify Pilot Diagnostic, Evaluator Sign-Off & Pilot Employer Shortlist Loop](./.agents/plans/PLAN-0003-skillverify-assessment-engine.md)** — `DRAFT (PILOT TARGET)` *(Target: **Mon, 30 Nov 2026** — Lean MCQ Diagnostic, Assigned Evaluator Safety Sign-Off & Thin Employer Job/Apply Loop)*

#### Track B — Post-Pilot Expansion Plans (After 30 November 2026)
4. **[`PLAN-0004`: CareerGPS Role Readiness, Interactive Competency Radar & LMS Bridge](./.agents/plans/PLAN-0004-careergps-radar-lms-bridge.md)** — `DRAFT (POST-PILOT)` *(CareerGPS Radar, 6-Factor Readiness, AI Coach & Moodle LMS Bridge)*
5. **[`PLAN-0005`: OpportunityHub & Sponsored Workforce Development Cohort Exchange](./.agents/plans/PLAN-0005-opportunityhub-sponsored-cohorts.md)** — `DRAFT (POST-PILOT)` *(Full OpportunityHub, Sponsored Workforce Cohorts, Expert Circle & Multi-Channel Alerts)*
6. **[`PLAN-0006`: WorkforceIQ Macro Labor Intelligence & Sectoral Workforce Atlas](./.agents/plans/PLAN-0006-workforceiq-macro-intelligence.md)** — `DRAFT (POST-PILOT)` *(WorkforceIQ Macro Intelligence, Sectoral Workforce Atlas & Government/Donor Portals)*
7. **[`PLAN-0007`: Post-Pilot Deepening: W3C Verifiable Credentials v2.0, Confirmed CV Extraction, Proctored Simulations, Appeals & Object Storage](./.agents/plans/PLAN-0007-post-pilot-advanced-credentials-proctoring-storage.md)** — `DRAFT (POST-PILOT)` *(Advanced capabilities deferred out of the November Pilot)*

---

## 2. Current Sprint Target, Anti-Bloat Rules & Team Split

- **Month-End Pilot Deadline (PDBI Target)**: **Monday, 30 November 2026**
- **10-Day Pilot Schedule (20 Nov → 30 Nov 2026)**:
  - **20–23 Nov (`PLAN-0001`)**: Complete Frontend auth, goal-first talent onboarding (`/onboarding/talent`), compact organization onboarding/workspace (`/onboarding/organization`, `/organization/dashboard`), privacy toggles (`/settings/privacy-consent`), DBI admin verification queue (`/admin/verifications`), and live PostgreSQL `db:migrate`.
  - **24–26 Nov (`PLAN-0002`)**: Seed 6 Telecom/ICT domains + pilot benchmarks; deliver public `/explorer`, `/talent/dashboard`, declared/verified skills, and shareable `/p/[handle]` QR Passport (browser print-to-PDF).
  - **27–30 Nov (`PLAN-0003`)**: Deliver 2 seeded telecom MCQ diagnostics, `DBI_EVALUATOR` safety-gated Passport verification sign-off (`/evaluator/dashboard`), and the thin verified-employer job post + 1-click free apply shortlist loop (`/talent/opportunities`, `/employer/jobs`), followed by end-to-end Pilot smoke verification.
- **Strict Anti-Bloat Rules for All AI Agents**:
  1. **Never pull Track B (`PLAN-0004`–`PLAN-0007`) features into Pilot branches** during the November 2026 sprint.
  2. **Never add unapproved infrastructure**: no Redis queues, no virus-scanning pipelines, no headless PDF browsers, no LLM/AI CV parsing or Career Coach engines, no WhatsApp/SMS provider SDKs, no proctoring/webcam telemetry, and no SVG/GeoJSON map libraries during the Pilot. *(Note: **Neon Object Storage** `uploads` bucket via `files-sdk/neon` is provisioned in `neon.ts` as the S3-compatible storage layer, with Cloudflare R2 `files-sdk/r2` as a future swap option.)*
  3. **Use Swagger (`/api/docs-json`) as the single contract** between Backend and Frontend.
- **Jed (Full-Stack / Backend) vs. Kate (Frontend) Division of Labor**:
  - **Jed (Full-Stack / Backend)**: Owns `/backend` NestJS modules, Drizzle schemas & migrations (`backend/src/schema.ts`), database seeds, Swagger contract publishing, and full-stack integration/deployment.
  - **Kate (Frontend)**: Works strictly inside `/frontend` (App Router pages & components) against existing endpoints documented in `/api/docs-json` via the same-origin `/api/*` proxy using standard browser `fetch()` (AJAX/XHR) with `application/json` payloads (never Next.js Server Actions), without modifying backend schemas or introducing a frontend `.env`.
- After the **30 November 2026 Pilot** ships and passes validation on `dev`, execution proceeds sequentially through Track B (`PLAN-0004` through `PLAN-0007`).

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
4. **Frontend API Transport Mandate (Standard `fetch` / AJAX / XHR — No Server Actions)**:
   - **Never use Next.js Server Actions** (`'use server'`, `useActionState`, or `<form action={serverAction}>`) for form submissions, mutations, or backend API requests. Server Actions obscure endpoints behind React Flight `multipart/form-data` payloads (`_1_$ACTION_REF_*`) and always return HTTP `200 OK` on the page URL, hiding real API paths and status codes in browser DevTools.
   - **Always use standard client-side `fetch()` (AJAX / XHR)** inside `<form onSubmit={...}>` or event handlers, sending `application/json` requests directly to `/api/v1/*` (which Next.js proxies to the NestJS backend via `frontend/next.config.mjs`).
   - Every request in the browser Network tab must show the real REST endpoint (`/api/v1/auth/signup`, `/api/v1/users/me`, etc.), a clean JSON request/response body, and the true HTTP status code (`200`, `201`, `202`, `400`, `401`, `409`, `429`).
   - Where server-rendered pages require session cookies, sync tokens through a clean JSON Route Handler (e.g., `POST /session`, `DELETE /session`) or standard `Authorization: Bearer <token>` headers — never via `'use server'` form actions.



---

## 6. Cross-Plan Data Contracts, Privacy Boundaries & Sequencing (reviewed 2026-11-16)

1. **Ownership is explicit**: PLAN-0001 controls identities, organization verification, roles, preference/legal-basis records and audit; PLAN-0002 controls Explorer, taxonomy, Passport and basic skill evidence; PLAN-0003 controls Pilot assessments/rubrics/evaluator results (plus the thin verified-employer job/apply Pilot slice); PLAN-0004 controls role suitability, pathway advice and Moodle bridge; PLAN-0005 controls full jobs/applications/cohorts/Expert Circle; PLAN-0006 controls privacy-reviewed aggregate releases and B2B licensing; PLAN-0007 controls deferred post-pilot deepening (Neon Object Storage / Cloudflare R2 `StorageModule` presign & malware scanning, W3C VC v2.0 signing, confirmed CV parsing, telecom simulations, appeals queues, and Redis/SMS/WhatsApp dispatchers). Consult `.agents/docs/CROSS_PLAN_CONTRACTS.md` before altering shared enums or user journeys.
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
