import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
require('ts-node').register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });

function load(env) {
  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = env;
  const path = require.resolve('../lib/demo.ts');
  delete require.cache[path];
  try { return require(path); } finally { process.env.NODE_ENV = before; }
}

test('demo sign-in is off in production and real tokens are never intercepted', () => {
  const prod = load('production');
  assert.equal(prod.DEMO_ENABLED, false);
  const dev = load('development');
  const { accessToken } = dev.demoTokens('a@example.com', 'TALENT');
  assert.equal(prod.isDemoRequest(accessToken, undefined), false);
  assert.equal(dev.isDemoRequest(accessToken, undefined), true);
  assert.equal(dev.isDemoRequest('real.eyJzdWIiOiJ4In0.sig', undefined), false);
  assert.equal(dev.isDemoRequest(undefined, undefined), false);
});

test('demo talent profile saves and reads back', () => {
  const dev = load('development');
  const { accessToken } = dev.demoTokens('talent@example.com', 'TALENT');
  const saved = dev.demoResponse('/users/me', 'PATCH', { primaryGoal: 'FIND_JOB', targetOccupation: 'NOC Engineer' }, accessToken);
  assert.equal(saved.ok, true);
  const me = dev.demoResponse('/users/me', 'GET', undefined, accessToken);
  assert.equal(me.data.onboarding.targetOccupation, 'NOC Engineer');
  assert.equal(me.data.emailVerified, true);
});

test('demo organization workspace: create, invite, list, remove', () => {
  const dev = load('development');
  const { accessToken } = dev.demoTokens('owner@example.com', 'ORGANIZATION_REPRESENTATIVE');
  const created = dev.demoResponse('/organizations', 'POST', { name: 'Fibrelink Ltd' }, accessToken);
  assert.equal(created.data.role, 'OWNER');
  const id = created.data.id;
  assert.equal(dev.demoResponse(`/organizations/${id}/members/invite`, 'POST', { email: 'rec@example.com', role: 'RECRUITER' }, accessToken).ok, true);
  assert.equal(dev.demoResponse(`/organizations/${id}/members/invite`, 'POST', { email: 'rec@example.com', role: 'RECRUITER' }, accessToken).status, 409);
  const members = dev.demoResponse(`/organizations/${id}/members`, 'GET', undefined, accessToken).data;
  assert.equal(members.length, 2);
  const recruiter = members.find((m) => m.role === 'RECRUITER');
  dev.demoResponse(`/organizations/${id}/members/${recruiter.userId}`, 'DELETE', undefined, accessToken);
  assert.equal(dev.demoResponse(`/organizations/${id}/members`, 'GET', undefined, accessToken).data.length, 1);
});
