<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## Frontend Agent Rules (Kate & UI Contributors)

1. **Use Standard Browser `fetch()` / AJAX / XHR — Never Next.js Server Actions**:
   - Do **NOT** use `'use server'`, `useActionState`, or `<form action={serverAction}>` for form submissions or API mutations.
   - Always submit forms via client-side `<form onSubmit={handleSubmit}>` calling `fetch('/api/v1/...', { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(...) })` through the `/api/:path*` rewrite in `frontend/next.config.mjs`.
   - Every API call in the browser Network tab must show the actual `/api/v1/*` endpoint, a clean JSON payload, and the real HTTP status code (`200`, `201`, `202`, `400`, `401`, `409`, `429`) — never React Flight `_1_$ACTION_REF_*` payloads.
   - When an auth endpoint returns session tokens (`accessToken`, `refreshToken`, `setupToken`, `challengeToken`), persist them via a clean JSON Route Handler (e.g., `/session`) or client `Authorization: Bearer` header without using `'use server'` actions.

2. **Preserve Existing UI Design & Palette**:
   - Do not alter existing layouts, CSS classes, typography, or the 5-color palette (`#10263B`, `#128F8A`, `#64DCD1`, `#F2F5FA`, `#D9AB60`) unless explicitly instructed.
   - Read the root [`../AGENTS.md`](../AGENTS.md) and [`../.agents/README.md`](../.agents/README.md) before making changes.
