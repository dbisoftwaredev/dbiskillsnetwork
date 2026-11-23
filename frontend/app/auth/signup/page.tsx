import type { Metadata } from 'next';
import { AuthShell } from '../../../components/shells';
import { Alert, Heading } from '../../../components/ui';
import { DEMO_ENABLED } from '../../../lib/demo';
import { noticeFor } from '../../../lib/rules';
import { SignUpForm } from '../forms';

export const metadata: Metadata = { title: 'Create your account · DBI Skills Network' };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const notice = noticeFor((await searchParams).notice);
  return (
    <AuthShell panel="talent" top={<>Have an account? <a href="/auth/login">Sign in</a></>}>
      <Heading title="Create your" accent="free account.">
        Start with the basics. After confirming your email, choose whether you’re joining as an individual or for an organization.
      </Heading>
      {notice ? <Alert tone="info">{notice}</Alert> : null}
      {DEMO_ENABLED ? <Alert tone="info">Local demo: no confirmation email is needed. Choose how you’ll use your account next.</Alert> : null}
      <SignUpForm />
    </AuthShell>
  );
}
