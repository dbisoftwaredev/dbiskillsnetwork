# Plan id
PLAN-0003

# Title
SkillVerify Assessment Runner & Practical Telecom Lab Evaluation System

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-11-16

# Owner
JED

# Related plan
PLAN-0001 (Auth & Orgs), PLAN-0002 (Skills Passport)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`AssessmentModule`, `EvaluationModule`, `ProctoringModule`)
- Frontend: `/frontend` (`/talent/assessments`, `/evaluator/grading`)
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
3. Engr. Fatima opens the **DBI Evaluator Portal** on her tablet, grades Chinedu’s splice loss reading (0.02 dB - within acceptable limits), inspects his fiber cleave angle, and signs off on the practical rubrics with an evaluator signature.
4. Chinedu's Digital Skills Passport immediately updates with an authenticated **4.6/5 Star Verified Telecom Skill Rating** and an official DBI digital credential badge. MainOne recruiters can now shortlist Chinedu with complete confidence.

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
    - Build evaluator scoring endpoints, safety-critical sign-off checks, and RBAC guards (`DBI_ADMIN`, `REVIEWER`).
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
  - Instant badge animation upon achieving passing verified status.

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

