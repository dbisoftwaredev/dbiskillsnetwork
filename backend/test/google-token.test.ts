import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { verifyGoogleCredential } from '../src/auth/google-token';

test('Google credentials require a valid signature, audience, expiry and single-use nonce', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    keys: [{ ...jwk, kid: 'test-key', alg: 'RS256', use: 'sig' }],
  }), { headers: { 'cache-control': 'max-age=300' } })) as typeof fetch;

  const makeCredential = (claims: Record<string, unknown>) => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url');
    return `${header}.${payload}.${signature}`;
  };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: 'https://accounts.google.com',
    aud: 'dbi-test-client',
    sub: 'google-user-1',
    email: 'person@example.com',
    email_verified: true,
    nonce: 'one-time-challenge',
    iat: now,
    exp: now + 300,
  };

  try {
    const identity = await verifyGoogleCredential(makeCredential(claims), 'dbi-test-client', 'one-time-challenge');
    assert.deepEqual(identity, { subject: 'google-user-1', email: 'person@example.com' });
    await assert.rejects(
      verifyGoogleCredential(makeCredential({ ...claims, nonce: 'wrong' }), 'dbi-test-client', 'one-time-challenge'),
      UnauthorizedException,
    );
    await assert.rejects(
      verifyGoogleCredential(makeCredential({ ...claims, aud: 'another-client' }), 'dbi-test-client', 'one-time-challenge'),
      UnauthorizedException,
    );
    await assert.rejects(
      verifyGoogleCredential(makeCredential({ ...claims, exp: now - 1 }), 'dbi-test-client', 'one-time-challenge'),
      UnauthorizedException,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
