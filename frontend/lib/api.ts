import { describeApiError } from './rules';

// Server-side calls go straight to the API; the browser uses the /api rewrite (next.config.mjs).
// Both read API_ORIGIN so staging can point at the separately hosted backend.
export const API_ORIGIN = (process.env.API_ORIGIN || 'http://127.0.0.1:3001').replace(/\/+$/, '');

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

export async function api<T>(
  path: string,
  { method = 'POST', body, token }: { method?: string; body?: unknown; token?: string } = {},
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_ORIGIN}/api/v1${path}`, {
      method,
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, message: describeApiError(0, null) };
  }
  const data = await response.json().catch(() => null);
  if (response.ok) return { ok: true, status: response.status, data: data as T };
  return { ok: false, status: response.status, message: describeApiError(response.status, data) };
}

export type Tokens = { accessToken: string; refreshToken: string; expiresIn: number };
export type MfaChallenge = { mfaRequired: true; challengeToken: string; expiresIn: number };
export type Organization = {
  id: string;
  name: string;
  cacRegistrationNumber: string | null;
  sector: string | null;
  verificationStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  role?: Member['role'];
};
export type Member = { userId: string; email: string; role: 'OWNER' | 'ADMIN' | 'RECRUITER' | 'REVIEWER'; joinedAt: string };
