import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canReviewVerifications,
  canSubmitForVerification,
  statusAfterDecision,
  validateDecision,
} from '../src/verification/verification.policy';

test('organizations can submit only from UNVERIFIED or REJECTED', () => {
  assert.equal(canSubmitForVerification('UNVERIFIED'), true);
  assert.equal(canSubmitForVerification('REJECTED'), true);
  assert.equal(canSubmitForVerification('PENDING_REVIEW'), false);
  assert.equal(canSubmitForVerification('VERIFIED'), false);
});

test('only DBI admins with MFA enabled can review verifications', () => {
  assert.equal(canReviewVerifications('DBI_ADMIN', true), true);
  assert.equal(canReviewVerifications('SUPER_ADMIN', true), true);
  assert.equal(canReviewVerifications('DBI_ADMIN', false), false);
  assert.equal(canReviewVerifications('NONE', true), false);
});

test('rejections require a reason; approvals do not', () => {
  assert.equal(validateDecision('APPROVE'), null);
  assert.notEqual(validateDecision('REJECT'), null);
  assert.notEqual(validateDecision('REJECT', '   '), null);
  assert.equal(validateDecision('REJECT', 'CAC number does not match certificate'), null);
});

test('decisions map to final organization statuses', () => {
  assert.equal(statusAfterDecision('APPROVE'), 'VERIFIED');
  assert.equal(statusAfterDecision('REJECT'), 'REJECTED');
});

