import { ArtSprite, Crest } from './home/art';
import type { ReactNode } from 'react';

export function Brand() {
  return (
    <a className="ui-brand" href="/" aria-label="DBI Skills Network home">
      <ArtSprite />
      <span className="ui-seal"><Crest id="brand-crest" /></span>
      <span className="ui-word">DBI <em>Skills Network</em></span>
    </a>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  return (
    <div className={`ui-alert ui-alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'success' ? 'check' : tone === 'info' ? 'info' : 'alert'} />
      <div>{children}</div>
    </div>
  );
}

export function Field({
  id, label, error, hint, aside, children,
}: { id: string; label: string; error?: string; hint?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className={`ui-field${error ? ' has-error' : ''}`}>
      <div className="ui-label-row">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      {children}
      {error ? <p className="ui-error" id={`${id}-error`}>{error}</p> : hint ? <p className="ui-hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}

/** aria-describedby for an input rendered inside <Field>. */
export function describedBy(id: string, error?: string, hint?: unknown) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function Heading({ eyebrow, title, accent, children }: { eyebrow?: string; title: string; accent?: string; children?: ReactNode }) {
  return (
    <div className="ui-heading">
      {eyebrow ? <p className="ui-eyebrow"><span aria-hidden="true" />{eyebrow}</p> : null}
      <h1>{title}{accent ? <> <em>{accent}</em></> : null}</h1>
      {children ? <p className="ui-lede">{children}</p> : null}
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="ui-stepper" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((step, index) => (
        <li key={step} className={index < current ? 'is-done' : index === current ? 'is-current' : undefined}
          aria-current={index === current ? 'step' : undefined}>
          <span className="ui-step-dot" aria-hidden="true">{index < current ? <Icon name="check" /> : index + 1}</span>
          <span className="ui-step-label">{step}</span>
        </li>
      ))}
    </ol>
  );
}

type IconName = 'check' | 'alert' | 'info' | 'eye' | 'eye-off' | 'arrow' | 'user' | 'building' | 'shield' | 'mail' | 'plus' | 'x' | 'lock';

const paths: Record<IconName, ReactNode> = {
  check: <path d="M5 12.5l4.2 4L19 7" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.4v.1" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.1" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="M4 4l16 16M10 6c.6-.1 1.3-.2 2-.2 6 0 9.5 6.2 9.5 6.2a16 16 0 01-2.7 3.4M6.3 7.5A15.6 15.6 0 002.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" /></>,
  building: <><path d="M4.5 20.5V5.5l8-2.5v17.5M12.5 8.5h7v12M2.5 20.5h19" /><path d="M7.5 8.5h2M7.5 12h2M7.5 15.5h2M15.5 12h1.5M15.5 15.5h1.5" /></>,
  shield: <><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" /><path d="M8.6 12.2l2.4 2.3 4.4-4.5" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.5 7l8.5 6.5L20.5 7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>,
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
