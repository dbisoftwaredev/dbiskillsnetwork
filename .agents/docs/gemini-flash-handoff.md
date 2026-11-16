# Model Profile & Collaboration Handoff: Gemini Flash

- **Model Identity**: Gemini Flash (Antigravity Assistant)
- **Role**: Agile Scaffolding, Fast Orchestration, Test Generation, and Architecture Planning
- **Last Updated**: 2026-10-31

---

## 1. Capabilities & Core Strengths

Gemini Flash is optimized for speed, crisp execution, structured documentation, and modular implementation:
- **Fast Planning & Structural Organization**: Rapidly reading requirement specifications, creating organized project hierarchies, maintaining serial logs, and authoring rigorous implementation plans.
- **Test-Driven Scaffolding**: Drafting clear, failing test suites (unit, integration, mock contracts) from acceptance criteria across TypeScript, Python, and PHP/Node stacks.
- **CRUD & Standard Feature Delivery**: Writing clean NestJS controllers, services, database models (Prisma/TypeORM/PostgreSQL), Next.js pages/components, and standard REST/GraphQL endpoints.
- **Rule & Standard Governance**: Enforcing design system constraints, color palettes, documentation hygiene, and audit logging.

---

## 2. Model Boundaries & Identified Limitations

While Gemini Flash is fast and dependable for structured workflows, certain domain complexities benefit from handoff to larger, specialized reasoning models:

| Area / Task | Gemini Flash Boundary | Recommended Model for Handoff |
| :--- | :--- | :--- |
| **High-Dimensional Graph Matching** | Can write standard SQL/queries and weighted scoring algorithms, but intricate multi-variable recommendation topologies and vector clustering benefit from deep mathematical validation. | **Gemini Pro** / **Claude 3.5 Sonnet** |
| **Large-Scale Complex Refactoring** | Multi-file AST-level refactors spanning hundreds of interdependent modules across microservices simultaneously. | **Gemini Pro** / **Claude 3.5 Sonnet** / **GPT-4o** |
| **Deep Cryptographic & Zero-Knowledge Verification** | Standard JWT, HMAC, and digital signature schemas are fully supported, but advanced W3C Verifiable Credentials or ZK credential proof designs should be reviewed by advanced reasoning models. | **Claude 3.5 Sonnet** / **Gemini Pro** |
| **High-Ambiguity Algorithmic Optimization** | Novel machine learning pipeline architectures for national talent forecasting and econometric labor modeling. | **Gemini Pro** / **GPT-4o** |

---

## 3. Recommended Multi-Model Handoff Protocol

To ensure seamless execution across agent tiers:
1. **Gemini Flash (Current)**:
   - Sets up plans (`.agents/plans/PLAN-XXXX.md`).
   - Writes the test specifications (`Tests as the spec`).
   - Scaffold directories, migrations, base UI layouts adhering to design tokens, and standard backend endpoints.
2. **Handoff Trigger**:
   - When encountering non-trivial math/graph algorithms (e.g. dynamic multi-attribute talent ranking engine) or large architectural edge-case reviews, tag the task in the plan:
     `[HANDOFF: Requires Deep Reasoning Model (Gemini Pro / Claude 3.5 Sonnet) for Graph Ranking Optimizer]`.
3. **Execution & Return**:
   - The stronger model performs the complex algorithmic implementation or audit.
   - Control returns to Gemini Flash or specialized test runners to run serial regression tests, verify UI integrity, and record entries in `.agents/logs/activity.log.md`.

