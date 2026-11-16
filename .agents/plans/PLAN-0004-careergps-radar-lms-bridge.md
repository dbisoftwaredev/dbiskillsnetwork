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
5. Zainab enrolls with one click. Upon finishing the Moodle course, her grades automatically sync back to DBI Skills Network, her readiness jumps to **84%**, and she is immediately highlighted to hiring telecom operators looking for entry-level 5G engineers.

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
  - **Moodle LMS Webhook & LTI Integration (Strategy Section 16)**: Syncs enrollments, grade achievements, and course completion records from DBI's existing Moodle LMS directly into the user's Passport without rebuilding a custom LMS.

- **Endpoints**
  - `[ ]` `GET /api/v1/careergps/roles` - Browse available telecom and digital industry role benchmarks across the 6 core pathways.
  - `[ ]` `GET /api/v1/careergps/roles/:id` - Detailed skill requirement matrix and weighting breakdown for a specific target role.
  - `[ ]` `POST /api/v1/careergps/diagnose` - Compute explainable gap analysis and factor-by-factor suitability breakdown between user passport and target role.
  - `[ ]` `GET /api/v1/careergps/adjacent-roles` - Retrieve adjacent career roles that match the candidate's current verified skills.
  - `[ ]` `POST /api/v1/careergps/target-role` - Set or update the user's active target dream role.
  - `[ ]` `GET /api/v1/careergps/learning-path` - Retrieve personalized SkillBridge recommendations (courses, labs, mentorship, certifications, sponsored cohorts) for identified gaps.
  - `[ ]` `POST /api/v1/careergps/coach/recommendations` - Retrieve explainable AI Career Coach next-action guidance with deterministic evidence citations.
  - `[ ]` `POST /api/v1/integrations/moodle/webhook` - Ingest HMAC-signed course completion events from DBI Moodle LMS.
  - `[ ]` `GET /api/v1/learning/courses` - Search available DBI Moodle and accredited partner courses, labs, and certification tracks.

- **Implement in Phases**
  - **Phase 1: Role Benchmarks, Configurable Weights & Gap Calculation Engine (Weeks 1-2)**
    - Implement Drizzle ORM schemas (`backend/src/schema.ts`) and migrations for `role_benchmarks`, `role_skill_requirements`, `candidate_career_targets`, and `learning_resources`.
    - Unit tests (`node --test`) asserting configurable multi-factor readiness math (40/20/15/10/10/5 default weights), missing-evidence prompts, and adjacent role matching.
  - **Phase 2: Moodle LMS Bridge & Webhooks (Weeks 3-4)**
    - Implement secure HMAC-signed Moodle webhook listener.
    - Automatic learning achievement recording in `PassportModule` and readiness recalculation upon verified course completion.
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

