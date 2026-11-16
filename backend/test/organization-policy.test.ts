import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canManageRole } from '../src/organizations/organization.policy';

test('organization owners can invite and remove non-owner roles', () => {
  for (const role of ['ADMIN', 'RECRUITER', 'REVIEWER'] as const) {
    assert.equal(canManageRole('OWNER', role, 'invite'), true);
    assert.equal(canManageRole('OWNER', role, 'remove'), true);
  }
  assert.equal(canManageRole('OWNER', 'OWNER', 'remove'), false);
  assert.equal(canManageRole('OWNER', 'OWNER', 'invite'), false);
});

test('organization admins can manage recruiters and reviewers but not admins or owners', () => {
  for (const role of ['RECRUITER', 'REVIEWER'] as const) {
    assert.equal(canManageRole('ADMIN', role, 'invite'), true);
    assert.equal(canManageRole('ADMIN', role, 'remove'), true);
  }
  assert.equal(canManageRole('ADMIN', 'ADMIN', 'invite'), false);
  assert.equal(canManageRole('ADMIN', 'ADMIN', 'remove'), false);
  assert.equal(canManageRole('ADMIN', 'OWNER', 'remove'), false);
});

test('recruiters and reviewers cannot assign or remove organization roles', () => {
  for (const actor of ['RECRUITER', 'REVIEWER'] as const) {
    assert.equal(canManageRole(actor, 'REVIEWER', 'invite'), false);
    assert.equal(canManageRole(actor, 'RECRUITER', 'remove'), false);
  }
});
