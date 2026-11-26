export type PassportVisibility = 'PUBLIC' | 'EMPLOYERS_ONLY' | 'PRIVATE';
export type RplDecisionInput = 'APPROVE' | 'REJECT';

export function buildDefaultHandle(displayName: string | null | undefined, userId: string): string {
  const base = (displayName ?? 'talent')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'talent';
  const suffix = userId.replace(/-/g, '').slice(0, 6).toLowerCase();
  return `${base}-${suffix}`;
}

export function buildRplVerifiedLabel(qualificationCode: string | null | undefined, title: string): string {
  const badge = qualificationCode?.trim() || title.trim().slice(0, 40);
  return `Verified via RPL (${badge})`.slice(0, 120);
}

export function validateRplDecision(decision: RplDecisionInput, reason?: string): string | null {
  if (decision === 'REJECT' && (!reason || reason.trim().length < 3)) {
    return 'A reason of at least 3 characters is required when rejecting an RPL request';
  }
  return null;
}

export function canAccessPassport(
  visibility: PassportVisibility,
  context: { isOwner: boolean; isVerifiedEmployerMember: boolean },
): boolean {
  if (context.isOwner) return true;
  if (visibility === 'PUBLIC') return true;
  if (visibility === 'EMPLOYERS_ONLY') return context.isVerifiedEmployerMember;
  return false;
}

export interface PassportSkillView {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  domainName: string;
  safetyCritical: boolean;
  evidenceTier: 'DECLARED' | 'DEMONSTRATED' | 'VERIFIED';
  confidence: 'VERIFIED' | 'PROVISIONAL' | 'INSUFFICIENT_EVIDENCE';
  proficiency: string | null;
  verificationSource: 'NONE' | 'SKILLVERIFY_ASSESSMENT' | 'RPL_CERTIFICATION';
  verifiedLabel: string | null;
}

export function formatPublicPassport(input: {
  handle: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  primaryGoal: string | null;
  targetOccupation: string | null;
  availabilityStatus: string;
  visibility: PassportVisibility;
  skills: PassportSkillView[];
}) {
  return {
    handle: input.handle,
    displayName: input.displayName,
    headline: input.headline,
    bio: input.bio,
    location: input.location,
    primaryGoal: input.primaryGoal,
    targetOccupation: input.targetOccupation,
    availabilityStatus: input.availabilityStatus,
    visibility: input.visibility,
    skills: input.skills.map((s) => ({
      skillId: s.skillId,
      skillSlug: s.skillSlug,
      skillName: s.skillName,
      domainName: s.domainName,
      safetyCritical: s.safetyCritical,
      evidenceTier: s.evidenceTier,
      confidence: s.confidence,
      proficiency: s.proficiency ? Number(s.proficiency) : null,
      verificationSource: s.verificationSource,
      verifiedLabel: s.verifiedLabel,
    })),
    qrVerificationPath: `/p/${input.handle}`,
  };
}
