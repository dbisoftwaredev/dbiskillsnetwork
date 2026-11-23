'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CheckField, ExpiryCountdown, OtpField, PasswordField, SubmitButton, TextField } from '../../components/fields';
import { SentState } from '../../components/shells';
import { Alert } from '../../components/ui';
import {
  completeAccountSetup,
  completeMfa,
  confirmMfaSetup,
  requestPasswordReset,
  resetPassword,
  signIn,
  signInWithGoogle,
  signUp,
  signUpWithGoogle,
  startMfaSetup,
  verifyEmail,
  type FormState,
} from './actions';

const empty: FormState = {};

type GoogleResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: { client_id: string; nonce: string; callback(response: GoogleResponse): void }): void;
          renderButton(element: HTMLElement, options: { theme: string; size: string; shape: string; text: string; width: number }): void;
        };
      };
    };
  }
}

function GoogleAuthButton({ mode }: { mode: 'SIGN_IN' | 'SIGN_UP' }) {
  const container = useRef<HTMLDivElement>(null);
  const submitter = useRef<HTMLButtonElement>(null);
  const credentialField = useRef<HTMLInputElement>(null);
  const challengeField = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !container.current) return;
    let active = true;
    const showButton = (challengeToken: string) => {
      if (!active || !container.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: challengeToken,
        callback: ({ credential }) => {
          if (!credentialField.current || !challengeField.current || !submitter.current) return;
          credentialField.current.value = credential ?? '';
          challengeField.current.value = challengeToken;
          const form = submitter.current.form;
          if (form && credential) form.requestSubmit(submitter.current);
          else setError('Google sign-in did not return a valid credential. Try again.');
        },
      });
      window.google.accounts.id.renderButton(container.current, {
        theme: 'outline', size: 'large', shape: 'rect', text: 'continue_with', width: Math.min(container.current.clientWidth, 360),
      });
    };

    void fetch('/api/v1/auth/google/challenge', { method: 'POST', headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Google sign-in is not available right now.');
        const body = await response.json() as { challengeToken?: string };
        if (!body.challengeToken) throw new Error('Google sign-in is not available right now.');
        return body.challengeToken;
      })
      .then((challengeToken) => {
        if (window.google) {
          showButton(challengeToken);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => showButton(challengeToken);
        script.onerror = () => setError('Google sign-in could not load. Try again or use your email.');
        document.head.append(script);
      })
      .catch(() => setError('Google sign-in is not available right now. Try your email instead.'));

    return () => { active = false; };
  }, [clientId]);

  if (!clientId) return <p className="ui-muted">Google sign-in is not configured yet.</p>;
  return (
    <div className="ui-google-auth">
      {error ? <Alert tone="info">{error}</Alert> : null}
      <div ref={container} className="ui-google-button" />
      <input ref={credentialField} type="hidden" name="credential" />
      <input ref={challengeField} type="hidden" name="challengeToken" />
      <button ref={submitter} type="submit" formAction={mode === 'SIGN_IN' ? signInWithGoogle : signUpWithGoogle} hidden>
        Continue with Google
      </button>
    </div>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUp, empty);

  if (state.done) {
    return (
      <SentState title="Check your email" action={<a className="ui-button ui-button-ghost" href="/auth/login">Go to sign in</a>}>
        <p>We sent a confirmation link to <strong>{state.email}</strong>. Open it to activate your account.</p>
        <p className="ui-muted">Can’t find it? Check spam or promotions. The link works once.</p>
      </SentState>
    );
  }

  const f = state.fields ?? {};
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <TextField name="email" label="Email" type="email" autoComplete="email"
        required maxLength={254} defaultValue={state.values?.email} error={f.email} />
      <PasswordField meter autoComplete="new-password" error={f.password} />
      <div className="ui-consents">
        <CheckField name="terms" required error={f.terms}>I accept the <a href="/legal/terms" target="_blank" rel="noopener">Terms of Use</a></CheckField>
        <CheckField name="privacy" required error={f.privacy}>I’ve read the <a href="/legal/privacy" target="_blank" rel="noopener">Privacy Notice</a> and understand how my data is used</CheckField>
        <CheckField name="marketing">Send me occasional news about programmes and opportunities <span className="ui-muted">(optional)</span></CheckField>
      </div>
      <p className="ui-muted ui-center">Or create an account with</p>
      <GoogleAuthButton mode="SIGN_UP" />
      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}

