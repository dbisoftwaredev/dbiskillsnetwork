import { createPublicKey, verify } from 'node:crypto';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

type GoogleJwk = { kid: string; alg: string; use: string; kty: string; n: string; e: string };
type GoogleClaims = {
  aud?: string | string[];
  azp?: string;
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
  iat?: number;
  iss?: string;
  nonce?: string;
  sub?: string;
};

let keyCache: { expiresAt: number; keys: GoogleJwk[] } | undefined;

async function getGoogleKeys(): Promise<GoogleJwk[]> {
  if (keyCache && keyCache.expiresAt > Date.now()) return keyCache.keys;
  let response: Response;
  try {
    response = await fetch('https://www.googleapis.com/oauth2/v3/certs', { cache: 'no-store' });
  } catch {
    throw new ServiceUnavailableException('Google sign-in is temporarily unavailable');
  }
  if (!response.ok) throw new ServiceUnavailableException('Google sign-in is temporarily unavailable');
  const body = await response.json() as { keys?: GoogleJwk[] };
  if (!Array.isArray(body.keys)) throw new ServiceUnavailableException('Google sign-in is temporarily unavailable');
  const maxAge = response.headers.get('cache-control')?.match(/max-age=(\d+)/i)?.[1];
  keyCache = { keys: body.keys, expiresAt: Date.now() + Math.min(Number(maxAge) || 300, 3600) * 1000 };
  return keyCache.keys;
}

function decode<T>(part: string): T {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as T;
  } catch {
    throw new UnauthorizedException('Google credential is invalid');
  }
}

export async function verifyGoogleCredential(
  credential: string,
  clientId: string,
  expectedNonce: string,
): Promise<{ subject: string; email: string }> {
  const parts = credential.split('.');
  if (parts.length !== 3) throw new UnauthorizedException('Google credential is invalid');
  const header = decode<{ alg?: string; kid?: string }>(parts[0]);
  const claims = decode<GoogleClaims>(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new UnauthorizedException('Google credential is invalid');

  const jwk = (await getGoogleKeys()).find((key) => key.kid === header.kid && key.alg === 'RS256' && key.use === 'sig');
  if (!jwk) throw new UnauthorizedException('Google credential is invalid');
  const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = Buffer.from(parts[2], 'base64url');
  const publicKey = createPublicKey({ key: { kty: jwk.kty, n: jwk.n, e: jwk.e }, format: 'jwk' });
  if (!verify('RSA-SHA256', signedContent, publicKey, signature)) {
    throw new UnauthorizedException('Google credential is invalid');
  }

  const audienceMatches = Array.isArray(claims.aud) ? claims.aud.includes(clientId) : claims.aud === clientId;
  const now = Math.floor(Date.now() / 1000);
  if (
    !audienceMatches
    || (claims.azp && claims.azp !== clientId)
    || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss ?? '')
    || typeof claims.exp !== 'number'
    || claims.exp <= now
    || typeof claims.iat !== 'number'
    || claims.iat > now + 60
    || claims.nonce !== expectedNonce
    || claims.email_verified !== true && claims.email_verified !== 'true'
    || !claims.sub
    || !claims.email
  ) {
    throw new UnauthorizedException('Google account verification failed');
  }
  return { subject: claims.sub, email: claims.email.trim().toLowerCase() };
}
