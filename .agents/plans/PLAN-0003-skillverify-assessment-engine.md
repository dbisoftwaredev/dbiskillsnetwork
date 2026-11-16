# Plan id
PLAN-0003

# Title
SkillVerify Assessment Runner & Practical Telecom Lab Evaluation System

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-10-31

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
1. **Assessment Test Engine**: Secure, timed diagnostic test runner supporting multiple-choice, scenario-based questions, and coding/telecom calculations.
2. **Practical Lab & Supervised Evaluation Framework**: Standardized rubrics for physical DBI campus evaluations, workshop assessments, and proctor sign-offs.
3. **Multi-Factor Skill Scoring Engine**: Calculates domain-specific ratings (e.g. 4.3 / 5.0) that are explainable, transparent, and appealable (no single universal score).
4. **Anti-Cheating & Integrity Guard**: Tab-switching detection, randomized question pools, time-per-question limits, and evaluator identity signatures.

---

# For Backend API (`/backend` - NestJS Microservice-Ready)

- **Features**
  - **Assessment Catalog & Question Bank**: Tagged question repository mapped directly to Taxonomy skills and competency tiers.
  - **Exam Session State Machine**: Handles test commencement, countdown timers, randomized seed generation, auto-submission, and score computation.
  - **Practical Evaluation & Rubrics Service**: Multi-criteria grading rubrics for lab evaluators (e.g., Safety, Accuracy, Equipment Handling, Splice Quality).
  - **Competency Rating Calculator**: Weights diagnostic test scores and practical evaluations to issue verified skill stars (1.0 to 5.0) stored on the user's Passport.
  - **Explainability & Human-in-the-Loop Audit**: Ensures ratings are role- and skill-specific, completely explainable, with explicit evidence breakdowns. Prohibits black-box algorithmic disqualification.
  - **Appeal, Correction & Retake Workflow**: Formal administrative appeal mechanism allowing candidates to challenge evaluations, request human regrading, or re-test after cooldown.

- **Endpoints**
  - `GET /api/v1/assessments` - Browse available SkillVerify tests filtered by skill domain and level.
  - `POST /api/v1/assessments/:id/start` - Initiate timed assessment session and receive randomized question payload.
  - `POST /api/v1/assessments/sessions/:sessionId/answers` - Save progressive answer responses.
  - `POST /api/v1/assessments/sessions/:sessionId/submit` - Finalize test submission and trigger automated grading.
  - `GET /api/v1/assessments/sessions/:sessionId/result` - Retrieve detailed results, explainable score breakdown, and badge issuance.
  - `GET /api/v1/evaluator/rubrics/:assessmentId` - Fetch practical grading rubrics for supervised lab assessments.
  - `POST /api/v1/evaluator/sessions/:sessionId/grade` - Submit evaluator practical grades, comments, and digital signature.
  - `POST /api/v1/assessments/:sessionId/appeal` - Submit an appeal for assessment re-evaluation.
  - `GET /api/v1/admin/assessments/appeals` - DBI Admin/Reviewer endpoint for inspecting and resolving assessment appeals.

- **Implement in Phases**
  - **Phase 1: Question Bank & Session Engine (Weeks 1-2)**
    - Database models for `Assessment`, `Question`, `Option`, `ExamSession`, `ExamResponse`.
    - Unit tests verifying automated scoring algorithms and question randomization.
  - **Phase 2: Timed Session Runner & Anti-Cheat (Weeks 3-4)**
    - Implement session heartbeat, auto-submit timeout daemon, and response persistence.
    - Integration test suite for exam lifecycle and concurrency under load.
  - **Phase 3: Evaluator Rubrics & Score Ingestion to Passport (Weeks 5-6)**
    - Build evaluator scoring endpoints and RBAC guards (`DBI_EVALUATOR`).
    - Event bus emitter notifying `PassportModule` to record verified skill badges upon passing score.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **SkillVerify Assessment Center**: Clean, responsive test catalog displaying test duration, prerequisites, and verified badge previews.
  - **Distraction-Free Exam Room**: High-focus testing interface with live countdown timer, question navigation drawer, review flags, and progress bar.
  - **Evaluator Practical Grading Tablet Portal**: Touch-optimized interface for DBI lab evaluators to score hands-on performance against rubrics with one-click toggles.
  - **Exam Results & Performance Diagnostic**: Visual score breakdown by competency sub-skills with clear next-step recommendations.

- **Sub Features**
  - Browser fullscreen and focus-loss warning alerts.
  - Auto-save indicator ensuring answers are preserved across network interruptions.
  - Instant badge animation upon achieving passing verified status.

- **Pages**
  - `/talent/assessments` - Assessment catalog and active test bookings.
  - `/talent/assessments/[id]/take` - Distraction-free exam room.
  - `/talent/assessments/[id]/result` - Comprehensive test scorecard with explainable rating breakdown, appeals button, and passport badge link.
  - `/talent/assessments/[id]/appeal` - Formal score appeal and explanation submission form.
  - `/evaluator/dashboard` - Evaluator queue of practical candidate sessions.
  - `/evaluator/grade/[sessionId]` - Touch-friendly rubrics grading sheet.
  - `/admin/assessments/appeals` - DBI administrative panel for human-in-the-loop review of appeals.

- **Implement in Phases**
  - **Phase 1: Assessment Catalog & UI Cards (Weeks 1-2)**
    - Build test card components, prerequisite indicators, and booking modals.
  - **Phase 2: Exam Room Interface (Weeks 3-4)**
    - Implement full-screen test runner, timer hooks, and auto-submit triggers.
    - Component integration tests with React Testing Library.
  - **Phase 3: Evaluator Portal & Result Views (Weeks 5-6)**
    - Build the evaluator grading rubrics interface and result celebration view.

