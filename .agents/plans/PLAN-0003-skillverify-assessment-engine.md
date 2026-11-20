# Plan id
PLAN-0003

# Title
SkillVerify Pilot Diagnostic, Evaluator Sign-Off & Pilot Employer Shortlist Loop (PILOT — Target: 30 Nov 2026)

# Status
DRAFT (PILOT TARGET — Target: 30 Nov 2026)

# Created at
2026-10-31

# Updated at
2026-11-20

# Owner
JED

# Related plan
PLAN-0001 (Auth & Orgs), PLAN-0002 (Skills Passport), PLAN-0005 (Pilot Employer Shortlist slice), PLAN-0007 (Deferred post-pilot simulations, endorsements & appeals queue)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`AssessmentModule`, `EvaluationModule`, thin Pilot `OpportunityModule`)
- Frontend: `/frontend` (`/talent/assessments`, `/evaluator/dashboard`, `/talent/opportunities`, `/employer/jobs`)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: Chinedu's Fiber Splicing Practical Test & DBI Evaluator Verification**

Chinedu claims on his profile that he is an expert in Optical Time Domain Reflectometer (OTDR) testing and fusion splicing. However, a major telecom contractor, MainOne, will not deploy technicians on live backbone fiber cables based solely on an online quiz. They need practical proof of competence.

Through **SkillVerify**, Chinedu registers for the "Certified Fiber Optic Splicing & OTDR Lab Assessment".
1. He first takes a 30-minute timed proctored theory diagnostic online to test laser safety, decibel loss calculations, and standard fiber color codes.
2. Next, he attends a physical hands-on session at a DBI Innovation Center lab in Abuja. A certified DBI Master Evaluator, Engr. Fatima, oversees his live splice.
3. Engr. Fatima opens the **DBI Evaluator Portal** on her tablet, records Chinedu’s measured splice loss (illustrative: 0.02 dB; pass/fail depends on the approved assessment rubric), inspects his fiber cleave angle, and signs off on the practical rubrics with an evaluator signature or equivalent authenticated sign-off and independent audit trace.
4. After evaluator sign-off, safety-gate clearance and DBI credential issuance, Chinedu's Passport displays an evidence-backed **4.6/5 Fibre Splicing rating** (illustrative) and its verification status. Recruiters can inspect the underlying scope, date and issuing authority; the badge is not a guarantee of future job performance.

---

# Summary

PLAN-0003 implements the **SkillVerify Engine**, the platform's trusted verification mechanism that transforms self-declared claims into objectively authenticated capabilities.

It delivers:
1. **Multi-Modal Assessment Engine (Strategy Section 4)**: Supports technical diagnostic questions, work sample submissions, coding labs, telecom simulations, supervised practical evaluations, credential checks, and authorized peer/supervisor endorsements.
2. **Practical Lab, Safety-Critical & Supervised Evaluation Framework (Strategy Sections 4 & 9)**: Standardized rubrics for physical DBI campus evaluations, safety-critical field validations (rigging/tower safety, laser/OTDR safety, high-voltage power handling), and evaluator digital sign-offs.
3. **Explainable Domain-Specific Skill Scoring & Evidence Confidence (Strategy Section 6)**: Calculates skill-specific proficiency ratings (e.g., `4.3 / 5.0 stars in Fibre Splicing`) and evidence confidence states (`VERIFIED`, `PROVISIONAL`, `INSUFFICIENT_EVIDENCE`). Missing evidence prompts an assessment recommendation rather than assigning an unjustified low rating, and the system never assigns a single universal lifelong rating across unrelated professions.
4. **Assessment Integrity, Malpractice Review & Human Appeal Workflow (Strategy Sections 6 & 17)**: Tab-switching/focus-loss telemetry, randomized question pools, malpractice review queues, and formal human-in-the-loop appeal and re-evaluation pathways.

---

# For Backend API (`/backend` - NestJS Microservice-Ready)

