# Plan id
PLAN-0004

# Title
CareerGPS Role Readiness, Interactive Competency Radar & LMS Bridge

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-11-16

# Owner
JED

# Related plan
PLAN-0001 (Auth), PLAN-0002 (Skills Passport), PLAN-0003 (SkillVerify)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`CareerGpsModule`, `LearningBridgeModule`, `MoodleSyncModule`)
- Frontend: `/frontend` (`/talent/careergps`, `/talent/learning`)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: Zainab's Leap from Customer Care to 5G Telecom Network Operations**

Zainab works in telecom customer support in Kano. She wants to transition into a higher-paying technical career as a "5G Core Network Operations Engineer", but she has no idea what specific skills that job demands, how close she is to qualifying, or where to get the right training.

**How This Plan Fixes It:**
1. Zainab opens **CareerGPS** on the DBI platform and selects her dream role: *"5G Core Network Operations Engineer"*.
2. The **CareerGPS Diagnostics Engine** compares her current verified passport skills against the national telecom benchmark for that role.
3. An **Interactive Skill Radar** instantly renders her profile against the role standard:
   - She is **58% Ready**.
   - Her Strengths: *IP Networking (4.2/5)*, *Troubleshooting (4.5/5)*.
   - Her Critical Gaps: *Linux Server Administration*, *5G Service Based Architecture (SBA)*, *NFV/Containerization*.
