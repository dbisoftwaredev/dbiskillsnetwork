import type { Metadata } from 'next';
import { AuthShell, SentState } from '../../../components/shells';
import { Heading } from '../../../components/ui';
import { ResetPasswordForm } from '../forms';

export const metadata: Metadata = { title: 'Choose a new password · DBI Skills Network' };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? '';
  return (
    <AuthShell panel="security" top={<a href="/auth/login">Back to sign in</a>}>
      {token ? (
        <>
          <Heading title="Choose a new" accent="password.">You’ll be signed out everywhere once it’s changed.</Heading>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <SentState title="This link is incomplete" action={<a className="ui-button ui-button-primary" href="/auth/forgot-password">Request a new link</a>}>
          <p>Open the link from your reset email again, or request a new one.</p>
        </SentState>
      )}
    </AuthShell>
  );
}
