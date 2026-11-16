# Plan id
PLAN-0004

# Title
CareerGPS Role Readiness, Interactive Competency Radar & LMS Bridge

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-10-31

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
  - **Role Benchmark Service**: Catalog of target roles, required skills, minimum competency thresholds, and importance weightings.
  - **Readiness Diagnostics Engine**: Algorithmic comparison yielding readiness percentage, categorized into:
    - *Ready* (85%+ match)
    - *Near-Ready* (60-84% match, short intervention)
    - *Needs Foundation* (<60% match).
  - **SkillBridge Course Recommender**: Maps missing skills to specific learning units, certifications, and DBI workshops.
  - **Moodle LMS Webhook & LTI Integration**: Syncs enrollments, grade achievements, and course completion certificates automatically into the user's Passport.

- **Endpoints**
  - `GET /api/v1/careergps/roles` - Browse available telecom and digital industry role benchmarks.
  - `GET /api/v1/careergps/roles/:id` - Detailed skill requirement matrix for a specific target role.
  - `POST /api/v1/careergps/diagnose` - Compute gap analysis between user passport and target role.
  - `POST /api/v1/careergps/target-role` - Set or update the user's active target dream role.
  - `GET /api/v1/careergps/learning-path` - Retrieve personalized learning recommendations for identified gaps.
  - `POST /api/v1/integrations/moodle/webhook` - Ingest course completion events from DBI Moodle LMS.
  - `GET /api/v1/learning/courses` - Search available DBI and accredited partner courses.

- **Implement in Phases**
  - **Phase 1: Role Benchmarks & Gap Calculation Engine (Weeks 1-2)**
    - Database models for `RoleBenchmark`, `RoleSkillRequirement`, `CandidateCareerTarget`.
    - Unit tests asserting readiness score math and gap identification logic.
  - **Phase 2: Moodle LMS Bridge & Webhooks (Weeks 3-4)**
    - Implement secure HMAC-signed Moodle webhook listener.
    - Automatic credential creation in `PassportModule` upon verified course completion.
  - **Phase 3: Learning Path Recommendation Engine (Weeks 5-6)**
    - Recommendation mapping linking missing taxonomy skills to learning courses.
    - Integration tests covering end-to-end course completion -> passport badge update -> readiness score recalculation.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Interactive CareerGPS Radar & Animated Career Map**: Signature UI components combining an interactive multi-axis skill radar, competency growth timeline, and an animated career node map showing progression milestones.
  - **Explainable AI Career Coach Drawer**: Conversational guidance widget providing explainable, transparent recommendations for closing readiness gaps.
  - **Role Discovery & Dream Job Picker**: Searchable role catalog with average salary insights, national demand indicators, and difficulty levels.
  - **Gap Breakdown Card**: Clear visual breakdown of "Skills You Have", "Skills to Improve", and "Skills to Acquire".
  - **SkillBridge Course Marketplace**: Curated view of courses specifically closing the user's identified gaps with one-click enrollment.

- **Sub Features**
  - Animated readiness gauge updating dynamically as users earn credentials.
  - Competency growth timeline visualizing verified milestones over time.
  - "Adjacent Careers" drawer showing alternative roles the user already qualifies for.
  - Direct single sign-on redirect link into DBI Moodle courses.

- **Pages**
  - `/talent/careergps` - Main CareerGPS hub with interactive radar and active dream-role progress.
  - `/talent/careergps/explore` - Explore roles, salary benchmarks, and industry demand.
  - `/talent/learning` - SkillBridge dashboard showing enrolled courses and recommended gap-closing training.

- **Implement in Phases**
  - **Phase 1: Interactive Radar Component & Visualization (Weeks 1-2)**
    - Build responsive, accessible SVG/Canvas Radar component conforming to design palette (`#10263B`, `#128F8A`, `#64DCD1`).
    - Component unit tests.
  - **Phase 2: Role Selection & Gap Breakdown Views (Weeks 3-4)**
    - Build role selector modals and skill gap breakdown cards.
  - **Phase 3: Learning Dashboard & LMS Integration (Weeks 5-6)**
    - Implement course recommendation cards and Moodle redirect handlers.

