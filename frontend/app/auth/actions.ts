'use server';

import { DEMO_ENABLED, demoTokens } from '../../lib/demo';

import { redirect } from 'next/navigation';
import { api, type MfaChallenge, type Tokens } from '../../lib/api';
import { emailProblem, normalizeOtp, passwordProblem, readClaims, safeNext } from '../../lib/rules';
import {
  clearChallenge,
  clearAccountSetupToken,
  clearSession,
  forgetRefreshToken,
  homeFor,
  readChallenge,
  readAccountSetupToken,
  readRefreshToken,
  requireSession,
  storeChallenge,
  storeAccountSetupToken,
  storeTokens,
  type Session,
} from '../../lib/session';

export type FormState = {
  error?: string;
  fields?: Record<string, string>;
  values?: Record<string, string>;
  done?: boolean;
  email?: string;
  notice?: string;
};

type AccountSetupRequired = { accountSetupRequired: true; setupToken: string };
type GoogleAuthResult = Tokens | MfaChallenge | AccountSetupRequired;
const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

async function finishSignIn(tokens: Tokens, next: string): Promise<never> {
  await storeTokens(tokens);
  const claims = readClaims(tokens.accessToken);
  if (!claims) redirect('/auth/login');
  const session: Session = { ...claims, accessToken: tokens.accessToken };
  redirect(safeNext(next) || (await homeFor(session)));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, 'email').toLowerCase();
  const password = String(form.get('password') ?? '');
  const values = { email };
  const fields: Record<string, string> = {};

  const emailIssue = emailProblem(email);
  if (emailIssue) fields.email = emailIssue;
  const passwordIssue = passwordProblem(password);
  if (passwordIssue) fields.password = passwordIssue;
  if (form.get('terms') !== 'on') fields.terms = 'You need to accept the Terms of Use to continue.';
  if (form.get('privacy') !== 'on') fields.privacy = 'You need to acknowledge the Privacy Notice to continue.';
  if (Object.keys(fields).length) return { fields, values };

  // Local demo: skip email confirmation and go straight in.
  if (DEMO_ENABLED) {
    await storeTokens(demoTokens(email, 'TALENT'));
    redirect('/auth/choose-account');
  }

  const result = await api('/auth/signup', {
    body: {
      email,
      password,
      termsAccepted: true,
      privacyAccepted: true,
      marketingOptIn: form.get('marketing') === 'on',
    },
  });
  if (!result.ok) {
    if (result.status === 409) return { fields: { email: 'An account already uses this email. Sign in instead.' }, values };
    return { error: result.message, values };
  }
  return { done: true, email };
}

