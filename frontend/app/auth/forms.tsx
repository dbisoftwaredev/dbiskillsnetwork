'use client';

import { useActionState, useState } from 'react';
import { CheckField, ExpiryCountdown, OtpField, PasswordField, SubmitButton, TextField } from '../../components/fields';
import { SentState } from '../../components/shells';
import { Alert, Icon } from '../../components/ui';
import {
  completeMfa,
  confirmMfaSetup,
  requestPasswordReset,
  resetPassword,
  signIn,
  signUp,
  startMfaSetup,
  verifyEmail,
  type FormState,
} from './actions';

const empty: FormState = {};

export function SignUpForm({ initialType }: { initialType: 'TALENT' | 'ORGANIZATION_REPRESENTATIVE' }) {
  const [state, action] = useActionState(signUp, empty);
  const [type, setType] = useState(state.values?.accountType || initialType);

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
      <fieldset className={`ui-choices${f.accountType ? ' has-error' : ''}`} aria-describedby={f.accountType ? 'type-error' : undefined}>
        <legend>I’m joining as</legend>
        <label className="ui-choice">
          <input type="radio" name="accountType" value="TALENT" checked={type === 'TALENT'} onChange={() => setType('TALENT')} />
          <span className="ui-choice-icon"><Icon name="user" /></span>
          <span className="ui-choice-text"><strong>Talent</strong><span>Grow my skills and career</span></span>
        </label>
        <label className="ui-choice">
          <input type="radio" name="accountType" value="ORGANIZATION_REPRESENTATIVE" checked={type === 'ORGANIZATION_REPRESENTATIVE'}
            onChange={() => setType('ORGANIZATION_REPRESENTATIVE')} />
          <span className="ui-choice-icon"><Icon name="building" /></span>
          <span className="ui-choice-text"><strong>An organization</strong><span>Hire or develop talent</span></span>
        </label>
        {f.accountType ? <p className="ui-error" id="type-error">{f.accountType}</p> : null}
      </fieldset>
      <TextField name="email" label={type === 'ORGANIZATION_REPRESENTATIVE' ? 'Work email' : 'Email'} type="email" autoComplete="email"
        required maxLength={254} defaultValue={state.values?.email} error={f.email} />
      <PasswordField meter autoComplete="new-password" error={f.password} />
      <div className="ui-consents">
        <CheckField name="terms" required error={f.terms}>I accept the <a href="/legal/terms" target="_blank" rel="noopener">Terms of Use</a></CheckField>
        <CheckField name="privacy" required error={f.privacy}>I’ve read the <a href="/legal/privacy" target="_blank" rel="noopener">Privacy Notice</a> and understand how my data is used</CheckField>
        <CheckField name="marketing">Send me occasional news about programmes and opportunities <span className="ui-muted">(optional)</span></CheckField>
      </div>
      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
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
