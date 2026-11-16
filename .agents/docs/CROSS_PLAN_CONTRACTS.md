# DBI Skills Network — Cross-Plan Contracts & Release Gates

**Date:** 2026-11-16  
**Status:** Proposed integration contract for developer/domain-owner approval; not a verified inventory of production implementations.

## Source and governance
This contract harmonizes the **six supplied PLAN-0001–0006 Markdown files** and the supplied **AGENTS.md**. The referenced product strategy source and live repository were not uploaded, so implementation assertions remain unverified source claims. Preserve checked boxes until actual repo audit can confirm them; don't check any new item without tests and evidence.

## Ownership map

| Canonical domain | Source of truth | Consumers | Required boundary |
|---|---|---|---|
| Identity, tenant RBAC, consent/preferences | PLAN-0001 | All plans | Server-side actor + tenant + capability checks; separate platform and workspace roles |
| Explorer snapshots and skills taxonomy | PLAN-0002 | 0001, 0003–0006 | Expiring one-use handoff; taxonomy version IDs |
| Passport evidence, shares and VC issuance | PLAN-0002 | 0003–0005 | Public/verified-employer/private field scope; signature and revocation checks |
| Assessment definitions, attempts, human safety signoffs | PLAN-0003 | 0002, 0004, 0005 | Only assigned DBI evaluators may finalize; signed evidence event |
| Role benchmarks, suitability and Moodle sync | PLAN-0004 | 0005, 0006 | Explainable, versioned role-specific scores; learning is not verified practice |
| Jobs, applications, sponsor cohorts and expert engagements | PLAN-0005 | 0004, 0006 | Candidate consent; verified employer; free application; auditable cohorts |
| Disclosure-approved aggregate releases | PLAN-0006 | Institutional users/API clients | No individual discovery; small cell + composition/differencing defenses |

## Core contract vocabulary

**Talent goals**: `FIND_JOB`, `GROW_INCOME`, `REACH_DREAM_OCCUPATION`, `BUILD_EXPERT_REPUTATION` (PLAN-0001).

**Organization institutional types**: `EMPLOYER`, `TELECOM_OPERATOR`, `GOVERNMENT`, `DONOR_NGO`, `TRAINING_PARTNER` (PLAN-0001). Employment opportunity publication additionally requires successful organization verification and a designated capability; government status is not equivalent to hiring rights.

**Workspace roles**: `OWNER`, `ADMIN`, `RECRUITER`, `REVIEWER`. **Platform roles**: `SUPER_ADMIN`, `DBI_ADMIN`. **Evaluator**: a separately granted DBI evaluator capability and assignment; a generic workspace `REVIEWER` cannot grade lab work. **Talent** is an account persona, not a blanket right to another user's data.

**Evidence tier**: `DECLARED`, `DEMONSTRATED`, `VERIFIED`. **Confidence**: `VERIFIED`, `PROVISIONAL`, `INSUFFICIENT_EVIDENCE`. **Proficiency**: nullable, skill-scoped `1.0–5.0` only when rubric data justify a rating. Do not merge the three dimensions or map incomplete evidence to zero ability.

**Role suitability**: 0–100 normalized indication for a **specific role and benchmark version**, with evidence coverage and missing fields. The 40/20/15/10/10/5 model weights and Ready >=85/Near-ready 60–84 bands are **design hypotheses requiring specialist validation**, not scientifically calibrated hiring probabilities. Record formula/version and never automatically disqualify a candidate without accountable human process.

**Six initial pathways**: RF/RAN & 4G/5G; Fibre & Transmission; IP Networking & NOC; Field Deployment & Power; Cybersecurity & Cloud; Network Automation & Applied AI. Assign stable IDs and evolving display labels/ESCO mapping versions.

## Integration events (names proposed, not existing code)

