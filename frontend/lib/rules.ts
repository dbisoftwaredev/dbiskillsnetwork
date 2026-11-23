// Pure validation and formatting rules shared by forms and server actions.
// Kept free of React and Next imports so they can be unit tested directly.

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string };

/** Mirrors the API rule (12–128 characters) and grades variety beyond it. */
export function passwordStrength(password: string): Strength {
  if (!password) return { score: 0, label: '' };
  if (password.length < PASSWORD_MIN) return { score: 1, label: 'Too short' };
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  const lengthBonus = password.length >= 16 ? 1 : 0;
  const points = classes + lengthBonus;
  if (points >= 4) return { score: 4, label: 'Strong' };
  if (points >= 3) return { score: 3, label: 'Good' };
  return { score: 2, label: 'Fair' };
}

export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return `Use no more than ${PASSWORD_MAX} characters.`;
  return null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function emailProblem(email: string): string | null {
  if (!email) return 'Enter your email address.';
  if (email.length > 254 || !EMAIL.test(email)) return 'Enter a valid email address, like name@company.com.';
  return null;
}

export function normalizeOtp(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

/** CAC numbers are optional; when given they look like RC123456, BN1234567 or IT12345. */
export function normalizeCac(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}
export function cacProblem(input: string): string | null {
  if (!input) return null;
  if (input.length > 32) return 'CAC number is too long.';
  if (!/^(RC|BN|IT|LP|LLP)?\d{3,}$/.test(input)) return 'Use the number on your CAC certificate, for example RC123456.';
  return null;
}

/** Only same-origin paths may be used as post-auth destinations. */
export function safeNext(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}

export type AccountType = 'TALENT' | 'ORGANIZATION_REPRESENTATIVE';
export type AccessClaims = { sub: string; email: string; accountType: AccountType; exp: number };

/** Reads (does not verify) access-token claims for routing. The API verifies every request. */
export function readClaims(token: string | undefined): AccessClaims | null {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const claims = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    if (typeof claims.sub !== 'string' || typeof claims.email !== 'string' || typeof claims.exp !== 'number') return null;
    if (claims.accountType !== 'TALENT' && claims.accountType !== 'ORGANIZATION_REPRESENTATIVE') return null;
    return claims;
  } catch {
    return null;
  }
}

export function isExpired(claims: AccessClaims, nowMs = Date.now()): boolean {
  return claims.exp * 1000 <= nowMs + 10_000;
}

/** Turns an API error body into one sentence a person can act on. */
export function describeApiError(status: number, body: unknown): string {
  if (status === 0 || status === 502 || status === 503 || status === 504) {
    return 'We can’t reach DBI Skills Network right now. Please try again in a moment.';
  }
  if (status === 429) return 'Too many attempts. Wait a minute, then try again.';
  const message = (body as { message?: unknown } | null)?.message;
  const text = Array.isArray(message) ? message[0] : message;
  if (typeof text === 'string' && text && status < 500) {
    const sentence = text.charAt(0).toUpperCase() + text.slice(1);
    return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
  }
  return 'Something went wrong on our side. Please try again.';
}

export const ORGANIZATION_ROLES = [
  { value: 'ADMIN', label: 'Admin', hint: 'Manages the workspace and invites recruiters and reviewers' },
  { value: 'RECRUITER', label: 'Recruiter', hint: 'Finds talent and manages openings' },
  { value: 'REVIEWER', label: 'Reviewer', hint: 'Reviews candidates and evidence' },
] as const;
export type InviteRole = (typeof ORGANIZATION_ROLES)[number]['value'];

export const SECTORS = [
  'Telecommunications',
  'Internet & broadband',
  'Towers & infrastructure',
  'Data centres & cloud',
  'Fintech & digital services',
  'Government & regulation',
  'Training & education',
  'Other',
] as const;

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'RECRUITER' | 'REVIEWER';

/** Mirrors the API policy so the UI only offers actions the API will allow. */
export function canManageRole(actor: OrganizationRole | undefined, target: OrganizationRole): boolean {
  if (!actor || target === 'OWNER') return false;
  if (actor === 'OWNER') return true;
  if (actor === 'ADMIN') return target === 'RECRUITER' || target === 'REVIEWER';
  return false;
}

export const ROLE_LABELS: Record<OrganizationRole, string> = { OWNER: 'Owner', ADMIN: 'Admin', RECRUITER: 'Recruiter', REVIEWER: 'Reviewer' };

export const VERIFICATION_LABELS = {
  UNVERIFIED: { label: 'Not yet verified', tone: 'neutral' },
  PENDING_REVIEW: { label: 'In review', tone: 'gold' },
  VERIFIED: { label: 'Verified by DBI', tone: 'teal' },
  REJECTED: { label: 'Verification declined', tone: 'red' },
} as const;

/** Sign-in page notices, keyed by a short code so the query string can't inject text. */
export const NOTICES = {
  verified: 'Your email is confirmed. Choose how you’ll use your account to continue.',
  reset: 'Your password has been changed. Sign in with your new password.',
  'signed-out': 'You’ve signed out.',
  'mfa-on': 'Email codes are on. Next time you sign in, we’ll email you a code.',
  'setup-expired': 'Your account setup link expired. Sign in to request a new one.',
  'consent-required': 'Accept the Terms of Use and Privacy Notice to create your account.',
  'google-signin-failed': 'Google sign-in didn’t complete. Try again or use your email and password.',
  'google-signup-failed': 'Google sign-up didn’t complete. Try again or create an account with your email.',
} as const;
export function noticeFor(code: unknown): string | null {
  return typeof code === 'string' && code in NOTICES ? NOTICES[code as keyof typeof NOTICES] : null;
}