- **Features**
  - **Assessment Catalog, Safety Prerequisites & Question Bank**: Tagged question and simulation repository mapped to Taxonomy skills, occupation proficiency tiers, and safety-critical field requirements reviewed by sector specialists.
  - **Exam & Work-Sample Session State Machine**: Handles test commencement, countdown timers, randomized seed generation, work-sample/simulation artifact capture, auto-submission, and score computation.
  - **Practical Evaluation, Endorsement & Rubrics Service**: Multi-criteria grading rubrics for lab evaluators (e.g., Safety Compliance, Accuracy, Equipment Handling, Splice Quality) and authorized supervisor/employer endorsements.
  - **Competency Rating & Evidence Confidence Calculator**: Combines diagnostic scores, practical evaluations, and evidence freshness to update skill proficiency stars (`1.0` to `5.0`) and evidence confidence (`VERIFIED` / `PROVISIONAL` / `INSUFFICIENT_EVIDENCE`) on the user's Passport.
  - **Explainability, Malpractice Review & Human-in-the-Loop Audit**: Ensures ratings are role- and skill-specific, completely explainable, with explicit evidence breakdowns. Prohibits black-box algorithmic disqualification; flags anomalies for human malpractice review.
  - **Appeal, Correction & Retake Workflow**: Formal administrative appeal mechanism allowing candidates to challenge evaluations, request human regrading, or re-test after cooldown.

- **Endpoints**
  - `[ ]` `GET /api/v1/assessments` - Browse available SkillVerify tests, simulations, and practical labs filtered by skill domain, occupation, and level.
  - `[ ]` `POST /api/v1/assessments/:id/start` - Initiate timed assessment session and receive randomized question/simulation payload.
  - `[ ]` `POST /api/v1/assessments/sessions/:sessionId/answers` - Save progressive answer responses or work-sample artifacts.
  - `[ ]` `POST /api/v1/assessments/sessions/:sessionId/submit` - Finalize test submission and trigger automated grading.
  - `[ ]` `GET /api/v1/assessments/sessions/:sessionId/result` - Retrieve detailed results, explainable score breakdown, evidence confidence status, and badge issuance.
  - `[ ]` `GET /api/v1/evaluator/rubrics/:assessmentId` - Fetch practical grading rubrics (including safety-critical checkpoints) for supervised lab assessments.
  - `[ ]` `POST /api/v1/evaluator/sessions/:sessionId/grade` - Submit evaluator practical grades, safety sign-off, comments, and digital signature.
  - `[ ]` `POST /api/v1/assessments/endorsements` - Submit an authorized supervisor/employer skill endorsement with evidence reference.
  - `[ ]` `POST /api/v1/assessments/:sessionId/appeal` - Submit an appeal for assessment or malpractice review re-evaluation.
  - `[ ]` `GET /api/v1/admin/assessments/appeals` - DBI Admin/Reviewer endpoint for inspecting and resolving assessment appeals and integrity flags.
  - `[ ]` `PATCH /api/v1/admin/assessments/appeals/:appealId/decide` - Record human reviewer decision on an assessment appeal with audit log entry.

