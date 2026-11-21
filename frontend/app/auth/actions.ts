'use server';

import { redirect } from 'next/navigation';
import { api, type MfaChallenge, type Tokens } from '../../lib/api';
import { emailProblem, normalizeOtp, passwordProblem, readClaims, safeNext } from '../../lib/rules';
import {
  clearChallenge,
  clearSession,
  forgetRefreshToken,
  homeFor,
  readChallenge,
  readRefreshToken,
  requireSession,
  storeChallenge,
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
  const accountType = text(form, 'accountType');
  const values = { email, accountType };
  const fields: Record<string, string> = {};

  if (accountType !== 'TALENT' && accountType !== 'ORGANIZATION_REPRESENTATIVE') fields.accountType = 'Choose how you’ll use DBI Skills Network.';
  const emailIssue = emailProblem(email);
  if (emailIssue) fields.email = emailIssue;
  const passwordIssue = passwordProblem(password);
  if (passwordIssue) fields.password = passwordIssue;
  if (form.get('terms') !== 'on') fields.terms = 'You need to accept the Terms of Use to continue.';
  if (form.get('privacy') !== 'on') fields.privacy = 'You need to acknowledge the Privacy Notice to continue.';
  if (Object.keys(fields).length) return { fields, values };

  const result = await api('/auth/signup', {
    body: {
      email,
      password,
      accountType,
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
  const result = await api('/auth/verify-email', { body: { token: text(form, 'token') } });
  if (!result.ok) {
    return { error: result.status === 401 || result.status === 400 ? 'This link has expired or was already used.' : result.message };
  }
  return { done: true };
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

  const result = await api<Tokens | MfaChallenge>('/auth/signin', { body: { email, password } });
  if (!result.ok) return { error: result.message, values };

  if ('mfaRequired' in result.data) {
    await storeChallenge(result.data.challengeToken, result.data.expiresIn, email);
    redirect(`/auth/mfa${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  }
  return finishSignIn(result.data, next);
}

export async function completeMfa(_: FormState, form: FormData): Promise<FormState> {
  const code = normalizeOtp(String(form.get('code') ?? ''));
  const next = safeNext(form.get('next'));
  if (code.length !== 6) return { fields: { code: 'Enter the 6-digit code from your email.' } };

  const { token } = await readChallenge();
  if (!token) return { error: 'This sign-in attempt has expired. Sign in again to get a new code.' };

  const result = await api<Tokens>('/auth/mfa/challenge', { body: { challengeToken: token, code } });
  if (!result.ok) {
    if (result.status === 401) return { fields: { code: 'That code didn’t work. Check it, or sign in again for a new one.' } };
    return { error: result.message };
  }
  await clearChallenge();
  return finishSignIn(result.data, next);
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
