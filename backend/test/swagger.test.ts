import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/swagger';

test('Swagger serves the versioned API contract outside production and base route returns welcome JSON', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1', { exclude: [{ path: '/', method: RequestMethod.GET }] });
  setupSwagger(app, { NODE_ENV: 'test' });
  await app.listen(0, '127.0.0.1');

  try {
    const baseUrl = await app.getUrl();
    const welcomeRes = await fetch(new URL('/', baseUrl));
    assert.equal(welcomeRes.status, 200);
    const welcome = await welcomeRes.json() as {
      service: string;
      status: string;
      endpoints: { health: string; readiness: string };
      docs: { swaggerUi: string; openApiJson: string } | null;
    };
    assert.equal(welcome.service, 'DBI Skills Network API');
    assert.equal(welcome.status, 'ok');
    assert.equal(welcome.endpoints.health, '/api/v1/health');
    assert.equal(welcome.docs?.swaggerUi, '/api/docs');

    const response = await fetch(new URL('/api/docs-json', baseUrl));
    assert.equal(response.status, 200);
    const document = await response.json() as {
      info: { title: string };
      paths: Record<string, Record<string, {
        summary?: string;
        security?: Array<Record<string, string[]>>;
        requestBody?: { content?: Record<string, { schema?: { $ref?: string } }> };
      }>>;
      components: { schemas: Record<string, { properties?: Record<string, { pattern?: string }> }> };
    };
    assert.equal(document.info.title, 'DBI Skills Network API');
    const signup = document.paths['/api/v1/auth/signup']?.post;
    assert.equal(signup?.summary, 'Register an account and send an email verification link');
    assert.equal(signup?.requestBody?.content?.['application/json']?.schema?.$ref, '#/components/schemas/SignUpDto');
    assert.ok(document.components.schemas.SignUpDto.properties?.termsAccepted);
    assert.equal(document.components.schemas.SignUpDto.properties?.accountType, undefined);
    assert.equal(signup?.security, undefined);
    assert.equal(document.paths['/api/v1/auth/signin']?.post?.security, undefined);
    assert.ok(document.paths['/api/v1/auth/complete-account-setup']?.post);
    assert.ok(document.paths['/api/v1/auth/google']?.post);
    assert.ok(document.paths['/api/v1/auth/google/challenge']?.post);

    // Every authenticated endpoint must declare bearer security in OpenAPI
    const protectedOps: Array<[string, string]> = [
      ['/api/v1/auth/mfa/setup', 'post'],
      ['/api/v1/auth/mfa/verify', 'post'],
      ['/api/v1/users/me', 'get'],
      ['/api/v1/users/me', 'patch'],
      ['/api/v1/users/me/communication-preferences', 'get'],
      ['/api/v1/users/me/communication-preferences', 'patch'],
      ['/api/v1/organizations', 'get'],
      ['/api/v1/organizations', 'post'],
      ['/api/v1/organizations/{organizationId}', 'get'],
      ['/api/v1/organizations/{organizationId}', 'patch'],
      ['/api/v1/organizations/{organizationId}/members', 'get'],
      ['/api/v1/organizations/{organizationId}/members/invite', 'post'],
      ['/api/v1/organizations/{organizationId}/members/{userId}', 'delete'],
      ['/api/v1/organizations/{organizationId}/verification/submit', 'post'],
      ['/api/v1/admin/organizations/verifications', 'get'],
      ['/api/v1/admin/organizations/{organizationId}/verification/decide', 'patch'],
      ['/api/v1/talent/profile/me', 'get'],
      ['/api/v1/talent/profile/me', 'patch'],
      ['/api/v1/passport/skills', 'post'],
      ['/api/v1/passport/skills/{id}', 'delete'],
      ['/api/v1/passport/me', 'get'],
      ['/api/v1/passport/visibility', 'patch'],
      ['/api/v1/passport/credentials', 'post'],
      ['/api/v1/passport/credentials', 'get'],
      ['/api/v1/admin/passport/rpl-verifications', 'get'],
      ['/api/v1/admin/passport/rpl-verifications/{credentialId}/decide', 'patch'],
      ['/api/v1/storage/presign-upload', 'post'],
      ['/api/v1/storage/signed-download', 'get'],
    ];
    for (const [path, method] of protectedOps) {
      assert.deepEqual(document.paths[path]?.[method]?.security, [{ bearer: [] }], `Missing bearer security on ${method.toUpperCase()} ${path}`);
    }

    assert.ok(document.paths['/api/v1/public/career-readiness-explorer']?.post);
    assert.ok(document.paths['/api/v1/taxonomy/domains']?.get);
    assert.ok(document.paths['/api/v1/taxonomy/skills']?.get);
    assert.ok(document.paths['/api/v1/passport/public/{handle}']?.get);

    assert.equal(document.paths['/api/v1/auth/mfa/challenge']?.post?.summary, 'Complete sign-in using an emailed MFA code');
    assert.equal(document.paths['/api/v1/auth/forgot-password']?.post?.summary, 'Request a password reset email');
    assert.equal(document.paths['/api/v1/auth/reset-password']?.post?.summary, 'Set a new password using a one-time reset token');
    assert.equal(document.components.schemas.VerifyMfaDto.properties?.code?.pattern, '^\\d{6}$');
  } finally {
    await app.close();
  }
});