- **Implement in Phases**
  - **Phase 1: Question Bank, Rubrics & Drizzle Schema (Weeks 1-2)**
    - Implement Drizzle ORM schemas (`backend/src/schema.ts`) and migrations for `assessments`, `assessment_questions`, `exam_sessions`, `exam_responses`, `practical_evaluations`, and `assessment_appeals`.
    - Unit tests (`node --test`) verifying automated scoring algorithms, missing-evidence handling (prompting assessment rather than penalizing), and question randomization.
  - **Phase 2: Timed Session Runner, Work Samples & Integrity Telemetry (Weeks 3-4)**
    - Implement session heartbeat, auto-submit timeout handling, response persistence, and malpractice review flags.
    - Integration test suite for exam lifecycle and concurrency.
  - **Phase 3: Evaluator Rubrics, Endorsements & Score Ingestion to Passport (Weeks 5-6)**
    - Build evaluator scoring endpoints, safety-critical sign-off checks, and RBAC guards using a scoped DBI evaluator permission/assignment; generic organization `REVIEWER` is insufficient to grade DBI assessments.
    - Update `PassportModule` skill proficiency ratings (`1.0`–`5.0`) and evidence confidence upon verified completion.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **SkillVerify Assessment Center**: Clean, responsive catalog displaying diagnostic tests, telecom simulations, work-sample challenges, and physical lab bookings with prerequisites and verified badge previews.
  - **Distraction-Free Exam & Simulation Room**: High-focus testing interface with live countdown timer, question navigation drawer, review flags, and resilient auto-save for low-bandwidth connections.
  - **Evaluator Practical Grading Tablet Portal**: Touch-optimized interface for DBI lab evaluators to score hands-on performance and safety-critical checkpoints against rubrics.
  - **Exam Results & Explainable Performance Diagnostic**: Visual score breakdown by competency sub-skills, evidence confidence badge (`Verified` / `Provisional` / `Insufficient Evidence`), and clear next-step recommendations.

- **Sub Features**
  - Browser fullscreen and focus-loss warning alerts (logged for human review, never automatic opaque disqualification).
  - Auto-save indicator ensuring answers are preserved across network interruptions.
  - Badge issuance feedback only after signed assessment approval; a theory pass alone never awards a verified practical credential.

- **Pages**
  - `[ ]` `/talent/assessments` - Assessment catalog, introductory free assessments, and active lab bookings.
  - `[ ]` `/talent/assessments/[id]/take` - Distraction-free exam and simulation room.
  - `[ ]` `/talent/assessments/[id]/result` - Comprehensive test scorecard with explainable rating breakdown, evidence confidence status, appeals button, and passport badge link.
  - `[ ]` `/talent/assessments/[id]/appeal` - Formal score appeal and explanation submission form.
  - `[ ]` `/evaluator/dashboard` - Evaluator queue of practical candidate sessions.
  - `[ ]` `/evaluator/grade/[sessionId]` - Touch-friendly rubrics and safety-compliance grading sheet.
  - `[ ]` `/admin/assessments/appeals` - DBI administrative panel for human-in-the-loop review of appeals and malpractice flags.

- **Implement in Phases**
  - **Phase 1: Assessment Catalog & Booking UI (Weeks 1-2)**
    - Build test card components, safety prerequisite indicators, and booking modals.
  - **Phase 2: Exam Room Interface (Weeks 3-4)**
    - Implement test runner, timer hooks, offline-resilient answer saving, and auto-submit triggers.
    - Automated unit and Playwright browser tests.
  - **Phase 3: Evaluator Portal, Appeals & Result Views (Weeks 5-6)**
    - Build the evaluator grading rubrics interface, appeal resolution views, and explainable result scorecard.

# Implementation progress — 2026-11-16 (Strategy & Architecture Alignment)
- Aligned `PLAN-0003` with `DBI_Skills_Network_Illustrated_Product_Strategy.txt` (Sections 4, 6, 9, 10, 17, and Appendix B) and the Drizzle ORM / NestJS / Next.js stack:
  - Added multi-modal assessment coverage (questions, work samples, simulations, practical labs, authorized endorsements) and safety-critical field checkpoints.
  - Enforced Section 6 rating rules: skill-specific stars (`1.0`–`5.0`), evidence confidence states (`VERIFIED`, `PROVISIONAL`, `INSUFFICIENT_EVIDENCE`), prompting assessments when evidence is missing rather than assigning low ratings, and human-reviewed malpractice/appeal decisions.

# Plan review and implementation hardening — 2026-11-16

> **Review-only update.** `DRAFT` and all unchecked items are unchanged. Numeric scenario ratings and the example splice reading are fictional planning examples, **not** pre-approved safety thresholds or scientific guarantees.

