# DBI Skills Network

Runnable foundation for PLAN-0001: Next.js App Router frontend, modular NestJS API, PostgreSQL with Drizzle ORM, and initial email/password identity and recovery flows. Organization workflows and the other product engines are not implemented yet. Preview profiles are illustrative.

## Quick start

Use Node.js 22 or newer. On Windows PowerShell, use `npm.cmd` if script policy blocks `npm`.

1. Install dependencies from this directory: `npm.cmd install`.
2. Start PostgreSQL using your existing installation or Docker Desktop. Create a database and a dedicated application user. This scaffold does not create or modify database tables.
3. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`, `AUTH_ACCESS_TOKEN_SECRET` (at least 32 bytes), and Brevo sender credentials.
4. Generate the current schema migration if needed: `npm.cmd run db:generate -w backend`.
5. Apply migrations: `npm.cmd run db:migrate -w backend`.
6. Check the database: `npm.cmd run db:check`.
7. Start both applications: `npm.cmd run dev`.
8. Open [localhost:3000](http://localhost:3000).

The preview and API liveness endpoint can run without PostgreSQL. Database readiness correctly returns HTTP 503 until PostgreSQL is connected.

## Startup order

PostgreSQL → backend (127.0.0.1:3001) → frontend (localhost:3000).

`npm.cmd run dev` launches both app processes. The API has no database startup dependency for its preview routes. To run them separately, use `npm.cmd run dev -w backend` and `npm.cmd run dev -w frontend` in separate terminals.

## Lean configuration

Only `backend/.env` is needed:

| Variable | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | For database operations |
| `APP_ORIGIN` | Public web app origin used in email verification and reset links | Defaults to `http://localhost:3000` |
| `NODE_ENV` | Runtime environment | Set to `production` in deployments |
| `AUTH_ACCESS_TOKEN_SECRET` | HMAC key for access JWTs and email OTP validation (minimum 32 bytes) | For sign-in and MFA |
| `BREVO_API_KEY` | Brevo transactional email API key | For verification, reset, and MFA emails |
| `BREVO_FROM_EMAIL` | Verified sender address in Brevo | For verification, reset, and MFA emails |
| `BREVO_FROM_NAME` | Email sender display name | Defaults to `DBI Skills Network` |
| `TERMS_VERSION`, `PRIVACY_VERSION` | Version identifiers written to the consent ledger | Defaults to `v1` |
| `SWAGGER_ENABLED` | Override the docs visibility default | Defaults on outside production; off in production |

No frontend environment variables are needed. `/api/*` requests are proxied to the local API using [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites). Ports and ordinary defaults live in code. Never commit real `.env` files.

Editable business rules belong in database-backed settings when those features are built. Redis, email, payments, AI and external storage integrations are intentionally deferred until needed.

## Verification

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:browser
```

API endpoints (also reachable through port 3000):

- `GET /api/v1/health`: API process liveness.
- `GET /api/v1/health/ready`: real database query; returns 503 for missing or unavailable PostgreSQL without exposing connection credentials.
- `POST /api/v1/auth/signup`: create a talent or organization representative account, record required terms/privacy consent and optional marketing consent, and send an email verification link through Brevo.
- `POST /api/v1/auth/verify-email`: verify an email using the one-time token.
- `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password`: request a generic-response reset email and set a new password with a one-time token.
- `POST /api/v1/auth/signin`: issue a 15-minute access JWT and 30-day opaque refresh token after email verification.
- `POST /api/v1/auth/mfa/setup` (Bearer token): send an email OTP to begin MFA enrollment.
- `POST /api/v1/auth/mfa/verify` (Bearer token): verify the enrollment OTP and enable MFA.
- `POST /api/v1/auth/mfa/challenge`: complete an MFA-protected sign-in with the emailed OTP.
- `POST /api/v1/auth/refresh`: rotate a refresh token; the previous token is invalidated.
- `POST /api/v1/auth/signout`: revoke a refresh token.

Email OTP MFA codes are six digits, expire after five minutes, are limited to five attempts, and are stored only as keyed hashes. Enabling MFA revokes existing refresh sessions; signing in then requires both the password and email code. This email-based factor depends on mailbox security and is weaker than a separately held authenticator or hardware key. Password reset links are single-use, expire after one hour, and revoke existing refresh sessions. Authentication endpoints apply in-memory request throttling. Passwords are hashed with Argon2id; refresh, verification, MFA challenge, and password reset tokens are stored only as hashes. PostgreSQL schema changes are managed with Drizzle Kit. Frontend auth screens, account MFA management UI, and organization workflows remain future work.

## API documentation

Swagger UI and the generated OpenAPI JSON are available at [localhost:3001/api/docs](http://localhost:3001/api/docs) and `/api/docs-json` outside production. In production they are disabled by default; set `SWAGGER_ENABLED=true` only when intentionally publishing the docs. If the API is private, restrict access through the deployment's normal network or authentication controls. Set `SWAGGER_ENABLED=false` to disable the docs in development or test as well.

For production, build first, then run `npm.cmd start -w backend` and `npm.cmd start -w frontend` under a process supervisor. Both processes must share a host for the current loopback proxy configuration; use a TLS reverse proxy in front of Next.js. This scaffold is not a production identity system.

## Implementation order

1. PLAN-0001: foundation, identity, consent, organizations and verification.
2. PLAN-0002: taxonomy, profiles, Passport and Readiness Explorer.
3. PLAN-0003: assessments and practical evaluation.
4. PLAN-0004: CareerGPS and Moodle bridge.
5. PLAN-0005: opportunities, Expert Circle and sponsored cohorts.
6. PLAN-0006: aggregate WorkforceIQ analytics.
