export type VerificationStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
export type PlatformRole = 'NONE' | 'DBI_ADMIN' | 'SUPER_ADMIN';
export type VerificationDecisionInput = 'APPROVE' | 'REJECT';

/** An organization may (re)submit only when it is not already pending or verified. */
export function canSubmitForVerification(status: VerificationStatus): boolean {
  return status === 'UNVERIFIED' || status === 'REJECTED';
}

/** Privileged platform actions require a DBI admin role AND enabled MFA. */
export function canReviewVerifications(role: PlatformRole, mfaEnabled: boolean): boolean {
  return (role === 'DBI_ADMIN' || role === 'SUPER_ADMIN') && mfaEnabled;
}

/** Rejections must carry a human-readable reason. */
export function validateDecision(decision: VerificationDecisionInput, reason?: string | null): string | null {
  if (decision === 'REJECT' && !reason?.trim()) return 'A reason is required when rejecting a verification';
  return null;
}

export function statusAfterDecision(decision: VerificationDecisionInput): VerificationStatus {
  return decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
}

