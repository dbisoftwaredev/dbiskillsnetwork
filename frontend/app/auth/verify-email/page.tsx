import type { Metadata } from 'next';
import { AuthShell, SentState } from '../../../components/shells';
import { Heading } from '../../../components/ui';
import { VerifyEmailForm } from '../forms';

export const metadata: Metadata = { title: 'Confirm your email · DBI Skills Network' };

// Confirmation needs a click: mail scanners that prefetch links must not use up the token.
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? '';
  return (
    <AuthShell panel="talent">
      {token ? (
        <>
          <Heading title="Confirm your" accent="email.">Confirm this address to activate your account.</Heading>
          <VerifyEmailForm token={token} />
        </>
      ) : (
        <SentState title="This link is incomplete" action={<a className="ui-button ui-button-ghost" href="/auth/login">Go to sign in</a>}>
          <p>Open the link from your confirmation email again, or copy the whole address into your browser.</p>
        </SentState>
      )}
    </AuthShell>
  );
}
