// Talent command centre: shapes from GET /users/me and the pure rules that decide what the
// dashboard shows. Kept free of React and Next so they are unit-tested directly.

export const GOALS = [
  { value: 'FIND_JOB', label: 'Find a job', hint: 'Land a role that fits what I can do' },
  { value: 'GROW_INCOME', label: 'Grow my income', hint: 'Earn more from skills I already have' },
  { value: 'REACH_DREAM_OCCUPATION', label: 'Reach a dream role', hint: 'Get ready for a specific occupation' },
  { value: 'BUILD_EXPERT_REPUTATION', label: 'Build expert reputation', hint: 'Get recognised for deep experience' },
] as const;

export const PERSONAS = [
  { value: 'EARLY_CAREER', label: 'Student or early career' },
  { value: 'EXPERIENCED_TECHNICIAN', label: 'Experienced technician' },
  { value: 'SENIOR_EXPERT', label: 'Senior expert or consultant' },
  { value: 'FREELANCER', label: 'Freelancer or creator' },
] as const;

/** Suggestions only: people can type any role. Telecom-first pilot pathways come first. */
export const ROLE_SUGGESTIONS = [
  'Network Engineer', 'Fibre Optic Technician', 'RF / RAN Engineer', 'NOC Engineer', 'Field Deployment Technician',
  'Cloud Support Engineer', 'Cybersecurity Analyst', 'Software Developer', 'Data Analyst', 'UI/UX Designer',
];

export type Goal = (typeof GOALS)[number]['value'];
export type Persona = (typeof PERSONAS)[number]['value'];

export type Me = {
  id: string;
  email: string;
  accountType: 'TALENT' | 'ORGANIZATION_REPRESENTATIVE';
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  profile: { displayName: string | null; location: string | null };
  onboarding: { primaryGoal: Goal | null; persona: Persona | null; targetOccupation: string | null; step: string; completedAt: string | null };
};

export const goalLabel = (goal: Goal | null) => GOALS.find((g) => g.value === goal)?.label ?? null;
export const personaLabel = (persona: Persona | null) => PERSONAS.find((p) => p.value === persona)?.label ?? null;

export type Step = { id: string; label: string; state: 'done' | 'todo' | 'soon' };

/** Setup checklist. "soon" items are features not yet live; they never count against progress. */
export function checklist(me: Me, skillCount: number | null = null): Step[] {
  const o = me.onboarding;
  return [
    { id: 'account', label: 'Create your account', state: 'done' },
    { id: 'email', label: 'Confirm your email', state: me.emailVerified ? 'done' : 'todo' },
    { id: 'goal', label: 'Choose your goal', state: o.primaryGoal ? 'done' : 'todo' },
    { id: 'role', label: 'Pick a target role', state: o.targetOccupation ? 'done' : 'todo' },
    { id: 'mfa', label: 'Turn on two-step sign-in', state: me.mfaEnabled ? 'done' : 'todo' },
    { id: 'skills', label: 'Add your first skills', state: skillCount === null ? 'soon' : skillCount > 0 ? 'done' : 'todo' },
    { id: 'verify', label: 'Take a skills diagnostic', state: 'soon' },
  ];
}

export function progress(steps: Step[]): number {
  const live = steps.filter((s) => s.state !== 'soon');
  return live.length ? Math.round((live.filter((s) => s.state === 'done').length / live.length) * 100) : 0;
}

export type NextStep = { id: string; title: string; body: string; cta?: string; href?: string };

/** The single most useful thing to do next, in priority order. */
export function nextStep(me: Me, skillCount: number | null = null): NextStep {
  const o = me.onboarding;
  if (!o.primaryGoal) {
    return { id: 'goal', title: 'Start with what you want to achieve', body: 'Your goal shapes everything here: the roles we suggest, the gaps we highlight and the opportunities we show you.', cta: 'Choose your goal', href: '#career' };
  }
  if (!o.targetOccupation) {
    return { id: 'role', title: 'Pick a role to aim for', body: 'Choose a target role so your readiness, gaps and learning can be measured against something real.', cta: 'Choose a target role', href: '#career' };
  }
  if (!me.emailVerified) {
    return { id: 'email', title: 'Confirm your email', body: 'We use it for sign-in codes and important account messages. Open the confirmation link we sent to your inbox. It may be in spam or promotions.' };
  }
  if (skillCount === 0) {
    return { id: 'skills', title: 'Add your first skills', body: 'Start with what you can already do. Each skill you add appears on your passport, and you can strengthen it with evidence later.', cta: 'Add skills', href: '/talent/skills' };
  }
  if (!me.mfaEnabled) {
    return { id: 'mfa', title: 'Protect your record', body: 'Your passport will hold verified skills employers trust. Add a second sign-in step so only you can change it.', cta: 'Turn on two-step sign-in', href: '/account/security' };
  }
  return { id: 'ready', title: 'Find roles that fit your evidence', body: 'Your basics are in place. See open roles matched to the skills on your passport. Applying is always free.', cta: 'Browse opportunities', href: '/talent/opportunities' };
}