## Assessment state, authorization and evidence ownership
- Use explicit versioned states: assessment definition `DRAFT -> REVIEWED -> PUBLISHED -> RETIRED`; booking `REQUESTED -> CONFIRMED -> ATTENDED | MISSED | CANCELLED`; session `CREATED -> IN_PROGRESS -> SUBMITTED -> AUTO_SCORED -> AWAITING_REVIEW -> FINALIZED | VOIDED`; appeals `OPEN -> UNDER_REVIEW -> UPHELD | CHANGED | REJECTED`. Every transition is guarded and audited; do not issue credentials on `SUBMITTED` or `AUTO_SCORED` alone.
- Introduce a **DBI-assigned evaluator capability** (`DBI_EVALUATOR` permission or per-assessment scoped grant) separate from a workspace `REVIEWER` role. Prevent graders from grading their own assessments or acting outside assigned venue/skill and record evaluator credential validity.
- For safety-critical rubrics, a failed mandatory laser, height, electrical or similar safety checkpoint **blocks verified certification regardless of average score**. Store rubric version, equipment calibration/evidence reference, assessor assignment, candidate acknowledgement, timestamp, venue and reviewer sign-off. The actual threshold belongs to an approved DBI/sector specialist rubric, not scenario text.
- Distinguish **assessment score** (per skill and rubric), **confidence** (strength of evidence), **proficiency** (normalized per skill only) and **issuance** (a separate issuer authorization). PLAN-0002 creates signed/verifiable issuer artifacts only after an authorized finalized event. Preserve unsuccessful attempts with appropriate retention rather than overwriting history.

## Threat model and candidate fairness
- Save answers by stable response IDs with idempotent upserts and server-based deadlines; client timers are display only. Maintain reconnect/resume behavior and explicit offline limits, without promising a fully offline secure exam.
- Question bank: versioned pools, reviewer approval, minimum coverage and controlled random seeds; return no answer keys before submission; keep evaluation explanations separate from confidential item contents.
- Browser focus-loss/tab-switch data are **weak signals**, never automatic proof of cheating. Publish a candidate privacy notice, minimize collection, maintain human-review evidence and support fair appeals/accommodations; do not require invasive biometric or webcam monitoring by default.
- Evaluator sign-off must be authenticated and bound to an immutable result digest; grade changes require a revision event and an independent authorized reviewer for high-impact decisions. Appeals cannot be reviewed solely by the original grader.

## Missing workflow contracts (proposed)
- `[ ]` `GET /api/v1/assessments/:id/slots` — physical lab slot availability and capacity (backed by DBI-operated venue/calendar data).
- `[ ]` `POST /api/v1/assessments/:id/bookings` — create a capacity-checked booking with idempotency key.
- `[ ]` `GET /api/v1/talent/assessment-bookings` — candidate booking and attendance history.
- `[ ]` `POST /api/v1/evaluator/sessions/:sessionId/finalize` — final authenticated safety and rubric sign-off; enforce evaluator scope and segregation of duties.
- `[ ]` `POST /api/v1/assessments/sessions/:sessionId/appeals` — canonical appeal route; treat original `/assessments/:sessionId/appeal` as a contract discrepancy to resolve **before** frontend integration, not an already deployed alias.
- `[ ]` `GET /api/v1/assessments/sessions/:sessionId/audit` — appropriate candidate/admin redacted history of status, review, appeal and finalization events.

## Acceptance tests and release gates
- `[ ]` Retrying answers/submission/booking after network interruption never doubles a session, booking, score event or credential.
- `[ ]` Missing evidence yields a prompt for assessment and no unjustified low skill rating. A safety-gate failure never produces a verified badge even when non-critical criteria score highly.
- `[ ]` Unassigned assessor, workspace reviewer, candidate, other tenant and expired evaluator credentials cannot grade or finalize sessions.
- `[ ]` Spoofed client timestamps, score payloads, focus switches, expired sessions and duplicate grade events do not bypass server scoring or appeal controls.
- `[ ]` All finalized signed outcomes are carried into PLAN-0002 with provenance and revocation support; PLAN-0004 reacts to the updated evidence instead of trusting client-provided scores.
- Release physical lab grading before expanding to simulated practical certifications; live safe operations require DBI evaluator and safety-policy approval.

