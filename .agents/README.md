# Agent Operation & Planning Rules

Welcome to the autonomous and assisted agent operational guide for the **DBI Skills Network** repository. All AI agents, contributors, and multi-model handoffs must strictly adhere to the operational conventions established here.

---

## 1. Core Principles & Philosophy

1. **Tests as the Spec**: 
   - Many high-performing engineering teams have the AI write failing tests from the acceptance criteria first, then make them pass. 
   - Unit, integration, and e2e test definitions serve as a sharper, unambiguous contract than prose scenarios. 
   - Reviewers and continuous integration pipelines can re-run tests deterministically. Always establish or update automated tests alongside implementation.

2. **Fewer Rules**:
   - Pruning and merging rules now and then keeps the method nimble and fast. 
   - Avoid creating burdensome administrative overhead. Rules exist to protect system integrity and code quality, not impede execution velocity.

3. **Tiered Planning Structure**:
   - **Detailed Plans (`PLAN-XXXX`)**: Reserved for real features, system architecture modifications, major database schema migrations, or multi-engine platform integrations.
   - **Lightweight Plans**: Employ lightweight, streamlined plans for quick bug fixes, typo corrections, or minor style adjustments.

---

## 2. Serial Tracking & Directory Conventions

All agent workflows must maintain persistent serial tracking:
- **`.agents/logs/activity.log.md`**: Serial log of all agent runs, activities, state transitions, and milestone changes.
- **`.agents/plans/`**: Numbered implementation plans (`PLAN-0001`, `PLAN-0002`, etc.) generated from `TEMPLATE.md`.
- **`.agents/docs/`**: Model specifications, architecture decision records (ADRs), capability boundaries, and handoff protocols.

---

## 3. Frontend Invariants & Design System Guidelines

1. **Design Preservation**:
   - Never touch or mess up existing UI design, component hierarchy, layouts, typography, or color tokens without explicit instructions.
   - Strictly honor the established design palette:
     - **Midnight Navy**: `#10263B`
     - **Ocean Teal**: `#128F8A`
     - **Electric Mint**: `#64DCD1`
     - **Cloud White**: `#F2F5FA`
     - **Warm Gold**: `#D9AB60`
2. **Deterministic UI Testing**:
   - After implementing or adjusting frontend components, run clear automated component and snapshot/interaction tests.
   - Verify responsive breakpoints (mobile-first for talent workflows, desktop-optimized for enterprise/government dashboards).

---

## 4. Multi-Model Collaboration & Model Handoff

Complex full-stack products require leveraging the specific strengths of diverse models:
- **Fast / Lightweight Models (e.g., Gemini Flash)**: Rapid workspace organization, plan drafting, boilerplate generation, unit test scaffolding, schema writing, and serial logging.
- **Deeper / High-Context Models (e.g., Gemini Pro, Claude 3.5 Sonnet / Opus, GPT-4o)**: Complex algorithmic reasoning, high-dimensional competency graph matching engines, deep cryptographic verification protocols, and sophisticated system refactoring.
- Refer to [`.agents/docs/gemini-flash-handoff.md`](file:///c:/laragon/www/dbiskillsnetwork/.agents/docs/gemini-flash-handoff.md) for clear handoff boundaries.