4. **SkillBridge** recommends the exact training modules to bridge those gaps:
   - "DBI 5G Core Essentials" (syncs with DBI's existing Moodle LMS).
   - "Docker & Kubernetes for Telecom Engineers".
5. Zainab enrolls with one click. Upon completing an authorized Moodle course, her learning record syncs into her Passport as **learning evidence**, and CareerGPS recomputes a provisional role-specific readiness view (illustrative updated result: **84%**, if justified by the approved model). New practical capability is not marked DBI-Verified until she passes applicable SkillVerify evidence checks. Employer visibility remains opt-in.

---

# Summary

PLAN-0004 implements **CareerGPS** and **SkillBridge**, the platform's guidance and learning connectivity engines.

It delivers:
1. **Industry Role Benchmark Profiles**: Standardized capability matrices for key Telecom, IT, and Cloud roles.
2. **CareerGPS Diagnostics Engine**: Multi-variable gap calculation comparing candidate credentials with role benchmarks to produce explainable readiness scores.
3. **Interactive Competency Radar & Animated Career Map**: Signature SVG/Canvas visual radar and animated career progression map charting candidate strengths, competency growth timelines, and missing competencies.
4. **Explainable AI Career Coach**: Suggests verified, actionable next steps (courses, lab tests, projects) without inventing unverifiable credentials or making algorithmic promises.
5. **DBI Moodle LMS Bridge**: Webhook and REST integration with DBI’s existing Moodle learning infrastructure to ingest course progress and completions without rebuilding a custom LMS.

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Role Benchmark & Configurable Weighting Service (Strategy Section 6 & 9)**: Catalog of target telecom/ICT roles, required skills, minimum competency thresholds, and configurable role-suitability factor weights (default baseline hypothesis from Strategy Section 6: *Technical Competence 40%*, *Relevant Experience 20%*, *Work Samples 15%*, *Credentials 10%*, *Role-Specific Professional Skills 10%*, *Evidence Quality/Recency 5%*—stored in database-backed settings for employer/specialist validation).
  - **Readiness Diagnostics & Adjacent Role Engine**: Algorithmic comparison yielding a transparent role-suitability percentage at a specific point in time, categorized into:
    - *Ready* (`85%+` match)
    - *Near-Ready* (`60–84%` match, short targeted intervention)
    - *Needs Foundation* (`<60%` match)
    - Plus identification of **Adjacent Career Options** where existing verified skills already provide high readiness.
    - `[HANDOFF: Deep Reasoning Model recommended when extending multi-role graph clustering and adjacent-pathway ranking.]`
  - **Explainable AI Career Coach Service (Strategy Sections 8 & 16)**: Generates transparent, evidence-backed next-step suggestions (assessments to take for missing evidence, specific courses, labs, or projects). Enforces strict guardrails: never invents credentials, never promises jobs, and never independently authenticates qualifications or overrides deterministic readiness math.
  - **SkillBridge Pathway Recommender (Strategy Section 4)**: Maps missing competencies to DBI Moodle courses, approved external partner courses, hands-on labs, mentorships, industry certifications, and sponsored cohort pathways.
  - **Moodle LMS Integration (Strategy Section 16)**: Uses supported authenticated Moodle web services for enrollment/completion sync, with an optional DBI-installed signed event bridge where supported; LTI launch (if selected) is a separate integration to validate. Records course achievement as learning evidence, not automatic skills certification.

- **Endpoints**
  - `[ ]` `GET /api/v1/careergps/roles` - Browse available telecom and digital industry role benchmarks across the 6 core pathways.
  - `[ ]` `GET /api/v1/careergps/roles/:id` - Detailed skill requirement matrix and weighting breakdown for a specific target role.
  - `[ ]` `POST /api/v1/careergps/diagnose` - Compute explainable gap analysis and factor-by-factor suitability breakdown between user passport and target role.
  - `[ ]` `GET /api/v1/careergps/adjacent-roles` - Retrieve adjacent career roles that match the candidate's current verified skills.
  - `[ ]` `POST /api/v1/careergps/target-role` - Set or update the user's active target dream role.
  - `[ ]` `GET /api/v1/careergps/learning-path` - Retrieve personalized SkillBridge recommendations (courses, labs, mentorship, certifications, sponsored cohorts) for identified gaps.
  - `[ ]` `POST /api/v1/careergps/coach/recommendations` - Retrieve explainable AI Career Coach next-action guidance with deterministic evidence citations.
  - `[ ]` `POST /api/v1/integrations/moodle/webhook` - Optional signed completion-event bridge **only if configured in Moodle**; otherwise use the Moodle authenticated Web Services API sync job.
  - `[ ]` `GET /api/v1/learning/courses` - Search available DBI Moodle and accredited partner courses, labs, and certification tracks.

- **Implement in Phases**
  - **Phase 1: Role Benchmarks, Configurable Weights & Gap Calculation Engine (Weeks 1-2)**
    - Implement Drizzle ORM schemas (`backend/src/schema.ts`) and migrations for `role_benchmarks`, `role_skill_requirements`, `candidate_career_targets`, and `learning_resources`.
    - Unit tests (`node --test`) asserting configurable multi-factor readiness math (40/20/15/10/10/5 default weights), missing-evidence prompts, and adjacent role matching.
  - **Phase 2: Moodle LMS Bridge & Webhooks (Weeks 3-4)**
    - Validate installed Moodle version/capabilities; implement scoped web-service completion polling or a configured HMAC-signed Moodle plugin/event bridge (not a presumed native webhook), with retries and reconciliation.
    - Course completion ingestion as **learning evidence** in `PassportModule`, followed by explainable recalculation; do not automatically upgrade practical skill verification or issuer status.
  - **Phase 3: SkillBridge Recommender & Explainable Coach Guardrails (Weeks 5-6)**
    - Recommendation mapping linking missing taxonomy skills to courses, labs, certifications, and sponsored cohorts.
    - Integration tests covering end-to-end course completion -> passport update -> readiness score recalculation.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Interactive CareerGPS Radar & Animated Career Map (Strategy Section 18)**: Signature UI components combining an interactive multi-axis skill radar, competency growth timeline, and an animated career node map showing progression milestones and adjacent career paths.
  - **Explainable AI Career Coach Drawer**: Guidance widget displaying transparent "Why this recommendation?" explanations and next best actions without fabricated claims or job guarantees.
  - **Role Discovery & Dream Job Picker**: Searchable role catalog across the 6 telecom/ICT domains with demand indicators and required evidence transparency.
  - **Factor & Gap Breakdown Card**: Visual breakdown of the 6 suitability dimensions (*Technical Competence*, *Experience*, *Work Samples*, *Credentials*, *Professional Skills*, *Evidence Recency*) alongside "Skills Verified", "Skills Needing Evidence/Assessment", and "Skills to Acquire".
  - **SkillBridge Learning & Pathway Hub**: Curated view of DBI Moodle courses, external partner trainings, practical labs, and sponsored programmes closing the user's identified gaps.

- **Sub Features**
  - Animated readiness gauge (`prefers-reduced-motion` compliant) updating dynamically as users earn credentials.
  - Competency growth timeline visualizing verified milestones over time.
  - "Adjacent Careers" comparison drawer showing alternative roles the user already qualifies for.
  - Direct redirect/launch into DBI Moodle courses.

- **Pages**
  - `[ ]` `/talent/careergps` - Main CareerGPS hub with interactive radar, factor breakdown, adjacent roles, and active dream-role progress.
  - `[ ]` `/talent/careergps/explore` - Explore telecom/ICT role benchmarks, required skills, and demand insights.
  - `[ ]` `/talent/learning` - SkillBridge dashboard showing enrolled courses, recommended gap-closing pathways, and Moodle sync status.

- **Implement in Phases**
  - **Phase 1: Interactive Radar, Animated Career Map & Timeline (Weeks 1-2)**
    - Build responsive, accessible SVG/Canvas Radar and Competency Growth Timeline components conforming to design palette (`#10263B`, `#128F8A`, `#64DCD1`, `#F2F5FA`, `#D9AB60`).
    - Automated component and Playwright visual/accessibility tests.
  - **Phase 2: Role Selection, Adjacent Roles & Factor Breakdown Views (Weeks 3-4)**
    - Build role selector modals, adjacent-career drawer, and 6-factor gap breakdown cards.
  - **Phase 3: SkillBridge Learning Dashboard & LMS Integration (Weeks 5-6)**
    - Implement course/lab/cohort recommendation cards, Explainable Coach drawer, and Moodle redirect handlers.

# Implementation progress — 2026-11-16 (Strategy & Architecture Alignment)
- Aligned `PLAN-0004` with `DBI_Skills_Network_Illustrated_Product_Strategy.txt` (Sections 4, 6, 8, 9, 16, 18) and the Drizzle ORM / NestJS / Next.js stack:
  - Added the configurable 6-factor role suitability weighting model from Section 6 (40% technical, 20% experience, 15% work samples, 10% credentials, 10% professional skills, 5% evidence quality/recency).
  - Added explicit Adjacent Career Options endpoint/UI, broader SkillBridge pathway types (courses, labs, mentorship, certifications, sponsored cohorts), and strict Explainable AI Career Coach guardrails.

# Plan review and implementation hardening — 2026-11-16

> **Review-only update.** `DRAFT` and unchecked tasks are preserved. The 58%/84% scenario figures illustrate a model; they are neither calibrated hiring probabilities nor real candidate measurements.

## Transparent readiness contract (shared with PLAN-0005)
- Use **role-specific, time-stamped suitability indices**, never a permanent candidate 'quality' or employment probability. Record benchmark ID/version, six configurable factor weights, input evidence versions, provenance, data freshness, missingness, formula version, and factor explanations.
- The default `40/20/15/10/10/5` weights and `85/60` readiness bands are **review hypotheses** needing employer/specialist validation and fairness tests before use in consequential decisions. Weights must sum to 100, be versioned and support rollback; do not silently compare percentages generated under different versions.
- Separate `NOT_ASSESSED` from `ASSESSED_LOW`: insufficient evidence should be shown as missing/unknown with a suggested validation route, never imputed as poor ability. For safety-critical roles, enforce necessary certifications/safety gates as independent requirements rather than burying them in a weighted average.
- Readiness output should include an evidence coverage indicator, skill-level gap list, adjacent-role explanations, and a clear **not a hiring decision** disclaimer. Employer-facing comparisons in PLAN-0005 must reuse the same versioned engine, not fork matching logic.

## Moodle bridge and learning-verification boundaries
- Confirm DBI Moodle version, enabled external services, course catalog IDs, completion rules, grade privacy permissions, user-ID mapping, service account privileges and deployment environment **before** choosing webhook, polling or LTI. Moodle supports web-service completion functions; outbound completion webhooks require a configured bridge/plugin rather than being assumed standard.
- Treat incoming Moodle events as **untrusted until authenticated**: validate service credentials or signed bridge payload, reject replay, ensure unique `(provider, event_id)` or `(course, user, completion_version)` key, retain reconciliation job cursor and audit retries. Handle withdrawal, failed grades, course reattempts and late corrections.
- Grade/completion is `LEARNING_COMPLETED` evidence. Only PLAN-0003/authorized issuers may grant `VERIFIED` practical skill or formal accreditation; recalculate role readiness from newly evidenced facts without automatically awarding credentials.
- AI Career Coach is **optional and advisory**, cites only role benchmark/taxonomy/course/assessment IDs already in the system, and must degrade to a deterministic recommendations list if the model is unavailable. Avoid unsupported salary, demand, placement or success predictions.

## Proposed endpoints and data dependencies
- `[ ]` `GET /api/v1/careergps/diagnoses/:id` — immutable/read-only diagnosis snapshot including versions, evidence coverage and factor contribution explanations.
- `[ ]` `GET /api/v1/integrations/moodle/sync-status` — admin visibility into last reconciliation, failures, mapped courses and provider health (no student grade data in public output).
- `[ ]` `POST /api/v1/admin/integrations/moodle/reconcile` — privileged, rate-limited rerun of completion sync; idempotent across duplicate events.
- `[ ]` `GET /api/v1/learning/courses/:id/skill-mappings` — traceable, DBI-approved mappings from catalog/course outcomes to taxonomy skills; separate evidence strength from course marketing descriptions.

## Acceptance criteria and rollout sequence
- `[ ]` For a fixed input dataset, readiness is deterministic and explainable; invalid weights or stale taxonomy mappings cause a controlled diagnostic error, not a plausible fabricated score.
- `[ ]` Missing evidence, revoked credentials, expired assessments, rubric safety gates and a new benchmark version update readiness and display their reason to the user.
- `[ ]` Completed Moodle course -> authenticated sync -> `LEARNING_COMPLETED` record -> recommendation/readiness refresh; **no auto `DBI_VERIFIED`** until suitable verification evidence exists.
- `[ ]` Tenant/privacy tests prohibit display of learner grades to unauthorised employers and prevent opt-out candidates from appearing in employer discovery.
- `[ ]` Provide accessible table equivalents for radar/animation; avoid motion-heavy default UX on low-data devices.
- Phase the release: deterministic engine and mappings (P0), Moodle integration (P1), optional AI coaching/advanced adjacency graph (P2) after domain validation.