| Event | Producer | Minimal payload | Consumer behavior |
|---|---|---|---|
| `explorer.snapshot_created.v1` | 0002 | `snapshot_id`, `token_hash_ref`, `expires_at`, `taxonomy_version` | 0001 allows one-use account redemption after auth + confirmation |
| `organization.verification_decided.v1` | 0001 | `organization_id`, `status`, `reviewer_id`, `decision_id`, `occurred_at` | 0005 enables/blocks verified-employer operations |
| `assessment.finalized.v1` | 0003 | `session_id`, `candidate_id`, `skill_id`, `rubric_version`, `evidence_id`, `issuer_authorization` | 0002 records evidence, then may issue verified badge after verification; 0004 recalculates |
| `credential.status_changed.v1` | 0002 | `credential_id`, `status`, `changed_at`, `reason_code` | 0004/0005 refresh visible eligibility; 0006 aggregate refresh |
| `moodle.completion_recorded.v1` | 0004 | `provider_user_ref`, `course_id`, `completion_event_id`, `completed_at`, `record_status` | 0002 records **learning evidence**, not automatic verification |
| `career.diagnosis_updated.v1` | 0004 | `candidate_id`, `role_id`, `benchmark_version`, `formula_version`, `evidence_coverage` | 0005 uses same rules for role matching, with user permission |
| `application.stage_changed.v1` | 0005 | `application_id`, `opportunity_id`, `stage`, `decision_time`, `outcome_verified` | 0006 consumes eligible aggregate outcomes; no personal record exposed |
| `cohort.milestone_recorded.v1` | 0005 | `cohort_id`, `milestone_id`, `status`, `evidence_ref`, `approved_at` | 0006 produces privacy-safe outcome counts |

Every event requires `event_id`, `schema_version`, `occurred_at` (UTC), `producer`, `actor_ref` where applicable, deduplication/idempotency key and a documented PII classification. Use a transactional outbox/retry where justified; do not require microservices prematurely.

## Cross-plan edge cases

1. **Explorer + signup**: short-lived opaque snapshot; user confirmation; at-most-once redemption; no signup blocker when unavailable; no raw sensitive CV storage.
2. **Assessment + Passport**: only finalized rubric score with approved safety checks and evaluator role can create verified skill evidence. Hash uploaded material; sign issuer artifact independently; maintain expiry/revocation and appeal trail.
3. **Moodle + Passport**: authenticated Moodle web-service read or configured signed event bridge; course completed != professional skill verified. Learning evidence may change recommendations or evidence coverage, not verified issuer status by itself.
4. **Recruitment + readiness**: versioned formula, skill-requirement match, hard prerequisites, explicitly authorized talent disclosure. Paid services never affect ranking. Human employers decide final recruitment outcome.
5. **Sponsored cohorts + finance**: approved budget commitments and milestone evidence are records; funds movement needs a separately reviewed payments/legal workstream. No automatic contract execution.
6. **WorkforceIQ + other systems**: materialized and privacy-reviewed aggregates only, region/time coverage stated; `k >= 10` plus complementary suppression, query-rate/differencing defenses, and legal review. Data is an observed DBI-network sample, not national census.

## Release gates

- **Gate A — PLAN-0001 foundation (23 Nov 2026 target)**: identity, organization membership/verification and goal-first onboarding user journeys pass security, accessibility and end-to-end checks on `dev`. PLAN-0002 Explorer can be released as a narrow contract slice.
- **Gate B — Passport/SkillVerify**: taxonomy stable, private share controls, evaluator-signed assessment evidence and revocation/appeals tested.
- **Gate C — CareerGPS/OpportunityHub**: deterministic benchmark math validated by DBI specialists, Moodle data provenance correct, employer consent/permission and free applications proven.
- **Gate D — WorkforceIQ institutional availability**: aggregate release approved by data steward/privacy owner; cross-slice attacks tested; report/API licensing and keys scoped; documented denominators and coverage.

## External standards to verify at implementation

- Nigeria Data Protection Act (2023) and applicable NDPC guidance: https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf
- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model-2.0/
- W3C VC Data Integrity 1.0: https://www.w3.org/TR/vc-data-integrity/
- Moodle Web Services / installed-site API inventory: https://docs.moodle.org/dev/Web_Services

**These links inform design; DBI must confirm current regulations, its Moodle version and contractual obligations before production.**
