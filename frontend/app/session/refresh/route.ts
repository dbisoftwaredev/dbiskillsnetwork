import { NextResponse, type NextRequest } from 'next/server';
import { api, type Tokens } from '../../../lib/api';
import { clearSession, readRefreshToken, storeTokens } from '../../../lib/session';
import { safeNext } from '../../../lib/rules';

// Rotates the refresh token, then returns the visitor to the page they asked for.
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get('next'), '/');
  const refreshToken = await readRefreshToken();
  const result = refreshToken ? await api<Tokens>('/auth/refresh', { body: { refreshToken } }) : null;

  if (!result?.ok) {
    // Keep the refresh token through an outage; drop it only when the API rejects it.
    if (!result || (result.status >= 400 && result.status < 500)) await clearSession();
    return NextResponse.redirect(new URL(`/auth/login?next=${encodeURIComponent(next)}`, request.url));
  }
  await storeTokens(result.data);
  return NextResponse.redirect(new URL(next, request.url));
}
