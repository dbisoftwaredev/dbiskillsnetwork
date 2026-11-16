# Plan id
PLAN-0006

# Title
WorkforceIQ Macro Labor Intelligence & Sectoral Workforce Atlas

# Status
DRAFT

# Created at
2026-10-31

# Updated at
2026-10-31

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
1. **Sectoral Workforce Atlas**: High-density interactive geographic heatmap displaying skills supply, training capacity, and regional talent distribution across Nigeria.
2. **Privacy-Preserving Aggregator Engine**: Pre-computed statistical aggregates with dynamic k-anonymity suppression (k=10 threshold) ensuring complete NDPA compliance and zero individual profiling exposure.
3. **Macro Skills Gap & Industry Supply Index**: Tracks emerging demand trends across telecom domains (5G, Satellite, Cyber, Fiber) comparing job postings to qualified labor supply.
4. **Institutional Donor & Government Portals**: Dedicated high-level dashboards for development financiers, regulators (NCC), and ministries to monitor workforce investments and verified outcomes.
5. **B2B Intelligence APIs & Enterprise Licensing**: Secure, rate-limited APIs for corporate subscribers, researchers, and government agencies.

---

# For Backend API (`/backend` - NestJS Microservice Candidate)

- **Features**
  - **Analytics Aggregation Pipeline**: Nightly scheduled materialized rollups calculating skill supply by state, local government area (LGA), competency level, and industry.
  - **NDPA k-Anonymity & Differential Privacy Engine**: Automatically suppresses or masks any query results where cell size is less than the defined safety threshold (k = 10).
  - **Macro Skills Index Service**: Calculates national supply-versus-demand ratios, skill velocity, and average time-to-hire across sectors.
  - **B2B Licensed Partner API**: API key authentication, tiered rate-limiting, and auditable data access logs for enterprise and government subscribers.
  - **Executive Report Generator**: Generates high-resolution PDF/Excel institutional reports with executive summaries and data visual charts.

- **Endpoints**
  - `GET /api/v1/workforceiq/overview` - High-level national metrics (total verified talent, top shortage areas, active training cohorts).
  - `GET /api/v1/workforceiq/geo-density` - Geographic distribution of verified competencies grouped by State and Geopolitical Zone.
  - `GET /api/v1/workforceiq/skill-shortages` - Industry deficit report comparing open vacancies against qualified candidate supply.
  - `GET /api/v1/workforceiq/training-outcomes` - Longitudinal training ROI tracking employment conversion rates by institution/program.
  - `POST /api/v1/workforceiq/reports/export` - Request asynchronous generation of institutional PDF/CSV labor market report.
  - `GET /api/v1/b2b/v1/skills-index` - Dedicated authenticated B2B partner feed for licensed enterprise clients.

- **Implement in Phases**
  - **Phase 1: Materialized Rollups & Privacy Engine (Weeks 1-2)**
    - Implement aggregation tables and cron-based background aggregation jobs in Redis/PostgreSQL.
    - Build k-anonymity filter middleware and unit tests asserting that small cohorts are properly masked.
  - **Phase 2: Geographic & Shortage APIs (Weeks 3-4)**
    - Implement GeoJSON endpoints for Nigerian states and regional talent distributions.
    - Build demand vs. supply index calculations.
  - **Phase 3: B2B Licensing, API Keys & PDF Reports (Weeks 5-6)**
    - Implement B2B API key provisioning and rate-limit metering.
    - Automated report generation service for institutional partners.

---

# For Frontend (`/frontend` - Next.js)

- **Features**
  - **Sectoral Workforce Atlas**: Interactive map of Nigeria featuring drill-downs from national level to state/zone level with color-coded talent density.
  - **Executive Macro Dashboard**: High-density analytics portal featuring Midnight Navy (`#10263B`) cards, Ocean Teal (`#128F8A`) trend lines, and Electric Mint (`#64DCD1`) highlights.
  - **Skill Shortage Index Visualizer**: Bar charts and gap indicators comparing telecom operator job postings against available verified talent.
  - **Institutional Report Builder**: Custom date range, regional filter, and sector selector with live chart previews and one-click PDF/CSV export.

- **Sub Features**
  - Responsive charts powered by Recharts or Chart.js with dark/light executive themes.
  - Filter by verified rating tiers (e.g. show only candidates with 4.0+ ratings).
  - Fully accessible tooltips with clear data definitions for non-technical policymakers.

- **Pages**
  - `/analytics/workforceiq` - Institutional intelligence home and key metrics overview.
  - `/analytics/atlas` - Full-screen Sectoral Workforce Atlas geographic visualization.
  - `/analytics/shortages` - National skill deficit and talent pipeline analysis.
  - `/portal/donor-government` - Dedicated executive portal for government ministries, regulators (NCC), and development partners.
  - `/analytics/reports` - Export center for government and donor milestone reports.

- **Implement in Phases**
  - **Phase 1: Macro Charts & Executive Dashboard Layout (Weeks 1-2)**
    - Build dashboard grid, summary metric cards, and responsive chart containers.
  - **Phase 2: Sectoral Workforce Atlas Geospatial Map (Weeks 3-4)**
    - Integrate Nigerian state map SVG/GeoJSON with interactive click and hover states.
  - **Phase 3: Report Generator & Polish (Weeks 5-6)**
    - Build custom report filter drawer and export triggers.
    - Final UX polish and high-resolution print stylesheet testing.

