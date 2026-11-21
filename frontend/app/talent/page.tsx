import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AppShell } from '../../components/shells';
import { Heading, Icon } from '../../components/ui';
import { homeFor, requireSession } from '../../lib/session';

export const metadata: Metadata = { title: 'Your Skills Passport · DBI Skills Network' };

export default async function TalentHome() {
  const session = await requireSession('/talent');
  if (session.accountType !== 'TALENT') redirect(await homeFor(session));

  return (
    <AppShell email={session.email}>
      <Heading eyebrow="Skills Passport" title="Welcome to DBI Skills Network">
        Your account is ready. The passport features below are being built and will appear here as they launch.
      </Heading>
      <div className="ui-grid">
        <section className="ui-card ui-card-feature" aria-labelledby="passport-heading">
          <p className="ui-card-kicker">Your passport</p>
          <h2 id="passport-heading">No skills recorded yet</h2>
          <p>Soon you’ll add the skills you have, then strengthen them with assessments and project evidence.</p>
          <ol className="ui-ladder ui-ladder-light">
            {[['Declared', 'You add it'], ['Demonstrated', 'Shown through work or assessment'], ['DBI verified', 'Confirmed by DBI evaluators']].map(([name, detail]) => (
              <li key={name}><span className="ui-ladder-dot" aria-hidden="true" /><span className="ui-ladder-name">{name}</span><span className="ui-ladder-detail">{detail}</span></li>
            ))}
          </ol>
          <span className="ui-badge">Coming soon</span>
        </section>
        <section className="ui-card" aria-labelledby="security-heading">
          <span className="ui-card-icon"><Icon name="shield" /></span>
          <h2 id="security-heading">Protect your account</h2>
          <p>Add a second step to sign-in with a code we email you.</p>
          <a className="ui-button ui-button-ghost" href="/account/security">Security settings <Icon name="arrow" /></a>
        </section>
      </div>
    </AppShell>
  );
}
