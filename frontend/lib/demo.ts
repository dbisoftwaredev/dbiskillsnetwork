// Local demo sign-in (development only).
//
// When the app runs under `next dev`, any email and password signs in and every page works
// against this in-memory stand-in for the API, so screens can be reviewed without a configured
// backend (database, email delivery). Production builds never enable it: DEMO_ENABLED is false
// there, demo tokens are ignored and every request goes to the real API.

import { ASSESSMENTS, COURSES, OPPORTUNITIES, TAXONOMY } from './demo-catalog';
import type { PassportSkill, Visibility } from './talent';

type AccountType = 'TALENT' | 'ORGANIZATION_REPRESENTATIVE';
type Role = 'OWNER' | 'ADMIN' | 'RECRUITER' | 'REVIEWER';

export const DEMO_ENABLED = process.env.NODE_ENV !== 'production';

type DemoOrg = { id: string; name: string; cacRegistrationNumber: string | null; sector: string | null; verificationStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'; createdAt: string; members: { userId: string; email: string; role: Role; joinedAt: string }[] };
type DemoAccount = {
  id: string; email: string; accountType: AccountType; mfaEnabled: boolean; createdAt: string;
  profile: { displayName: string | null; location: string | null };
  onboarding: { primaryGoal: string | null; persona: string | null; targetOccupation: string | null; step: string; completedAt: string | null };
  passport: { handle: string; visibility: Visibility; skills: PassportSkill[] };
  applied: string[];
};

// Survives dev hot reloads; resets when the dev server restarts.
type DemoStore = { accounts: Map<string, DemoAccount>; orgs: Map<string, DemoOrg> };
const holder = globalThis as { __dbiDemo?: DemoStore };
const store: DemoStore = holder.__dbiDemo ?? (holder.__dbiDemo = { accounts: new Map(), orgs: new Map() });

const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const idFor = (email: string) => `demo-${Buffer.from(email).toString('hex').slice(0, 24)}`;

function claimsOf(token: unknown): { sub: string; email: string; accountType: AccountType; demo?: boolean } | null {
  if (typeof token !== 'string') return null;
  try { return JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')); } catch { return null; }
}

/** Creates (or reuses) a demo account and returns tokens shaped like the API's. */
export function demoTokens(email: string, accountType?: AccountType) {
  const existing = store.accounts.get(email);
  const type = accountType ?? existing?.accountType ?? 'TALENT';
  if (!existing || existing.accountType !== type) {
    store.accounts.set(email, {
      id: idFor(`${email}:${type}`), email, accountType: type, mfaEnabled: false, createdAt: new Date().toISOString(),
      profile: { displayName: null, location: null },
      onboarding: { primaryGoal: null, persona: null, targetOccupation: null, step: 'GOAL', completedAt: null },
      passport: { handle: `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}-${Math.random().toString(36).slice(2, 6)}`, visibility: 'PRIVATE', skills: [] },
      applied: [],
    });
  }
  const account = store.accounts.get(email)!;
  const token = (ttl: number) => `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: account.id, email, accountType: account.accountType, exp: Math.floor(Date.now() / 1000) + ttl, demo: true })}.demo`;
  return { accessToken: token(8 * 3600), refreshToken: token(30 * 24 * 3600), expiresIn: 8 * 3600 };
}

/** True when this request belongs to a demo session and should be answered locally. */
export function isDemoRequest(token: string | undefined, body: unknown, path = ''): boolean {
  if (!DEMO_ENABLED) return false;
  if (path.startsWith('/passport/public/')) return [...store.accounts.values()].some((a) => path.endsWith(`/${a.passport.handle}`));
  const refresh = body && typeof body === 'object' ? (body as { refreshToken?: unknown }).refreshToken : undefined;
  return Boolean(claimsOf(token)?.demo || claimsOf(refresh)?.demo);
}

type Result = { ok: true; status: number; data: unknown } | { ok: false; status: number; message: string };
const ok = (data: unknown = {}, status = 200): Result => ({ ok: true, status, data });
const fail = (status: number, message: string): Result => ({ ok: false, status, message });

function me(account: DemoAccount) {
  const { passport: _passport, applied: _applied, ...rest } = account;
  const memberships = [...store.orgs.values()].flatMap((org) => org.members.filter((m) => m.userId === account.id)
    .map((m) => ({ organizationId: org.id, name: org.name, verificationStatus: org.verificationStatus, role: m.role })));
  return { ...rest, emailVerified: true, memberships };
}

const orgView = (org: DemoOrg, userId: string) => {
  const { members, ...rest } = org;
  return { ...rest, role: members.find((m) => m.userId === userId)?.role };
};

/** Answers an API call for a demo session. Mirrors the shapes the real endpoints return. */
export function demoResponse(path: string, method: string, body: unknown, token: string | undefined): Result {
  const input = (body ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();

  if (path === '/auth/refresh') {
    const c = claimsOf(input.refreshToken);
    return c ? ok(demoTokens(c.email, c.accountType)) : fail(401, 'Session expired.');
  }
  if (path === '/auth/signout') return ok();

  if (path.startsWith('/passport/public/')) {
    const owner = [...store.accounts.values()].find((a) => path.endsWith(`/${a.passport.handle}`));
    if (!owner || owner.passport.visibility !== 'PUBLIC') return fail(404, 'This passport is private or does not exist.');
    return ok({ handle: owner.passport.handle, displayName: owner.profile.displayName, headline: owner.onboarding.targetOccupation,
      location: owner.profile.location, skills: owner.passport.skills.map(({ name, domain, evidenceTier }) => ({ name, domain, evidenceTier })) });
  }

  const c = claimsOf(token);
  const account = c ? store.accounts.get(c.email) : undefined;
  if (!c || !account) return fail(401, 'Your demo session has ended. Sign in again.');

  if (path === '/users/me' && method === 'GET') return ok(me(account));
  if (path === '/users/me' && method === 'PATCH') {
    for (const key of ['displayName', 'location'] as const) if (typeof input[key] === 'string') account.profile[key] = input[key] as string;
    for (const key of ['primaryGoal', 'persona', 'targetOccupation'] as const) if (typeof input[key] === 'string') account.onboarding[key] = input[key] as string;
    if (typeof input.onboardingStep === 'string') account.onboarding.step = input.onboardingStep;
    return ok(me(account));
  }

  if (path === '/auth/mfa/setup') {
    if (account.mfaEnabled) return fail(409, 'Already enabled.');
    return ok({ mfaRequired: true, challengeToken: `demo-challenge-${account.id}`, expiresIn: 300 });
  }
  if (path === '/auth/mfa/verify') { account.mfaEnabled = true; return ok({ enabled: true }); } // any 6-digit code works in the demo

  // Passport and skills (PLAN-0002)
  if (path === '/passport/me' && method === 'GET') return ok(account.passport);
  if (path === '/passport/visibility' && method === 'PATCH') {
    if (!['PRIVATE', 'EMPLOYERS_ONLY', 'PUBLIC'].includes(String(input.visibility))) return fail(400, 'Choose who can see your passport.');
    account.passport.visibility = input.visibility as Visibility;
    return ok(account.passport);
  }
  if (path === '/passport/skills' && method === 'POST') {
    const skill = TAXONOMY.find((t) => t.id === input.skillId || t.name.toLowerCase() === String(input.name ?? '').toLowerCase());
    const name = skill?.name ?? String(input.name ?? '').trim();
    if (!name) return fail(400, 'Choose a skill.');
    if (account.passport.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return fail(409, 'Already on your passport.');
    const evidenceUrl = typeof input.evidenceUrl === 'string' && input.evidenceUrl ? input.evidenceUrl : null;
    const added: PassportSkill = { id: `ps-${Math.random().toString(36).slice(2, 10)}`, skillId: skill?.id ?? 'custom', name, domain: skill?.domain ?? 'Other',
      evidenceTier: 'DECLARED', confidence: evidenceUrl ? 'PROVISIONAL' : 'INSUFFICIENT_EVIDENCE', proficiency: null, evidenceUrl, addedAt: now };
    account.passport.skills.push(added);
    return ok(added, 201);
  }
  const skillMatch = path.match(/^\/passport\/skills\/([^/]+)$/);
  if (skillMatch && method === 'DELETE') {
    account.passport.skills = account.passport.skills.filter((s) => s.id !== decodeURIComponent(skillMatch[1]));
    return ok();
  }
  if (path.startsWith('/taxonomy/skills')) return ok(TAXONOMY);

  // Diagnostics and opportunities (PLAN-0003), learning catalogue (PLAN-0004)
  if (path === '/assessments' && method === 'GET') return ok(ASSESSMENTS);
  if (path === '/opportunities' && method === 'GET') return ok(OPPORTUNITIES.map((o) => ({ ...o, applied: account.applied.includes(o.id) })));
  const applyMatch = path.match(/^\/opportunities\/([^/]+)\/apply$/);
  if (applyMatch && method === 'POST') {
    const id = decodeURIComponent(applyMatch[1]);
    if (!OPPORTUNITIES.some((o) => o.id === id)) return fail(404, 'This role is no longer open.');
    if (input.disclosureConsent !== true) return fail(400, 'Confirm what the employer will see.');
    if (account.applied.includes(id)) return fail(409, 'You’ve already applied.');
    account.applied.push(id);
    return ok({ applied: true }, 201);
  }
  if (path === '/learning/courses' && method === 'GET') return ok(COURSES);

  const mine = () => [...store.orgs.values()].filter((org) => org.members.some((m) => m.userId === account.id));

  if (path === '/organizations' && method === 'GET') return ok(mine().map((org) => orgView(org, account.id)));
  if (path === '/organizations' && method === 'POST') {
    const org: DemoOrg = {
      id: `org-${Math.random().toString(36).slice(2, 10)}`, name: String(input.name ?? 'My organization'),
      cacRegistrationNumber: (input.cacRegistrationNumber as string) ?? null, sector: (input.sector as string) ?? null,
      verificationStatus: input.cacRegistrationNumber ? 'PENDING_REVIEW' : 'UNVERIFIED', createdAt: now,
      members: [{ userId: account.id, email: account.email, role: 'OWNER', joinedAt: now }],
    };
    store.orgs.set(org.id, org);
    return ok(orgView(org, account.id), 201);
  }
  if (path === '/organizations/invitations/accept') {
    const first = mine()[0];
    return first ? ok({ organizationId: first.id }) : fail(404, 'This invitation has expired.');
  }

  const match = path.match(/^\/organizations\/([^/]+)(\/members(?:\/invite|\/([^/]+))?)?$/);
  const org = match ? store.orgs.get(decodeURIComponent(match[1])) : undefined;
  if (match && (!org || !org.members.some((m) => m.userId === account.id))) return fail(404, 'Workspace not found.');
  if (org && match) {
    const [, , sub, userId] = match;
    if (!sub && method === 'GET') return ok(orgView(org, account.id));
    if (!sub && method === 'PATCH') {
      if (typeof input.name === 'string') org.name = input.name;
      if ('cacRegistrationNumber' in input) org.cacRegistrationNumber = (input.cacRegistrationNumber as string) || null;
      if ('sector' in input) org.sector = (input.sector as string) || null;
      if (org.cacRegistrationNumber && org.verificationStatus === 'UNVERIFIED') org.verificationStatus = 'PENDING_REVIEW';
      return ok(orgView(org, account.id));
    }
    if (sub === '/members' && method === 'GET') return ok(org.members.map(({ userId: id, email, role, joinedAt }) => ({ userId: id, email, role, joinedAt })));
    if (sub === '/members/invite') {
      const email = String(input.email ?? '');
      if (org.members.some((m) => m.email === email)) return fail(409, 'Already a member.');
      // The demo adds invitees straight away so the members list can be reviewed.
      org.members.push({ userId: idFor(`${email}:member`), email, role: (input.role as Role) ?? 'RECRUITER', joinedAt: now });
      return ok({ invited: true }, 201);
    }
    if (userId && method === 'DELETE') {
      org.members = org.members.filter((m) => m.userId !== decodeURIComponent(userId) || m.role === 'OWNER');
      return ok();
    }
  }

  return fail(501, 'This action isn’t available in the local demo.');
}
