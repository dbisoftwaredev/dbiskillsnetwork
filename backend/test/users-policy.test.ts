import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canCompleteOnboarding, DEFAULT_COMMUNICATION_PREFERENCES, mayReceiveMarketing } from '../src/users/users.policy';

test('onboarding can only complete after a primary goal is chosen', () => {
  assert.equal(canCompleteOnboarding(null), false);
  assert.equal(canCompleteOnboarding(undefined), false);
  assert.equal(canCompleteOnboarding('FIND_JOB'), true);
});

test('defaults keep optional channels off and marketing never implied', () => {
  assert.equal(DEFAULT_COMMUNICATION_PREFERENCES.smsEnabled, false);
  assert.equal(DEFAULT_COMMUNICATION_PREFERENCES.whatsappEnabled, false);
  assert.equal(mayReceiveMarketing(false, DEFAULT_COMMUNICATION_PREFERENCES), false);
});

test('marketing requires explicit consent and a non-NONE frequency', () => {
  assert.equal(mayReceiveMarketing(true, { emailEnabled: true, frequency: 'WEEKLY_DIGEST' }), true);
  assert.equal(mayReceiveMarketing(true, { emailEnabled: true, frequency: 'NONE' }), false);
  assert.equal(mayReceiveMarketing(true, { emailEnabled: false, frequency: 'IMMEDIATE' }), false);
});

