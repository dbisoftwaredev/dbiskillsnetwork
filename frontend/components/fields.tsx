'use client';

import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { normalizeOtp, passwordStrength, PASSWORD_MIN } from '../lib/rules';
import { describedBy, Field, Icon } from './ui';

export function SubmitButton({ children, pendingLabel, variant = 'primary' }: { children: ReactNode; pendingLabel: string; variant?: 'primary' | 'ghost' }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`ui-button ui-button-${variant}`} disabled={pending} aria-disabled={pending}>
      {pending ? <><span className="ui-spinner" aria-hidden="true" />{pendingLabel}</> : children}
    </button>
  );
}

type TextProps = InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; error?: string; hint?: ReactNode; aside?: ReactNode };

export function TextField({ name, label, error, hint, aside, ...input }: TextProps) {
  const id = `${useId()}-${name}`;
  return (
    <Field id={id} label={label} error={error} hint={hint} aside={aside}>
      <input id={id} name={name} className="ui-input" aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)} {...input} />
    </Field>
  );
}

export function PasswordField({
  name = 'password', label = 'Password', error, meter = false, autoComplete = 'current-password', aside,
}: { name?: string; label?: string; error?: string; meter?: boolean; autoComplete?: string; aside?: ReactNode }) {
  const id = `${useId()}-${name}`;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');
  const strength = passwordStrength(value);
  const hint = meter ? `At least ${PASSWORD_MIN} characters. A short phrase is easy to remember.` : undefined;

  return (
    <Field id={id} label={label} error={error} hint={hint} aside={aside}>
      <div className="ui-input-wrap">
        <input id={id} name={name} type={visible ? 'text' : 'password'} className="ui-input" autoComplete={autoComplete}
          required minLength={meter ? PASSWORD_MIN : undefined} maxLength={128} value={value}
          onChange={(event) => setValue(event.target.value)} aria-invalid={error ? true : undefined}
          aria-describedby={[describedBy(id, error, hint), meter ? `${id}-meter` : ''].filter(Boolean).join(' ') || undefined} />
        <button type="button" className="ui-reveal" onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
          <Icon name={visible ? 'eye-off' : 'eye'} />
        </button>
      </div>
      {meter ? (
        <div className="ui-meter" data-score={strength.score} id={`${id}-meter`} aria-live="polite">
          <span className="ui-meter-bars" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="ui-meter-label">{strength.label ? `Strength: ${strength.label}` : ''}</span>
        </div>
      ) : null}
    </Field>
  );
}

export function CheckField({ name, children, error, required, defaultChecked }: { name: string; children: ReactNode; error?: string; required?: boolean; defaultChecked?: boolean }) {
  const id = `${useId()}-${name}`;
  return (
    <div className={`ui-check${error ? ' has-error' : ''}`}>
      <input type="checkbox" id={id} name={name} required={required} defaultChecked={defaultChecked}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
      <span className="ui-check-box" aria-hidden="true"><Icon name="check" size={14} /></span>
      <label htmlFor={id}>{children}</label>
      {error ? <p className="ui-error" id={`${id}-error`}>{error}</p> : null}
    </div>
  );
}

/** One real input (paste- and autofill-friendly) drawn as six cells. */
export function OtpField({ error, autoFocus = true }: { error?: string; autoFocus?: boolean }) {
  const id = `${useId()}-code`;
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  return (
    <Field id={id} label="Verification code" error={error}>
      <div className={`ui-otp${focused ? ' is-focused' : ''}`}>
        <input ref={ref} id={id} name="code" value={value} inputMode="numeric" autoComplete="one-time-code"
          pattern="\d{6}" maxLength={6} required aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => setValue(normalizeOtp(event.target.value))}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        <div className="ui-otp-cells" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className={focused && index === Math.min(value.length, 5) ? 'is-active' : undefined}>
              {value[index] ?? ''}
            </span>
          ))}
        </div>
      </div>
    </Field>
  );
}

/** Counts down a code's lifetime from when the page was rendered. */
export function ExpiryCountdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setLeft(Math.max(0, seconds - Math.floor((Date.now() - started) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [seconds]);
  if (left === 0) return <span className="ui-countdown is-expired">This code has expired.</span>;
  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return <span className="ui-countdown">Code expires in <strong>{label}</strong></span>;
}
