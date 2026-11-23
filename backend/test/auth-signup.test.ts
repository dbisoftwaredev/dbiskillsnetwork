import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

test('signup logs the missing database column without logging query parameters', async (context) => {
  const log = context.mock.method(Logger.prototype, 'error', () => {});
  const cause = new DatabaseError('column "account_type_selected_at" does not exist', 0, 'error');
  cause.code = '42703';
  const auth = {
    signUp: async () => {
      throw new DrizzleQueryError('INSERT INTO users VALUES ($1)', ['private-test-value'], cause);
    },
  } as unknown as AuthService;
  const controller = new AuthController(auth);

  await assert.rejects(controller.signUp({
    email: 'example@example.com',
    password: 'example-password',
    termsAccepted: true,
    privacyAccepted: true,
    marketingOptIn: false,
  }), InternalServerErrorException);
  assert.deepEqual(log.mock.calls.map((call) => call.arguments), [
    ['Signup failed: PostgreSQL 42703 (column "account_type_selected_at" does not exist)'],
  ]);
});
