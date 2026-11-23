import type { Metadata } from 'next';
import { AuthShell, SentState } from '../../../components/shells';
import { Heading } from '../../../components/ui';
import { safeNext } from '../../../lib/rules';
import { readChallenge } from '../../../lib/session';
import { MfaForm } from '../forms';

export const metadata: Metadata = { title: 'Enter your code · DBI Skills Network' };

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const challenge = await readChallenge();

  return (
    <AuthShell panel="security" top={<a href="/auth/login">Use a different account</a>}>
      {challenge.token ? (
        <>
          <Heading title="Check your" accent="email.">
            We sent a 6-digit code to {challenge.email ? <strong>{challenge.email}</strong> : 'your email'}.
          </Heading>
          <MfaForm next={next} secondsLeft={challenge.secondsLeft} />
        </>
      ) : (
        <SentState icon="lock" title="This sign-in has expired"
          action={<a className="ui-button ui-button-primary" href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign in again</a>}>
          <p>Codes last five minutes. Sign in again and we’ll send a new one.</p>
        </SentState>
      )}
    </AuthShell>
  );
}
