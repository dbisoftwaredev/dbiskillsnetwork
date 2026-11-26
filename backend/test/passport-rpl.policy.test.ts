import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDefaultHandle,
  buildRplVerifiedLabel,
  canAccessPassport,
  formatPublicPassport,
  validateRplDecision,
} from '../src/passport/passport.policy';

test('Passport visibility enforces PUBLIC, EMPLOYERS_ONLY, and PRIVATE boundaries', () => {
  assert.equal(canAccessPassport('PUBLIC', { isOwner: false, isVerifiedEmployerMember: false }), true);
  assert.equal(canAccessPassport('EMPLOYERS_ONLY', { isOwner: false, isVerifiedEmployerMember: false }), false);
  assert.equal(canAccessPassport('EMPLOYERS_ONLY', { isOwner: false, isVerifiedEmployerMember: true }), true);
  assert.equal(canAccessPassport('PRIVATE', { isOwner: false, isVerifiedEmployerMember: true }), false);
  assert.equal(canAccessPassport('PRIVATE', { isOwner: true, isVerifiedEmployerMember: false }), true);
});

test('RPL decision requires a reason when rejecting and formats verified RPL label cleanly', () => {
  assert.ok(validateRplDecision('REJECT', ''));
  assert.ok(validateRplDecision('REJECT', 'no'));
  assert.equal(validateRplDecision('REJECT', 'Certificate ID could not be validated'), null);
  assert.equal(validateRplDecision('APPROVE'), null);

  assert.equal(buildRplVerifiedLabel('CCNA', 'Cisco Certified Network Associate'), 'Verified via RPL (CCNA)');
  assert.equal(buildRplVerifiedLabel(null, 'Huawei HCIA-Datacom'), 'Verified via RPL (Huawei HCIA-Datacom)');
});

test('Public Passport preserves RPL verified labels and redacts private fields', () => {
  const output = formatPublicPassport({
    handle: buildDefaultHandle('Kelechi Okafor', '12345678-1234-1234-1234-123456789012'),
    displayName: 'Kelechi Okafor',
    headline: 'IP & RF Engineer',
    bio: '6 years telecom field experience',
    location: 'Port Harcourt',
    primaryGoal: 'FIND_JOB',
    targetOccupation: 'NOC & IP Core Network Engineer',
    availabilityStatus: 'OPEN_TO_OPPORTUNITIES',
    visibility: 'PUBLIC',
    skills: [
      {
        id: 'ps-1',
        skillId: 'skill-1',
        skillSlug: 'ip-routing-bgp-ospf',
        skillName: 'IP Routing (OSPF & BGP)',
        domainName: 'IP Networking & NOC',
        safetyCritical: false,
        evidenceTier: 'VERIFIED',
        confidence: 'VERIFIED',
        proficiency: null,
        verificationSource: 'RPL_CERTIFICATION',
        verifiedLabel: 'Verified via RPL (CCNA)',
      },
    ],
  });

  assert.equal(output.handle, 'kelechi-okafor-123456');
  assert.equal(output.skills[0].evidenceTier, 'VERIFIED');
  assert.equal(output.skills[0].verificationSource, 'RPL_CERTIFICATION');
  assert.equal(output.skills[0].verifiedLabel, 'Verified via RPL (CCNA)');
  assert.equal('email' in output, false);
});
