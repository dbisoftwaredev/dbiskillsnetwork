# Plan id
PLAN-0005

# Title
OpportunityHub & Sponsored Workforce Development Cohort Exchange

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-10-31

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
  - **Opportunity Management Service**: Job and contract lifecycle (`DRAFT`, `PUBLISHED`, `PAUSED`, `CLOSED`), role requirements, location type (On-Site, Remote, Hybrid), and compensation structure.
  - **One-Click Passport Application Service**: Ingests job applications with snapshot copies of the candidate's verified passport at the time of application.
  - **Candidate-Job Match Scorer**: Calculates percentage match between candidate passport competencies and employer requirements.
  - **Expert Circle Network Engine**: Application, vetting, and authority profile management for senior engineers; handles employer-requested private introductions, paid advisory packages, and transparent DBI facilitation fee escrow.
  - **Sponsored Cohort Management Engine**: Pipeline tracker managing cohort budget, sponsor entity, target capacity, curriculum milestones, stipend disbursements, and placement metrics.
  - **Multi-Channel Engagement & WhatsApp Dispatcher**: Delivers user-requested job alerts, assessment reminders, and interview notifications via Email, SMS, and official WhatsApp Business API integration with strict opt-in suppression.

- **Endpoints**
  - `POST /api/v1/opportunities` - Employer creates a new job or project deployment posting.
  - `GET /api/v1/opportunities` - Search active job listings with skill matching filters.
  - `GET /api/v1/opportunities/:id` - Opportunity details and candidate match breakdown.
  - `POST /api/v1/opportunities/:id/apply` - Submit one-click application attaching Digital Skills Passport.
  - `GET /api/v1/employer/opportunities/:id/applicants` - List applicants with match scores and verified badges.
  - `PATCH /api/v1/employer/applications/:id/status` - Move candidate through hiring stages (Shortlisted, Interview, Offered, Hired).
  - `GET /api/v1/employer/candidates/compare` - Compare multiple shortlisted candidates side-by-side across verified competencies and readiness ratings.
  - `POST /api/v1/expert-circle/apply` - Senior practitioner applies for Expert Circle designation with evidence.
  - `GET /api/v1/expert-circle/experts` - Directory of verified Expert Circle members.
  - `POST /api/v1/expert-circle/advisory-request` - Employer initiates an advisory or paid mentoring request with transparent fee breakdown.
  - `POST /api/v1/cohorts` - Create a sponsored workforce development cohort.
  - `GET /api/v1/cohorts/:id` - Track cohort milestones, enrolled candidates, and graduation/hiring rates.
  - `POST /api/v1/cohorts/:id/enroll` - Enroll qualified or near-ready candidates into sponsored pipeline.
  - `POST /api/v1/notifications/whatsapp/webhook` - Inbound status listener for WhatsApp Business delivery confirmations.

- **Implement in Phases**
  - **Phase 1: Opportunity Marketplace & Application Flow (Weeks 1-2)**
    - Database models for `Opportunity`, `OpportunityRequirement`, `Application`, `ApplicationStage`.
    - Unit tests asserting application creation and matching logic.
  - **Phase 2: Employer Review & Candidate Pipeline (Weeks 3-4)**
    - Employer applicant kanban endpoints and status transitions.
    - Integration tests covering recruiter workflow and access guards.
  - **Phase 3: Sponsored Cohorts & Milestone Tracking (Weeks 5-6)**
    - Database models for `SponsoredCohort`, `CohortParticipant`, `CohortMilestone`.
    - Automated milestone completion webhooks and graduation placement reporting.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **OpportunityHub Job Discovery**: Clean, search-focused board displaying jobs with instant "Your Match Score" (e.g. *92% Match - Ready to Apply*).
  - **One-Click Application Modal**: Confirms passport details and privacy consent before instant submission.
  - **Employer Candidate Discovery, Kanban & Shortlist Comparison**: Split-screen candidate viewer with candidate side-by-side comparison matrix, verified passport summaries, match scores, and hiring stage drag-and-drop boards.
  - **Expert Circle Authority Directory & Booking**: Dedicated portal for discovering vetted senior specialists, booking advisory packages, and managing paid mentorship sessions.
  - **Sponsored Cohort Management Dashboard**: High-level sponsor portal showing budget spend, cohort progress bars, attendance, and job placement rates.

- **Sub Features**
  - WhatsApp and SMS alert opt-in preference toggles for urgent job matches and assessment reminders.
  - Filter jobs by telecom sub-sectors (Fiber, RF, Satellite, 5G Core, Cloud).
  - Notification badges for interview requests and application status updates.
  - Employer export of candidate shortlists into CSV/Excel.

- **Pages**
  - `/talent/opportunities` - Browse jobs, contracts, and gigs.
  - `/talent/applications` - Application status tracker for individual talent.
  - `/expert-circle` - Expert Circle directory and application page.
  - `/employer/jobs` - Employer job listings management.
  - `/employer/jobs/[id]/applicants` - Candidate review and pipeline management.
  - `/employer/shortlist/compare` - Candidate side-by-side comparison table.
  - `/employer/cohorts` - Sponsored workforce development programs.
  - `/employer/cohorts/[id]` - Detailed cohort milestone and placement tracker.

- **Implement in Phases**
  - **Phase 1: Opportunity Discovery & Talent Application UI (Weeks 1-2)**
    - Build job cards, filters, and one-click application modal.
  - **Phase 2: Employer Recruitment Hub & Candidate Pipeline (Weeks 3-4)**
    - Implement candidate table, verified badge visualizers, and stage progression controls.
  - **Phase 3: Sponsored Cohort Exchange Dashboard (Weeks 5-6)**
    - Build sponsor milestone tracking dashboard and cohort reporting views.

