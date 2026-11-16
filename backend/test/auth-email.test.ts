import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ServiceUnavailableException } from '@nestjs/common';
import { AuthEmailService } from '../src/auth/email.service';

test('Brevo email service sends MFA codes and surfaces provider failures', async () => {
  const previous = {
    apiKey: process.env.BREVO_API_KEY,
    fromEmail: process.env.BREVO_FROM_EMAIL,
    appOrigin: process.env.APP_ORIGIN,
  };
  const originalFetch = globalThis.fetch;
  let requestBody: Record<string, unknown> | undefined;
  process.env.BREVO_API_KEY = 'test-api-key';
  process.env.BREVO_FROM_EMAIL = 'no-reply@example.com';
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(null, { status: 201 });
  }) as typeof fetch;

  try {
    const email = new AuthEmailService();
    await email.sendMfaCode('person@example.com', '482731');
    assert.deepEqual(requestBody?.to, [{ email: 'person@example.com' }]);
    assert.match(String(requestBody?.textContent), /482731/);
    assert.equal(requestBody?.subject, 'Your DBI Skills Network verification code');

    await email.sendPasswordResetEmail('person@example.com', 'one-time-token');
    assert.match(String(requestBody?.textContent), /\/auth\/reset-password\?token=one-time-token/);

    globalThis.fetch = (async () => new Response(null, { status: 429 })) as typeof fetch;
    await assert.rejects(email.sendMfaCode('person@example.com', '482731'), (error: unknown) =>
      error instanceof ServiceUnavailableException && error.getStatus() === 503,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (previous.apiKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = previous.apiKey;
    if (previous.fromEmail === undefined) delete process.env.BREVO_FROM_EMAIL;
    else process.env.BREVO_FROM_EMAIL = previous.fromEmail;
    if (previous.appOrigin === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previous.appOrigin;
  }
});
