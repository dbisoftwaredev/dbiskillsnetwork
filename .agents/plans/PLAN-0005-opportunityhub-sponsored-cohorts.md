# Plan id
PLAN-0005

# Title
OpportunityHub & Sponsored Workforce Development Cohort Exchange

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-11-16

# Owner
JED

# Related plan
PLAN-0001 (Auth & Orgs), PLAN-0002 (Skills Passport), PLAN-0003 (SkillVerify), PLAN-0004 (CareerGPS)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`OpportunityModule`, `ApplicationModule`, `SponsorshipModule`, `ExpertCircleModule`)
- Frontend: `/frontend` (`/talent/opportunities`, `/employer/jobs`, `/employer/cohorts`)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: MTN Nigeria's 100-Engineer 5G Rollout Cohort & Ibrahim's Direct Placement**

MTN Nigeria plans to roll out 5G base stations across 8 northern states and needs 100 field-tested transmission technicians within 90 days. Traditional recruitment through public job ads will take 6 months and produce mostly unqualified applicants.

Instead, MTN logs into **OpportunityHub & Sponsored Workforce Development Exchange**:
1. MTN posts a **Sponsored Workforce Cohort**: Budget = ₦40,000,000; Target = 100 technicians in Kaduna, Kano, and Abuja.
2. The platform instantly scans the Talent Registry and groups candidates:
   - 35 candidates are **Job-Ready** (verified rating > 4.0).
   - 45 candidates are **Near-Ready** (need a 2-week microwave alignment workshop).
   - 20 candidates need deeper 6-week training.
3. MTN sponsors the 2-week workshop through DBI for the 45 near-ready candidates, including Ibrahim from Zaria.
4. Ibrahim completes the training, passes the SkillVerify lab test, and his readiness score hits 92%.
5. MTN's HR team opens their **OpportunityHub Shortlist**, reviews Ibrahim’s verified passport, and issues an employment contract through the platform with one click. MTN fills all 100 spots on schedule.

---

# Summary

PLAN-0005 implements **OpportunityHub** and the **Sponsored Workforce Development Exchange**, the primary commercial engine connecting talent to paid opportunities and providing enterprises/donors with structured cohort training pipelines.

It delivers:
1. **OpportunityHub Job & Contract Marketplace**: Full-time jobs, field deployments, contracts, internships, and transparent placement tracking.
2. **One-Click Verified Passport Applications**: Enables talent to apply instantly with their tamper-evident Digital Skills Passport.
3. **Expert Circle Network & Monetization**: Differentiated elite network for senior telecom engineers, cybersecurity architects, and technical trainers with verified expert directory, private corporate introductions, paid mentoring, advisory packages, and transparent DBI facilitation fee management.
4. **Sponsored Cohort Exchange**: Corporate and donor program management to fund candidate upskilling, track cohort milestone progress, and convert graduates into hires.
5. **Multi-Channel Candidate Alert Engine**: User-requested transactional notifications and vacancy alerts via email, SMS, and approved WhatsApp integrations.
6. **Employer Candidate Shortlist & Comparison Engine**: Multi-criteria talent discovery with side-by-side candidate comparison matrix.

---

# For Backend API (`/backend` - NestJS)

- **Features**
  - **Opportunity Management Service (Strategy Section 4 & Appendix B)**: Manages full-time employment, contracts, internships, field deployments, projects, consultancy, and digital task assignments (`DRAFT`, `PUBLISHED`, `PAUSED`, `CLOSED`). Enforces the commercial safeguard from Appendix B: **talent never pay to apply or be considered for recruitment, and paid services never alter candidate suitability rankings**.
  - **One-Click Passport Application & Availability Service**: Ingests job applications with immutable snapshot references to the candidate's verified passport at the time of application and respects candidate availability controls.
  - **Explainable Candidate-Job Suitability Scorer**: Calculates role-specific suitability percentages and evidence confidence breakdowns between candidate passport competencies and employer requirements, while keeping final hiring decisions with accountable human employers.
  - **Employer Cockpit & Assessment Request Engine (Strategy Section 8)**: Enables verified employers to search talent, compare shortlisted candidates side-by-side, request targeted SkillVerify assessments for applicants, send opt-in outreach, and record placement/hire outcomes.
  - **Expert Circle Network Engine (Strategy Section 12)**: Evidence-based vetting and review workflow for senior engineers, architects, trainers, and consultants (designation requires credible evidence and review, never payment alone); manages advisory invitations, paid mentoring, technical assessment delivery, expert availability controls, and transparent DBI facilitation fees.
  - **Sponsored Cohort Management Engine (Strategy Section 13)**: Pipeline tracker grouping candidates into *Ready*, *Near-Ready*, and *Needs Deeper Development* tiers; manages sponsor eligibility criteria, budget milestones, funded training/assessment progression, and audited placement outcomes.
  - **Multi-Channel Engagement & WhatsApp Dispatcher (Strategy Section 14)**: Delivers user-requested vacancy alerts, assessment reminders, and interview notifications via Email, SMS, In-App, and approved WhatsApp Business integrations—strictly honoring `PLAN-0001` transactional vs. marketing separation, frequency preferences, and non-profiling rules.