export async function verifyEmail(_: FormState, form: FormData): Promise<FormState> {
  const result = await api<{ verified: true; setupToken: string }>('/auth/verify-email', { body: { token: text(form, 'token') } });
  if (!result.ok) {
    return { error: result.status === 401 || result.status === 400 ? 'This link has expired or was already used.' : result.message };
  }
  await storeAccountSetupToken(result.data.setupToken);
  redirect('/auth/choose-account');
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, 'email').toLowerCase();
  const password = String(form.get('password') ?? '');
  const next = safeNext(form.get('next'));
  const values = { email };

  const emailIssue = emailProblem(email);
  if (emailIssue || !password) {
    return { fields: { ...(emailIssue ? { email: emailIssue } : {}), ...(!password ? { password: 'Enter your password.' } : {}) }, values };
  }

  // Local demo: any email and password signs in (next dev only; see lib/demo.ts).
  if (DEMO_ENABLED) {
    return finishSignIn(demoTokens(email), next);
  }

  const result = await api<Tokens | MfaChallenge | AccountSetupRequired>('/auth/signin', { body: { email, password } });
  if (!result.ok) return { error: result.message, values };

  if ('mfaRequired' in result.data) {
    await storeChallenge(result.data.challengeToken, result.data.expiresIn, email);
    redirect(`/auth/mfa${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  }
  if ('accountSetupRequired' in result.data) {
    await storeAccountSetupToken(result.data.setupToken);
    redirect('/auth/choose-account');
  }
  return finishSignIn(result.data, next);
}

export async function signInWithGoogle(form: FormData): Promise<never> {
  const next = safeNext(form.get('next'));
  const result = await api<GoogleAuthResult>('/auth/google', {
    body: {
      credential: text(form, 'credential'),
      challengeToken: text(form, 'challengeToken'),
      mode: 'SIGN_IN',
    },
  });
  if (!result.ok) redirect('/auth/login?notice=google-signin-failed');
  if ('mfaRequired' in result.data) {
    await storeChallenge(result.data.challengeToken, result.data.expiresIn, result.data.email);
    redirect(`/auth/mfa${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  }
  if ('accountSetupRequired' in result.data) {
    await storeAccountSetupToken(result.data.setupToken);
    redirect('/auth/choose-account');
  }
  return finishSignIn(result.data, next);
}

export async function signUpWithGoogle(form: FormData): Promise<never> {
  if (form.get('terms') !== 'on' || form.get('privacy') !== 'on') redirect('/auth/signup?notice=consent-required');
  const result = await api<GoogleAuthResult>('/auth/google', {
    body: {
      credential: text(form, 'credential'),
      challengeToken: text(form, 'challengeToken'),
      mode: 'SIGN_UP',
      termsAccepted: true,
      privacyAccepted: true,
      marketingOptIn: form.get('marketing') === 'on',
    },
  });
  if (!result.ok || !('accountSetupRequired' in result.data)) redirect('/auth/signup?notice=google-signup-failed');
  await storeAccountSetupToken(result.data.setupToken);
  redirect('/auth/choose-account');
}

export async function completeMfa(_: FormState, form: FormData): Promise<FormState> {
  const code = normalizeOtp(String(form.get('code') ?? ''));
  const next = safeNext(form.get('next'));
  if (code.length !== 6) return { fields: { code: 'Enter the 6-digit code from your email.' } };

  const { token } = await readChallenge();
  if (!token) return { error: 'This sign-in attempt has expired. Sign in again to get a new code.' };

  const result = await api<Tokens | AccountSetupRequired>('/auth/mfa/challenge', { body: { challengeToken: token, code } });
  if (!result.ok) {
    if (result.status === 401) return { fields: { code: 'That code didn’t work. Check it, or sign in again for a new one.' } };
    return { error: result.message };
  }
  await clearChallenge();
  if ('accountSetupRequired' in result.data) {
    await storeAccountSetupToken(result.data.setupToken);
    redirect('/auth/choose-account');
  }
  return finishSignIn(result.data, next);
}

export async function completeAccountSetup(_: FormState, form: FormData): Promise<FormState> {
  const accountType = text(form, 'accountType');
  if (accountType !== 'TALENT' && accountType !== 'ORGANIZATION_REPRESENTATIVE') {
    return { fields: { accountType: 'Choose individual or organization to continue.' } };
  }

  if (DEMO_ENABLED) {
    const session = await requireSession('/auth/choose-account');
    return finishSignIn(demoTokens(session.email, accountType), '');
  }

  const setupToken = await readAccountSetupToken();
  if (!setupToken) redirect('/auth/login?notice=setup-expired');
  const result = await api<Tokens>('/auth/complete-account-setup', { body: { setupToken, accountType } });
  if (!result.ok) {
    if (result.status === 401) {
      await clearAccountSetupToken();
      redirect('/auth/login?notice=setup-expired');
    }
    return { error: result.message };
  }
  await clearAccountSetupToken();
  return finishSignIn(result.data, '');
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, 'email').toLowerCase();
  const issue = emailProblem(email);
  if (issue) return { fields: { email: issue }, values: { email } };
  const result = await api('/auth/forgot-password', { body: { email } });
  if (!result.ok) return { error: result.message, values: { email } };
  return { done: true, email };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get('password') ?? '');
  const confirm = String(form.get('confirm') ?? '');
  const fields: Record<string, string> = {};
  const issue = passwordProblem(password);
  if (issue) fields.password = issue;
  else if (password !== confirm) fields.confirm = 'Passwords don’t match.';
  if (Object.keys(fields).length) return { fields };

  const result = await api('/auth/reset-password', { body: { token: text(form, 'token'), password } });
  if (!result.ok) {
    return { error: result.status === 401 ? 'This reset link has expired or was already used. Request a new one.' : result.message };
  }
  return { done: true };
}

export async function signOut() {
  const refreshToken = await readRefreshToken();
  if (refreshToken) await api('/auth/signout', { body: { refreshToken } });
  await clearSession();
  redirect('/auth/login?notice=signed-out');
}

/** Emails a code to begin turning on sign-in codes for the signed-in account. */
export async function startMfaSetup(_: FormState): Promise<FormState> {
  const session = await requireSession('/account/security');
  const result = await api<MfaChallenge>('/auth/mfa/setup', { token: session.accessToken });
  if (!result.ok) {
    if (result.status === 409) return { notice: 'Email codes are already on for your account.' };
    return { error: result.message };
  }
  await storeChallenge(result.data.challengeToken, result.data.expiresIn, session.email);
  redirect('/account/security?step=verify');
}

export async function confirmMfaSetup(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireSession('/account/security');
  const code = normalizeOtp(String(form.get('code') ?? ''));
  if (code.length !== 6) return { fields: { code: 'Enter the 6-digit code from your email.' } };

  const { token } = await readChallenge();
  if (!token) return { error: 'This code has expired. Send a new one to try again.' };

  const result = await api('/auth/mfa/verify', { token: session.accessToken, body: { challengeToken: token, code } });
  if (!result.ok) {
    if (result.status === 401) return { fields: { code: 'That code didn’t work. Check it, or send a new one.' } };
    if (result.status === 409) {
      await clearChallenge();
      return { notice: 'Email codes are already on for your account.' };
    }
    return { error: result.message };
  }
  await clearChallenge();
  // The API revokes every refresh session when MFA turns on, so the stored one is now dead.
  await forgetRefreshToken();
  return { done: true };
}