export function AccountTypeForm() {
  const [state, action] = useActionState(completeAccountSetup, empty);
  const f = state.fields ?? {};
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <fieldset className={`ui-choices${f.accountType ? ' has-error' : ''}`} aria-describedby={f.accountType ? 'account-type-error' : undefined}>
        <legend>How will you use DBI Skills Network?</legend>
        <label className="ui-choice">
          <input type="radio" name="accountType" value="TALENT" defaultChecked />
          <span className="ui-choice-text"><strong>As an individual</strong><span>Build my skills and career</span></span>
        </label>
        <label className="ui-choice">
          <input type="radio" name="accountType" value="ORGANIZATION_REPRESENTATIVE" />
          <span className="ui-choice-text"><strong>For an organization</strong><span>Hire or develop talent</span></span>
        </label>
        {f.accountType ? <p className="ui-error" id="account-type-error">{f.accountType}</p> : null}
      </fieldset>
      <SubmitButton pendingLabel="Setting up your account…">Continue</SubmitButton>
    </form>
  );
}

export function SignInForm({ next, email }: { next: string; email?: string }) {
  const [state, action] = useActionState(signIn, empty);
  const f = state.fields ?? {};
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <input type="hidden" name="next" value={next} />
      <TextField name="email" label="Email" type="email" autoComplete="email" required maxLength={254}
        defaultValue={state.values?.email ?? email} error={f.email} autoFocus />
      <PasswordField error={f.password} aside={<a className="ui-label-link" href="/auth/forgot-password">Forgot password?</a>} />
      <p className="ui-muted ui-center">Or sign in with</p>
      <GoogleAuthButton mode="SIGN_IN" />
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}

export function MfaForm({ next, secondsLeft }: { next: string; secondsLeft: number }) {
  const [state, action] = useActionState(completeMfa, empty);
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error} <a href="/auth/login">Sign in again</a></Alert> : null}
      <input type="hidden" name="next" value={next} />
      <OtpField error={state.fields?.code} />
      <ExpiryCountdown seconds={secondsLeft} />
      <SubmitButton pendingLabel="Checking…">Continue</SubmitButton>
    </form>
  );
}

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action] = useActionState(verifyEmail, empty);
  if (state.done) {
    return (
      <SentState icon="check" title="Email confirmed" action={<a className="ui-button ui-button-primary" href="/auth/login?notice=verified">Sign in</a>}>
        <p>Your account is active. Sign in to set up your profile.</p>
      </SentState>
    );
  }
  return (
    <form action={action} className="ui-form">
      {state.error ? <Alert>{state.error} If you’ve already confirmed, <a href="/auth/login">sign in</a>.</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <SubmitButton pendingLabel="Confirming…">Confirm my email</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, empty);
  if (state.done) {
    return (
      <SentState title="Check your email" action={<a className="ui-button ui-button-ghost" href="/auth/login">Back to sign in</a>}>
        <p>If <strong>{state.email}</strong> has an account, we’ve sent a link to reset its password.</p>
        <p className="ui-muted">The link expires in one hour and works once.</p>
      </SentState>
    );
  }
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <TextField name="email" label="Email" type="email" autoComplete="email" required maxLength={254}
        defaultValue={state.values?.email} error={state.fields?.email} autoFocus />
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, empty);
  if (state.done) {
    return (
      <SentState icon="check" title="Password changed" action={<a className="ui-button ui-button-primary" href="/auth/login?notice=reset">Sign in</a>}>
        <p>For your security, we’ve signed you out on every device.</p>
      </SentState>
    );
  }
  const f = state.fields ?? {};
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error} <a href="/auth/forgot-password">Request a new link</a></Alert> : null}
      <input type="hidden" name="token" value={token} />
      <PasswordField label="New password" meter autoComplete="new-password" error={f.password} />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" error={f.confirm} />
      <SubmitButton pendingLabel="Saving…">Change password</SubmitButton>
    </form>
  );
}

export function StartMfaForm() {
  const [state, action] = useActionState(startMfaSetup, empty);
  return (
    <form action={action} className="ui-form">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.notice ? <Alert tone="info">{state.notice}</Alert> : null}
      {state.notice ? null : <SubmitButton pendingLabel="Sending code…">Turn on email codes</SubmitButton>}
    </form>
  );
}

export function ConfirmMfaForm({ secondsLeft, home }: { secondsLeft: number; home: string }) {
  const [state, action] = useActionState(confirmMfaSetup, empty);
  if (state.done) {
    return (
      <SentState icon="shield" title="Email codes are on" action={<a className="ui-button ui-button-primary" href={home}>Done</a>}>
        <p>From now on, signing in needs your password and a code we email you. We’ve signed you out on your other devices.</p>
      </SentState>
    );
  }
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.notice ? <Alert tone="info">{state.notice}</Alert> : null}
      <OtpField error={state.fields?.code} />
      <ExpiryCountdown seconds={secondsLeft} />
      <SubmitButton pendingLabel="Checking…">Confirm code</SubmitButton>
    </form>
  );
}