- **Endpoints**
  - `[ ]` `POST /api/v1/opportunities` - Verified employer creates a new job, contract, internship, field deployment, or consultancy posting.
  - `[ ]` `GET /api/v1/opportunities` - Search active opportunities with occupation, location, type, and skill-suitability filters.
  - `[ ]` `GET /api/v1/opportunities/:id` - Opportunity details and explainable candidate suitability breakdown.
  - `[ ]` `POST /api/v1/opportunities/:id/apply` - Free one-click application attaching Digital Skills Passport snapshot.
  - `[ ]` `GET /api/v1/employer/candidates/search` - Verified employer search across opted-in talent profiles filtered by verified competencies, region, and availability.
  - `[ ]` `GET /api/v1/employer/opportunities/:id/applicants` - List applicants with suitability breakdowns, evidence confidence, and verified badges.
  - `[ ]` `PATCH /api/v1/employer/applications/:id/status` - Move candidate through hiring stages (`SHORTLISTED`, `ASSESSMENT_REQUESTED`, `INTERVIEW`, `OFFERED`, `HIRED`, `NOT_SELECTED`) with transparent reason codes.
  - `[ ]` `POST /api/v1/employer/applications/:id/request-assessment` - Prompt a candidate to complete a specific SkillVerify assessment for missing role evidence.
  - `[ ]` `GET /api/v1/employer/candidates/compare` - Compare multiple shortlisted candidates side-by-side across verified competencies, work samples, and readiness ratings.
  - `[ ]` `POST /api/v1/expert-circle/apply` - Senior practitioner applies for Expert Circle designation with verifiable portfolio/credential evidence.
  - `[ ]` `PATCH /api/v1/admin/expert-circle/:applicationId/decide` - DBI panel review and approval/rejection of Expert Circle designation.
  - `[ ]` `GET /api/v1/expert-circle/experts` - Directory of vetted Expert Circle members respecting expert availability controls.
  - `[ ]` `POST /api/v1/expert-circle/advisory-request` - Employer/institution initiates an advisory, audit, training, or paid mentoring request with transparent DBI facilitation fee breakdown.
  - `[ ]` `POST /api/v1/cohorts` - Employer, donor, or government sponsor creates a sponsored workforce development cohort.
  - `[ ]` `GET /api/v1/cohorts/:id` - Track cohort candidate segmentation (*Ready*, *Near-Ready*, *Foundation*), milestones, and graduation/hiring rates.
  - `[ ]` `POST /api/v1/cohorts/:id/enroll` - Enroll qualified or near-ready candidates into a sponsored training-to-employment pipeline.
  - `[ ]` `POST /api/v1/notifications/whatsapp/webhook` - Inbound status listener for WhatsApp Business delivery confirmations.

