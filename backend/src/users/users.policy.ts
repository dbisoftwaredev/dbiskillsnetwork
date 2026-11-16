export const ONBOARDING_GOALS = ['FIND_JOB', 'GROW_INCOME', 'REACH_DREAM_OCCUPATION', 'BUILD_EXPERT_REPUTATION'] as const;
export const TALENT_PERSONAS = ['EARLY_CAREER', 'EXPERIENCED_TECHNICIAN', 'SENIOR_EXPERT', 'FREELANCER'] as const;
export const ONBOARDING_STEPS = ['GOAL', 'ASPIRATION', 'SKILLS', 'INSIGHT', 'PASSPORT', 'COMPLETED'] as const;
export const NOTIFICATION_FREQUENCIES = ['IMMEDIATE', 'DAILY_DIGEST', 'WEEKLY_DIGEST', 'NONE'] as const;

export type OnboardingGoal = typeof ONBOARDING_GOALS[number];
export type TalentPersona = typeof TALENT_PERSONAS[number];
export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export type NotificationFrequency = typeof NOTIFICATION_FREQUENCIES[number];

export const DEFAULT_COMMUNICATION_PREFERENCES = Object.freeze({
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  whatsappEnabled: false,
  frequency: 'IMMEDIATE' as NotificationFrequency,
});

/**
 * Save-and-resume rule: onboarding may move forward or backward freely, but
 * may only be marked COMPLETED once a primary goal has been chosen.
 */
export function canCompleteOnboarding(goal: OnboardingGoal | null | undefined): boolean {
  return goal != null;
}

/**
 * Transactional service messages are never governed by marketing consent.
 * Marketing may only be sent with an explicit, current opt-in on a channel the user enabled.
 */
export function mayReceiveMarketing(
  marketingConsent: boolean,
  prefs: { emailEnabled: boolean; frequency: NotificationFrequency },
): boolean {
  return marketingConsent && prefs.emailEnabled && prefs.frequency !== 'NONE';
}