---

# Pilot Scope (Target: Mon, 30 Nov 2026) & Trimmed Post-Pilot Features

To complete the end-to-end **30 November 2026 Pilot Demo** for PDBI (`Discover -> Assess -> Verify -> Match to Verified Employer`) without agent bloat, `PLAN-0003` is scoped to the slim deliverables below (**27–30 Nov 2026**), including one thin Pilot Employer Shortlist slice borrowed from `PLAN-0005` under `.agents/docs/CROSS_PLAN_CONTRACTS.md`.

### Lean Pilot Deliverables (IN Scope for 30 Nov 2026)
- **Backend (Jed)**:
  - **Slim SkillVerify Diagnostic & Evaluator Sign-Off**:
    - `GET /api/v1/assessments` — 2 seeded pilot telecom assessments (*Fibre Optic Splicing & OTDR Basics* and *RF / 5G RAN Fundamentals*).
    - `POST /api/v1/assessments/:id/start` & `POST /api/v1/assessments/sessions/:sessionId/submit` — timed MCQ diagnostic; passing theory sets the Passport skill to `DEMONSTRATED` with `PROVISIONAL` confidence (never `VERIFIED` on theory alone).
    - `GET /api/v1/assessments/sessions/:sessionId/result` — explainable sub-skill score breakdown.
    - `POST /api/v1/evaluator/sessions/:sessionId/grade` — requires explicit `DBI_EVALUATOR` assignment check + safety-critical pass/fail sign-off; promotes skill on Passport to `VERIFIED` tier, `VERIFIED` confidence, and `1.0–5.0` proficiency rating.
  - **Thin Pilot Opportunity & Employer Shortlist Loop** *(explicit Pilot slice from `PLAN-0005`)*:
    - `GET /api/v1/opportunities` & `POST /api/v1/opportunities` — only `VERIFIED` employer organizations can publish pilot jobs.
    - `POST /api/v1/opportunities/:id/apply` — free 1-click application with explicit candidate disclosure consent.
    - `GET /api/v1/employer/opportunities/:id/applicants` — verified employer views applicants and their verified Passport badges.
- **Frontend (Kate)**:
  - `/talent/assessments`, `/talent/assessments/[id]/take`, `/talent/assessments/[id]/result` — simple MCQ runner + explainable scorecard.
  - `/evaluator/dashboard` — simple 1-page assigned evaluator grading & safety-critical pass/fail sign-off form.
  - `/talent/opportunities` (list pilot jobs + free 1-click apply) & `/employer/jobs` (post pilot job + view applicants' verified Passports).

### Trimmed to `PLAN-0007` & Post-Pilot `PLAN-0005` (Agents MUST NOT build in Pilot)
- No fullscreen browser lock, focus-loss telemetry, or proctoring/webcam infrastructure.
- No interactive telecom simulation engines or work-sample file storage.
- No supervisor endorsements (`POST /api/v1/assessments/endorsements`) or physical campus calendar bookings (`slots`/`bookings`).
- No appeals queue (`/talent/assessments/[id]/appeal`, `/admin/assessments/appeals`).
- No full `PLAN-0005` Kanban boards, side-by-side comparison matrices, Expert Circle, or Sponsored Cohorts.

# Implementation progress — 2026-11-20 (Pilot Scope Trim)
- Trimmed `PLAN-0003` to a 4-day **Pilot target (Mon, 30 Nov 2026)** combining 2 seeded MCQ diagnostics, `DBI_EVALUATOR` safety-gated Passport verification sign-off, and a thin verified-employer job/free-apply shortlist slice so PDBI can see the full end-to-end value loop on November 30.
- Moved simulation engines, browser integrity telemetry, lab slot bookings, supervisor endorsements, and formal appeals queues to **`PLAN-0007`** (Post-Pilot). `PLAN-0003` remains `DRAFT (PILOT TARGET)`.