- **Implement in Phases**
  - **Phase 1: Opportunity Marketplace, Free Application Flow & Drizzle Schemas (Weeks 1-2)**
    - Implement Drizzle ORM schemas (`backend/src/schema.ts`) and migrations for `opportunities`, `opportunity_requirements`, `applications`, `expert_circle_profiles`, `advisory_requests`, `sponsored_cohorts`, and `cohort_participants`.
    - Unit tests (`node --test`) asserting application creation, candidate availability filtering, and explainable suitability matching.
  - **Phase 2: Employer Cockpit, Candidate Comparison & Expert Circle Vetting (Weeks 3-4)**
    - Implement employer candidate search, side-by-side comparison, assessment request triggers, and Expert Circle evidence-vetting endpoints.
    - Integration tests covering verified-organization guards and NDPA opt-in visibility enforcement.
  - **Phase 3: Sponsored Cohorts, Placement Tracking & Multi-Channel Alerts (Weeks 5-6)**
    - Implement cohort segmentation (*Ready* / *Near-Ready* / *Foundation*), milestone tracking, placement outcome recording, and notification dispatchers.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **OpportunityHub Discovery Board**: Search-focused marketplace for jobs, field deployments, internships, and contracts displaying explainable role suitability (e.g. *86% Match for Field Deployment Supervisor*) and missing-evidence prompts.
  - **One-Click Free Application Modal**: Confirms passport snapshot, availability, and NDPA visibility consent before instant submission.
  - **Employer Cockpit, Kanban & Premium Shortlist Comparison (Strategy Sections 8 & 18)**: Desktop-optimized recruitment workspace with verified talent search, side-by-side candidate comparison matrix, assessment request triggers, and hire outcome tracking.
  - **Expert Circle Authority Directory & Engagement Portal (Strategy Section 12)**: Dedicated portal for discovering vetted senior specialists, submitting evidence-backed membership applications, controlling expert availability, and booking advisory/mentoring engagements.
  - **Sponsored Cohort Management Dashboard (Strategy Section 13)**: Sponsor and DBI operations portal showing candidate readiness segmentation (*Ready*, *Near-Ready*, *Foundation*), funding milestones, training progression, and post-training placement conversion.

- **Sub Features**
  - Candidate availability status toggle (`Available for Immediate Deployment`, `Open to Offers`, `Unavailable`) and alert frequency controls.
  - Filter opportunities by the 6 telecom/ICT sub-sectors, contract type, and Nigerian state/region.
  - Employer export of opted-in shortlisted candidate summaries.

- **Pages**
  - `[ ]` `/talent/opportunities` - Browse jobs, field deployments, internships, contracts, and consultancy projects.
  - `[ ]` `/talent/applications` - Application status, assessment requests, and interview tracker for individual talent.
  - `[ ]` `/expert-circle` - Expert Circle directory, availability controls, and evidence-backed application page.
  - `[ ]` `/employer/cockpit` - Employer recruitment command centre (vacancies, verified candidate search, outreach, and hire outcomes).
  - `[ ]` `/employer/jobs` - Employer opportunity listings management.
  - `[ ]` `/employer/jobs/[id]/applicants` - Candidate review, assessment request modal, and stage pipeline management.
  - `[ ]` `/employer/shortlist/compare` - Premium side-by-side candidate comparison matrix.
  - `[ ]` `/employer/cohorts` - Sponsored workforce development programmes.
  - `[ ]` `/employer/cohorts/[id]` - Detailed cohort readiness breakdown, milestone, and placement tracker.

- **Implement in Phases**
  - **Phase 1: Opportunity Discovery & Talent Application UI (Weeks 1-2)**
    - Build opportunity cards, suitability breakdown badges, filters, and one-click application modal.
  - **Phase 2: Employer Cockpit, Candidate Comparison & Expert Circle UI (Weeks 3-4)**
    - Implement `/employer/cockpit`, `/employer/shortlist/compare`, assessment request modals, and `/expert-circle`.
    - Automated unit and Playwright browser tests.
  - **Phase 3: Sponsored Cohort Exchange Dashboard (Weeks 5-6)**
    - Build sponsor cohort segmentation, milestone tracking dashboard, and placement outcome views.

# Implementation progress — 2026-11-16 (Strategy & Architecture Alignment)
- Aligned `PLAN-0005` with `DBI_Skills_Network_Illustrated_Product_Strategy.txt` (Sections 4, 8, 12, 13, 14, 18, and Appendix A–B) and the Drizzle ORM / NestJS / Next.js stack:
  - Added Employer Cockpit (`/employer/cockpit`) capabilities: verified talent search, custom assessment requests for applicants, and hire outcome tracking.
  - Enforced Appendix B & Section 12 rules: candidates never pay to apply or be ranked, and Expert Circle designation requires evidence-based vetting rather than payment alone.
  - Added Sponsored Cohort readiness segmentation (*Ready*, *Near-Ready*, *Foundation*) and strict alignment with `PLAN-0001` notification consent and frequency preferences.

