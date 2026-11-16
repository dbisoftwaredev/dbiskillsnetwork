# Plan id
PLAN-0006

# Title
WorkforceIQ Macro Labor Intelligence & Sectoral Workforce Atlas

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-11-16

# Owner
JED

# Related plan
PLAN-0001 through PLAN-0005 (Consumes aggregated data across all engines)

# Affected repos
c:\laragon\www\dbiskillsnetwork
- Backend: `/backend` (`WorkforceIqModule`, `AnalyticsAggregationModule`, `IntelligenceApiModule`)
- Frontend: `/frontend` (`/analytics/workforceiq`, `/analytics/atlas`, `/admin/reports`)
- Shared Specs / Contracts: `.agents` (Plans, Tests, OpenAPI schemas)

# Approval
status: DRAFT approved_by: "" approved_at: ""

---

# Scenario / Example (Real or Fictional)

**The Scenario: The Nigerian Communications Commission (NCC) & National Broadband Strategy**

The Federal Ministry of Communications, Innovation and Digital Economy and the Nigerian Communications Commission (NCC) are planning a nationwide broadband initiative requiring 25,000 certified technicians across all 36 states and the FCT. Before committing ₦15 billion in public infrastructure subsidies, policymakers and development partners need objective data:
- Where are certified telecom technicians concentrated?
- Which states face severe deficits in fiber splicers or mast maintenance riggers?
- How effective are regional DBI training centers in turning youth into employable technicians?

Crucially, this intelligence must respect citizen privacy under the Nigeria Data Protection Act (NDPA)—policymakers must never see individual personal phone numbers, addresses, or private profiles.

**How This Plan Fixes It:**
1. NCC and development finance partners log into the **WorkforceIQ & Sectoral Workforce Atlas**.
2. An interactive 3D/2D Nigerian geospatial map visualizes talent density across geo-political zones:
   - Green areas (e.g. Lagos, Abuja, Rivers) show high concentrations of RF and Cloud engineers.
   - Amber/Red areas (e.g. Taraba, Kebbi) highlight acute shortages in certified fiber technicians.
3. The **WorkforceIQ Privacy Guard** enforces strict k-anonymity (suppressing any cohort with fewer than 10 individuals) to prevent re-identification.
4. Policymakers export aggregated, verifiable reports to allocate training subsidies directly where the deficit is greatest, and track real post-training employment conversion.

---

# Summary

PLAN-0006 implements **WorkforceIQ**, the institutional, regulatory, and B2B labor intelligence engine of the DBI Skills Network.

It delivers:
1. **Sectoral Workforce Atlas (Strategy Section 18)**: High-density interactive geographic heatmap displaying verified skills supply, training capacity, and regional talent distribution across Nigeria's 36 states, the FCT, and 6 geopolitical zones.
2. **Privacy-Preserving Aggregator Engine (Strategy Section 17)**: Pre-computed statistical aggregates with dynamic k-anonymity suppression ($k \ge 10$ minimum cell threshold) and cross-slice suppression ensuring complete NDPA compliance and zero individual profiling exposure.
3. **Macro Skills Gap & Industry Supply Index**: Tracks emerging demand trends across the 6 core telecom/ICT pathways (RF/RAN & 4G/5G, Fibre & Transmission, IP/NOC, Field Deployment & Power, Cybersecurity/Cloud, Network Automation & Applied AI) comparing employer vacancies to verified labor supply.
4. **Government, Donor & DBI Operations Cockpits (Strategy Section 8)**:
   - **Government Cockpit**: Aggregate skills distribution maps, regional shortages, cohort outcomes, and privacy-safe exports.
   - **Donor / NGO Cockpit**: Programme design, eligibility targeting, funding milestones, beneficiary progress, and auditable training-to-employment impact reporting.
   - **DBI Operations Cockpit**: Role taxonomy governance, assessment bank oversight, credential issuance audit, moderation, employer contracts, campaigns, and KPI tracking across all 8 dimensions in Strategy Section 20.
5. **B2B Intelligence APIs & Institutional Licensing**: Secure, rate-limited, auditable APIs for licensed enterprise subscribers, regulators, and research partners.

---

# For Backend API (`/backend` - NestJS Microservice Candidate)

- **Features**
  - **Analytics Aggregation Pipeline**: Scheduled materialized rollups calculating verified vs. declared skill supply by state, geopolitical zone, occupation pathway, competency level, and evidence confidence.
  - **NDPA k-Anonymity & Cross-Slice Suppression Engine (Strategy Section 17)**: Automatically suppresses or masks any query results or multi-dimensional slices where cell count is below the safety threshold ($k = 10$).
  - **Macro Skills Index & KPI Engine (Strategy Section 20)**: Computes national supply-versus-demand ratios, measured competency gains after interventions, shortlist yield, time-to-hire, placement conversion, and 30/90-day retention metrics.
  - **DBI Operations Governance API**: Back-office endpoints for managing taxonomy updates, credential audit trails, campaign performance, and institutional licensing contracts.
  - **B2B Licensed Partner API**: Scoped API key authentication, tiered rate-limiting, and auditable data access logs for licensed institutional clients.
  - **Executive Report Generator**: Generates privacy-safe PDF/CSV institutional reports with executive summaries and k-anonymity verification stamps.