/** "Good morning" etc. in Nigeria's time zone, where the pilot runs. */
export function greeting(now = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Africa/Lagos' }).format(now));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export function firstName(me: Me): string | null {
  const name = me.profile.displayName?.trim();
  return name ? name.split(/\s+/)[0] : null;
}

export function initials(me: Me): string {
  const name = me.profile.displayName?.trim();
  if (!name) return me.email.charAt(0).toUpperCase();
  return name.split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
}

// ---------------------------------------------------------------------------------------------
// Passport, skills, diagnostics, opportunities and learning. Shapes follow the planned endpoints
// (PLAN-0002 /passport/*, /taxonomy/skills; PLAN-0003 /assessments, /opportunities;
// PLAN-0004 /learning/courses) and .agents/docs/CROSS_PLAN_CONTRACTS.md: evidence tier,
// confidence and proficiency are separate, and proficiency stays null until rubric evidence exists.

export type EvidenceTier = 'DECLARED' | 'DEMONSTRATED' | 'VERIFIED';
export type Confidence = 'VERIFIED' | 'PROVISIONAL' | 'INSUFFICIENT_EVIDENCE';
export type Visibility = 'PRIVATE' | 'EMPLOYERS_ONLY' | 'PUBLIC';

export type PassportSkill = {
  id: string; skillId: string; name: string; domain: string;
  evidenceTier: EvidenceTier; confidence: Confidence; proficiency: number | null;
  evidenceUrl: string | null; addedAt: string;
};
export type Passport = { handle: string; visibility: Visibility; skills: PassportSkill[] };
export type PublicPassport = { handle: string; displayName: string | null; headline: string | null; location: string | null; skills: Pick<PassportSkill, 'name' | 'domain' | 'evidenceTier'>[] };
export type TaxonomySkill = { id: string; name: string; domain: string };
export type Assessment = { id: string; title: string; domain: string; skills: string[]; minutes: number; questions: number; format: string };
export type Opportunity = {
  id: string; title: string; organization: string; location: string; type: 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FIELD_DEPLOYMENT';
  workMode: 'ON_SITE' | 'HYBRID' | 'REMOTE'; skills: string[]; summary: string; postedAt: string; applied: boolean;
};
export type Course = { id: string; title: string; provider: string; format: string; hours: number; domain: string; skills: string[]; sponsored: boolean };

export const TIER_LABELS: Record<EvidenceTier, string> = { DECLARED: 'Declared', DEMONSTRATED: 'Demonstrated', VERIFIED: 'DBI verified' };
export const CONFIDENCE_LABELS: Record<Confidence, string> = { VERIFIED: 'Verified evidence', PROVISIONAL: 'Provisional', INSUFFICIENT_EVIDENCE: 'Needs evidence' };
export const VISIBILITY = [
  { value: 'PRIVATE', label: 'Private', hint: 'Only you can see your passport.' },
  { value: 'EMPLOYERS_ONLY', label: 'Verified employers', hint: 'Employers DBI has verified can view it when you apply or share it.' },
  { value: 'PUBLIC', label: 'Anyone with the link', hint: 'Your share link opens a public page. Contact details are never shown.' },
] as const;
export const OPPORTUNITY_TYPES: Record<Opportunity['type'], string> = { FULL_TIME: 'Full-time', INTERNSHIP: 'Internship', CONTRACT: 'Contract', FIELD_DEPLOYMENT: 'Field deployment' };
export const WORK_MODES: Record<Opportunity['workMode'], string> = { ON_SITE: 'On site', HYBRID: 'Hybrid', REMOTE: 'Remote' };

export function tierCounts(skills: Pick<PassportSkill, 'evidenceTier'>[]) {
  return {
    DECLARED: skills.filter((s) => s.evidenceTier === 'DECLARED').length,
    DEMONSTRATED: skills.filter((s) => s.evidenceTier === 'DEMONSTRATED').length,
    VERIFIED: skills.filter((s) => s.evidenceTier === 'VERIFIED').length,
  };
}

/** How many of a listing's required skills the talent already has on their passport (case-insensitive). */
export function skillMatch(required: string[], mine: { name: string }[]) {
  const have = new Set(mine.map((s) => s.name.toLowerCase()));
  const matched = required.filter((r) => have.has(r.toLowerCase()));
  return { matched, missing: required.filter((r) => !have.has(r.toLowerCase())) };
}

/** A planned endpoint that the API does not serve yet answers 404 or 501. */
export const notLiveYet = (status: number) => status === 404 || status === 501;
