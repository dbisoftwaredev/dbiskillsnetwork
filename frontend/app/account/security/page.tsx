import type { Metadata } from 'next';
import { AppShell } from '../../../components/shells';
import { Heading, Icon } from '../../../components/ui';
import { homeFor, readChallenge, requireSession } from '../../../lib/session';
import { ConfirmMfaForm, StartMfaForm } from '../../auth/forms';

export const metadata: Metadata = { title: 'Security · DBI Skills Network' };

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const session = await requireSession('/account/security');
  const challenge = await readChallenge();
  const verifying = (await searchParams).step === 'verify' && Boolean(challenge.token);
  const home = await homeFor(session);

  return (
    <AppShell email={session.email}>
      <p className="ui-back"><a href={home}>← Back</a></p>
      <Heading eyebrow="Account" title="Security" />
      <section className="ui-card ui-card-narrow" aria-labelledby="mfa-heading">
        <span className="ui-card-icon"><Icon name="mail" /></span>
        <h2 id="mfa-heading">{verifying ? 'Enter the code we sent' : 'Email sign-in codes'}</h2>
        {verifying ? (
          <>
            <p>We sent a 6-digit code to <strong>{session.email}</strong>.</p>
            <ConfirmMfaForm secondsLeft={challenge.secondsLeft} home={home} />
            <p className="ui-muted"><a href="/account/security">Didn’t get it? Start again</a></p>
          </>
        ) : (
          <>
            <p>Each time you sign in, we’ll also ask for a code sent to your email. Turning this on signs you out of your other devices.</p>
            <p className="ui-muted">Email codes are only as secure as your mailbox, so protect your email account too.</p>
            <StartMfaForm />
          </>
        )}
      </section>
    </AppShell>
  );
}
