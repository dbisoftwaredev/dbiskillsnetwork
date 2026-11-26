import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PILOT_DOMAINS, PILOT_ROLE_BENCHMARKS, PILOT_SKILLS } from '../src/taxonomy/taxonomy.seed';
import { evaluateExplorerCheck } from '../src/explorer/explorer.policy';

test('pilot seed defines 6 Telecom/ICT domains, 20 core skills, and 4 role benchmarks', () => {
  assert.equal(PILOT_DOMAINS.length, 6);
  assert.equal(PILOT_SKILLS.length, 20);
  assert.equal(PILOT_ROLE_BENCHMARKS.length, 4);

  const domainSlugs = new Set(PILOT_DOMAINS.map((d) => d.slug));
  const skillSlugs = new Set(PILOT_SKILLS.map((s) => s.slug));
  for (const skill of PILOT_SKILLS) {
    assert.ok(domainSlugs.has(skill.domainSlug), `Unknown domainSlug ${skill.domainSlug}`);
  }
  for (const role of PILOT_ROLE_BENCHMARKS) {
    assert.ok(domainSlugs.has(role.domainSlug), `Unknown role domainSlug ${role.domainSlug}`);
    for (const slug of role.requiredSkillSlugs) {
      assert.ok(skillSlugs.has(slug), `Unknown requiredSkillSlug ${slug} in ${role.slug}`);
    }
  }
});

test('Career Readiness Explorer produces provisional bands and never claims formal verification', () => {
  const foundation = evaluateExplorerCheck({
    requiredSkillSlugs: ['fiber-fusion-splicing', 'otdr-fault-testing', 'ftth-odn-deployment', 'site-earthing-lightning-protection'],
    knownSkillSlugs: [],
    experienceYears: 0,
    hasFieldSafetyTraining: false,
    hasVendorCertification: false,
  });
  assert.equal(foundation.provisional, true);
  assert.equal(foundation.readinessBand, 'FOUNDATION');
  assert.equal(foundation.readinessScore, 0);
  assert.equal(foundation.missingSkillSlugs.length, 4);

  const ready = evaluateExplorerCheck({
    requiredSkillSlugs: ['fiber-fusion-splicing', 'otdr-fault-testing', 'ftth-odn-deployment', 'site-earthing-lightning-protection'],
    knownSkillSlugs: ['fiber-fusion-splicing', 'otdr-fault-testing', 'ftth-odn-deployment', 'site-earthing-lightning-protection'],
    experienceYears: 4,
    hasFieldSafetyTraining: true,
    hasVendorCertification: true,
  });
  assert.equal(ready.provisional, true);
  assert.equal(ready.readinessBand, 'READY_PROVISIONAL');
  assert.equal(ready.readinessScore, 100);
  assert.equal(ready.missingSkillSlugs.length, 0);
});
