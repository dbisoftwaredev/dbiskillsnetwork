import { TalentShell } from '../../components/shells';
import { Icon } from '../../components/ui';
import { checklist, firstName, greeting, initials, nextStep, progress, type Me } from '../../lib/talent';
import { CareerCard } from './forms';

// What opens next in the pilot. Plain descriptions, no dates or numbers we can't stand behind.
const COMING = [
  { title: 'Skills & evidence', body: 'Add the skills you have and back them with projects and work samples.' },
  { title: 'Skills diagnostics', body: 'Short practical checks that move skills from declared to DBI verified.' },
  { title: 'Opportunities', body: 'Roles from verified employers, matched to your evidence. Applying is always free.' },
];

const TIERS = [
  ['Declared', 'You add it'],
  ['Demonstrated', 'Shown with work'],
  ['DBI verified', 'Confirmed by experts'],
];

/** The talent command centre (Strategy section 8): next useful action, setup, goal, passport preview. */
export function TalentDashboard({ me }: { me: Me }) {
  const steps = checklist(me);
  const pct = progress(steps);
  const next = nextStep(me);
  const live = steps.filter((s) => s.state !== 'soon');
  const doneCount = live.filter((s) => s.state === 'done').length;
  const name = firstName(me);
  const role = me.onboarding.targetOccupation;
  const circumference = 2 * Math.PI * 34;

  return (
    <TalentShell email={me.email} name={me.profile.displayName} initials={initials(me)}>
      <div className="tw-page">
        <header className="tw-hello tw-in" style={{ ['--d' as string]: '0ms' }}>
          <div>
            <h1>{greeting()}{name ? `, ${name}` : ''}.</h1>
            <p className="tw-sub">{role ? <>Working towards <strong>{role}</strong>.</> : 'Let’s set up your career command centre.'}</p>
          </div>
          <a className="ui-button ui-button-ghost tw-hello-cta" href="/#readiness">Readiness explorer <Icon name="arrow" size={16} /></a>
        </header>

        <div className="tw-row tw-row-hero">
          <section className="tw-next tw-in" style={{ ['--d' as string]: '80ms' }} aria-labelledby="next-heading">
            <div className="tw-next-top">
              <p className="tw-label">Your next step</p>
              {live.length ? <p className="tw-count">Step {Math.min(doneCount + 1, live.length)} of {live.length}</p> : null}
            </div>
            <ol className="tw-track" aria-hidden="true">
              {live.map((s) => <li key={s.id} className={s.state === 'done' ? 'is-done' : s.id === next.id ? 'is-now' : undefined} />)}
            </ol>
            <h2 id="next-heading">{next.title}</h2>
            <p>{next.body}</p>
            {next.cta && next.href ? <a className="ui-button tw-next-cta" href={next.href}>{next.cta} <Icon name="arrow" size={16} /></a> : null}
          </section>

          <section className="tw-card tw-progress tw-in" style={{ ['--d' as string]: '160ms' }} aria-labelledby="setup-heading">
            <div className="tw-progress-head">
              <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`Setup ${pct}% complete`}>
                <circle cx="42" cy="42" r="34" fill="none" stroke="#ececf0" strokeWidth="8" />
                <circle className="tw-ring" cx="42" cy="42" r="34" fill="none" stroke="#4f35c2" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * circumference} ${circumference}`} transform="rotate(-90 42 42)" />
              </svg>
              <div>
                <h2 id="setup-heading">Setup</h2>
                <p className="tw-big">{pct}%</p>
              </div>
            </div>
            <ol className="tw-steps">
              {steps.map((s) => (
                <li key={s.id} className={`is-${s.state}`}>
                  <span className="tw-step-mark" aria-hidden="true">{s.state === 'done' ? <Icon name="check" size={13} /> : null}</span>
                  <span className="tw-step-label">{s.label}</span>
                  <span className="tw-step-state">{s.state === 'done' ? 'Done' : s.state === 'soon' ? 'Opens soon' : 'To do'}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="tw-row">
          <div className="tw-in" style={{ ['--d' as string]: '240ms' }}><CareerCard me={me} /></div>

          <section className="tw-card tw-pass tw-in" style={{ ['--d' as string]: '320ms' }} aria-labelledby="pass-heading">
            <div className="tw-card-head">
              <h2 id="pass-heading">Skills Passport</h2>
              <span className="tw-private"><Icon name="lock" size={14} /> Private</span>
            </div>
            <div className="tw-pass-id">
              <span className="tw-avatar tw-avatar-lg" aria-hidden="true">{initials(me)}</span>
              <div>
                <p className="tw-pass-name">{me.profile.displayName ?? 'Add your name'}</p>
                <p className="tw-muted">{[role, me.profile.location].filter(Boolean).join(' · ') || 'Target role and location appear here'}</p>
              </div>
            </div>
            <ul className="tw-tiers">
              {TIERS.map(([tier, hint], i) => (
                <li key={tier}><span className={`tw-tier-dot t${i + 1}`} aria-hidden="true" /><span>{tier}<small>{hint}</small></span><strong>0</strong></li>
              ))}
            </ul>
            <p className="tw-muted tw-pass-foot">Your passport fills up as you add and verify skills. You’ll choose who can see it.</p>
          </section>
        </div>

        <section className="tw-coming tw-in" style={{ ['--d' as string]: '400ms' }} aria-labelledby="coming-heading">
          <h2 id="coming-heading">Opening next in your workspace</h2>
          <ul>
            {COMING.map((c) => <li key={c.title}><h3>{c.title}</h3><p>{c.body}</p></li>)}
          </ul>
        </section>
      </div>
    </TalentShell>
  );
}