- **Endpoints**
  - `[ ]` `GET /api/v1/workforceiq/overview` - High-level national metrics (verified talent supply, top shortage areas, active sponsored cohorts, and Section 20 KPI summary).
  - `[ ]` `GET /api/v1/workforceiq/geo-density` - Geographic distribution of verified competencies grouped by State and Geopolitical Zone (with $k \ge 10$ suppression).
  - `[ ]` `GET /api/v1/workforceiq/skill-shortages` - Sectoral deficit report comparing open employer vacancies against verified and near-ready candidate supply.
  - `[ ]` `GET /api/v1/workforceiq/training-outcomes` - Longitudinal training-to-employment ROI tracking competency gains and placement conversion rates by programme/cohort.
  - `[ ]` `GET /api/v1/admin/operations/cockpit` - DBI Operations Cockpit summary covering taxonomy health, assessment bank metrics, credential issuance audits, and active institutional contracts.
  - `[ ]` `POST /api/v1/workforceiq/reports/export` - Generate privacy-safe institutional PDF/CSV labor market and donor milestone reports.
  - `[ ]` `GET /api/v1/b2b/v1/skills-index` - Dedicated authenticated B2B partner feed for licensed enterprise and government subscribers.

- **Implement in Phases**
  - **Phase 1: Materialized Rollups, Drizzle Schemas & k-Anonymity Engine (Weeks 1-2)**
    - Implement Drizzle ORM schemas (`backend/src/schema.ts`) and migrations for `workforce_aggregates`, `institutional_licenses`, `b2b_api_keys`, and `report_exports`.
    - Build k-anonymity suppression guard ($k \ge 10$) and unit tests (`node --test`) asserting that small cells and complementary slices are masked.
  - **Phase 2: Geographic Density, Shortage Index & DBI Operations APIs (Weeks 3-4)**
    - Implement GeoJSON/state distribution endpoints, demand-vs-supply index calculations, and DBI Operations Cockpit endpoints.
  - **Phase 3: Institutional Portals, B2B API Keys & Privacy-Safe Exports (Weeks 5-6)**
    - Implement B2B API key provisioning, rate-limit metering, and privacy-safe PDF/CSV report generation for government and donor partners.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Sectoral Workforce Atlas (`/analytics/atlas`)**: Interactive map of Nigeria featuring drill-downs from national level to geopolitical zone and state level with color-coded talent density and shortage alerts.
  - **Executive Macro Dashboard (`/analytics/workforceiq`)**: High-density analytics portal featuring Midnight Navy (`#10263B`) cards, Ocean Teal (`#128F8A`) trend lines, Electric Mint (`#64DCD1`) highlights, and Warm Gold (`#D9AB60`) alerts.
  - **Government & Donor Cockpits (`/portal/donor-government` — Strategy Section 8)**: Dedicated views for regulators (NCC) and ministries to inspect aggregate regional gaps, and for donors/NGOs to design funded cohorts, monitor milestones, and audit verified training-to-employment outcomes.
  - **DBI Operations Cockpit (`/admin/operations` — Strategy Section 8)**: Internal operations command centre for role taxonomy management, assessment bank health, credential issuance moderation, employer contracts, and audit trails.
  - **Institutional Report Builder (`/analytics/reports`)**: Custom date range, regional filter, and telecom pathway selector with live chart previews and one-click privacy-safe PDF/CSV export.

- **Sub Features**
  - Filter analytics by verification tier (Verified vs. Demonstrated vs. Declared) and occupation pathway.
  - Explicit visual indicator when a regional slice is masked due to NDPA k-anonymity ($k < 10$) privacy protection.
  - Accessible data tables and tooltips with clear definitions for non-technical policymakers.

- **Pages**
  - `[ ]` `/analytics/workforceiq` - Institutional intelligence home and national supply/demand overview.
  - `[ ]` `/analytics/atlas` - Full-screen Sectoral Workforce Atlas geographic visualization.
  - `[ ]` `/analytics/shortages` - National skill deficit and talent pipeline analysis.
  - `[ ]` `/portal/donor-government` - Dedicated executive cockpit for government ministries, regulators (NCC), and development finance / NGO partners.
  - `[ ]` `/admin/operations` - DBI Operations Cockpit for platform governance, moderation, contracts, and KPI monitoring.
  - `[ ]` `/analytics/reports` - Export center for privacy-safe government and donor milestone reports.

- **Implement in Phases**
  - **Phase 1: Macro Charts, KPI Cards & Executive Dashboard Layout (Weeks 1-2)**
    - Build dashboard grid, Section 20 KPI summary cards, and accessible chart/table containers.
  - **Phase 2: Sectoral Workforce Atlas, Government/Donor & DBI Operations Cockpits (Weeks 3-4)**
    - Integrate Nigerian state/zone interactive map SVG/GeoJSON with k-anonymity masking states, plus `/portal/donor-government` and `/admin/operations`.
    - Automated unit and Playwright browser tests.
  - **Phase 3: Institutional Report Generator & Print Polish (Weeks 5-6)**
    - Build custom report filter drawer, CSV/PDF export triggers, and high-resolution print stylesheets.

# Implementation progress — 2026-11-16 (Strategy & Architecture Alignment)
- Aligned `PLAN-0006` with `DBI_Skills_Network_Illustrated_Product_Strategy.txt` (Sections 3, 4, 8, 17, 18, 20, and Appendix A–B) and the Drizzle ORM / NestJS / Next.js stack:
  - Added distinct coverage for the **Government Cockpit**, **Donor/NGO Cockpit**, and **DBI Operations Cockpit** (`/admin/operations`) as defined in Strategy Section 8.
  - Added the 8 strategic KPI dimensions from Strategy Section 20 (supply quality, verified capability, competency gains, shortlist yield/time-to-hire, placement outcomes, revenue quality, 30/90-day retention, and privacy-safe regional outcomes) and reinforced $k \ge 10$ cell and cross-slice suppression.

