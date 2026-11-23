import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, type Organization, type Tokens } from './api';
import { isExpired, readClaims, type AccessClaims } from './rules';

// Tokens live only in httpOnly cookies; page JavaScript never sees them.
const ACCESS = 'dbi_access';
const REFRESH = 'dbi_refresh';
const CHALLENGE = 'dbi_challenge';
const CHALLENGE_EMAIL = 'dbi_challenge_email';
const CHALLENGE_EXPIRES = 'dbi_challenge_expires';
const ACCOUNT_SETUP = 'dbi_account_setup';

const base = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export type Session = AccessClaims & { accessToken: string };

export async function storeTokens(tokens: Tokens) {
  const jar = await cookies();
  jar.set(ACCESS, tokens.accessToken, { ...base, maxAge: tokens.expiresIn });
  jar.set(REFRESH, tokens.refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  const jar = await cookies();
  for (const name of [ACCESS, REFRESH, CHALLENGE, CHALLENGE_EMAIL, CHALLENGE_EXPIRES, ACCOUNT_SETUP]) jar.delete(name);
}

export async function storeAccountSetupToken(token: string) {
  (await cookies()).set(ACCOUNT_SETUP, token, { ...base, maxAge: 60 * 60 * 24 });
}

export async function readAccountSetupToken() {
  return (await cookies()).get(ACCOUNT_SETUP)?.value;
}

export async function clearAccountSetupToken() {
  (await cookies()).delete(ACCOUNT_SETUP);
}

export async function forgetRefreshToken() {
  (await cookies()).delete(REFRESH);
}

export async function readRefreshToken() {
  return (await cookies()).get(REFRESH)?.value;
}

export async function storeChallenge(token: string, expiresIn: number, email?: string) {
  const jar = await cookies();
  jar.set(CHALLENGE, token, { ...base, maxAge: expiresIn });
  jar.set(CHALLENGE_EXPIRES, String(Date.now() + expiresIn * 1000), { ...base, maxAge: expiresIn });
  if (email) jar.set(CHALLENGE_EMAIL, email, { ...base, maxAge: expiresIn });
}

export async function readChallenge() {
  const jar = await cookies();
  const expiresAt = Number(jar.get(CHALLENGE_EXPIRES)?.value);
  return {
    token: jar.get(CHALLENGE)?.value,
    email: jar.get(CHALLENGE_EMAIL)?.value,
    secondsLeft: Number.isFinite(expiresAt) ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : 0,
  };
}

export async function clearChallenge() {
  const jar = await cookies();
  jar.delete(CHALLENGE);
  jar.delete(CHALLENGE_EMAIL);
  jar.delete(CHALLENGE_EXPIRES);
}

export async function readSession(): Promise<Session | null> {
  const token = (await cookies()).get(ACCESS)?.value;
  const claims = readClaims(token);
  if (!token || !claims || isExpired(claims)) return null;
  return { ...claims, accessToken: token };
}

/** Returns the session, or sends the visitor to refresh or sign in and come back to `here`. */
export async function requireSession(here: string): Promise<Session> {
  const session = await readSession();
  if (session) return session;
  const next = encodeURIComponent(here);
  if (await readRefreshToken()) redirect(`/session/refresh?next=${next}`);
  redirect(`/auth/login?next=${next}`);
}

/** Where a signed-in person belongs when no destination was requested. */
export async function homeFor(session: Session): Promise<string> {
  if (session.accountType === 'TALENT') return '/talent';
  const orgs = await api<Organization[]>('/organizations', { method: 'GET', token: session.accessToken });
  return orgs.ok && orgs.data.length > 0 ? '/organization' : '/onboarding/organization';
}
