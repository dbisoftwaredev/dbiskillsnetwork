import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/swagger';

test('Swagger serves the versioned API contract outside production', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  setupSwagger(app, { NODE_ENV: 'test' });
  await app.listen(0, '127.0.0.1');

  try {
    const response = await fetch(new URL('/api/docs-json', await app.getUrl()));
    assert.equal(response.status, 200);
    const document = await response.json() as {
      info: { title: string };
      paths: Record<string, {
        post?: {
          summary?: string;
          security?: Array<Record<string, string[]>>;
          requestBody?: { content?: Record<string, { schema?: { $ref?: string } }> };
        };
      }>;
      components: { schemas: Record<string, { properties?: Record<string, { pattern?: string }> }> };
    };
    assert.equal(document.info.title, 'DBI Skills Network API');
    const signup = document.paths['/api/v1/auth/signup']?.post;
    assert.equal(signup?.summary, 'Register an account and send an email verification link');
    assert.equal(signup?.requestBody?.content?.['application/json']?.schema?.$ref, '#/components/schemas/SignUpDto');
    assert.ok(document.components.schemas.SignUpDto.properties?.termsAccepted);
    assert.deepEqual(document.paths['/api/v1/auth/mfa/setup']?.post?.security, [{ bearer: [] }]);
    assert.equal(document.paths['/api/v1/auth/mfa/challenge']?.post?.summary, 'Complete sign-in using an emailed MFA code');
    assert.equal(document.paths['/api/v1/auth/forgot-password']?.post?.summary, 'Request a password reset email');
    assert.equal(document.paths['/api/v1/auth/reset-password']?.post?.summary, 'Set a new password using a one-time reset token');
    assert.equal(document.components.schemas.VerifyMfaDto.properties?.code?.pattern, '^\\d{6}$');
  } finally {
    await app.close();
  }
});
