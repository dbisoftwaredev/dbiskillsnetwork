export type ProvisionalReadinessBand = 'FOUNDATION' | 'NEAR_READY' | 'READY_PROVISIONAL';

export interface ExplorerCheckInput {
  requiredSkillSlugs: string[];
  knownSkillSlugs: string[];
  experienceYears: number;
  hasFieldSafetyTraining: boolean;
  hasVendorCertification: boolean;
}

export interface ExplorerCheckEvaluation {
  provisional: true;
  readinessScore: number;
  readinessBand: ProvisionalReadinessBand;
  matchedSkillSlugs: string[];
  missingSkillSlugs: string[];
  recommendedNextStep: string;
}

export function evaluateExplorerCheck(input: ExplorerCheckInput): ExplorerCheckEvaluation {
  const known = new Set(input.knownSkillSlugs.map((s) => s.trim().toLowerCase()));
  const matchedSkillSlugs = input.requiredSkillSlugs.filter((s) => known.has(s.toLowerCase()));
  const missingSkillSlugs = input.requiredSkillSlugs.filter((s) => !known.has(s.toLowerCase()));

  const skillRatio = input.requiredSkillSlugs.length > 0
    ? matchedSkillSlugs.length / input.requiredSkillSlugs.length
    : 0;

  let score = Math.round(skillRatio * 70);
  if (input.experienceYears >= 3) score += 15;
  else if (input.experienceYears >= 1) score += 8;
  if (input.hasFieldSafetyTraining) score += 8;
  if (input.hasVendorCertification) score += 7;
  score = Math.max(0, Math.min(100, score));

  let readinessBand: ProvisionalReadinessBand = 'FOUNDATION';
  if (score >= 80) readinessBand = 'READY_PROVISIONAL';
  else if (score >= 50) readinessBand = 'NEAR_READY';

  const recommendedNextStep = missingSkillSlugs.length > 0
    ? `Create your free Digital Skills Passport and verify ${missingSkillSlugs[0]} via SkillVerify or RPL.`
    : 'Create your free Digital Skills Passport and complete SkillVerify or RPL verification to earn DBI-Verified badges.';

  return {
    provisional: true,
    readinessScore: score,
    readinessBand,
    matchedSkillSlugs,
    missingSkillSlugs,
    recommendedNextStep,
  };
}
