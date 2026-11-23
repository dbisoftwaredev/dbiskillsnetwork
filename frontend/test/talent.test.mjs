import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
require('ts-node').register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });
const { checklist, progress, nextStep, greeting, firstName, initials } = require('../lib/talent.ts');

const me = (over = {}) => ({
  id: 'u1', email: 'ada@example.com', accountType: 'TALENT', emailVerified: true, mfaEnabled: false, createdAt: '2026-11-20T00:00:00Z',
  profile: { displayName: null, location: null },
  onboarding: { primaryGoal: null, persona: null, targetOccupation: null, step: 'GOAL', completedAt: null },
  ...over,
});

test('next step follows goal, role, email, two-step order', () => {
  assert.equal(nextStep(me()).id, 'goal');
  const withGoal = me({ onboarding: { ...me().onboarding, primaryGoal: 'FIND_JOB' } });
  assert.equal(nextStep(withGoal).id, 'role');
  const withRole = me({ onboarding: { ...withGoal.onboarding, targetOccupation: 'NOC Engineer' } });
  assert.equal(nextStep(withRole).id, 'mfa');
  assert.equal(nextStep({ ...withRole, emailVerified: false }).id, 'email');
  assert.equal(nextStep({ ...withRole, mfaEnabled: true }).id, 'ready');
});

test('progress ignores features that are not live yet', () => {
  const steps = checklist(me());
  assert.ok(steps.some((s) => s.state === 'soon'));
  assert.equal(progress(steps), 40); // account + email done out of 5 live steps
  const done = me({ mfaEnabled: true, onboarding: { ...me().onboarding, primaryGoal: 'FIND_JOB', targetOccupation: 'Data Analyst' } });
  assert.equal(progress(checklist(done)), 100);
});

test('names and greeting', () => {
  assert.equal(firstName(me()), null);
  assert.equal(initials(me()), 'A');
  const named = me({ profile: { displayName: 'Ada  Okafor', location: null } });
  assert.equal(firstName(named), 'Ada');
  assert.equal(initials(named), 'AO');
  assert.equal(greeting(new Date('2026-11-22T07:00:00Z')), 'Good morning'); // 08:00 in Lagos
  assert.equal(greeting(new Date('2026-11-22T19:00:00Z')), 'Good evening');
});
