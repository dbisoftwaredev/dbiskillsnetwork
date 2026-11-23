import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '../../../components/shells';
import { Alert, Heading } from '../../../components/ui';
import { noticeFor, safeNext } from '../../../lib/rules';
import { homeFor, readSession } from '../../../lib/session';
import { DEMO_ENABLED } from '../../../lib/demo';
import { SignInForm } from '../forms';

export const metadata: Metadata = { title: 'Sign in · DBI Skills Network' };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const session = await readSession();
  if (session) redirect(next || (await homeFor(session)));
  const notice = noticeFor(params.notice);
  const invited = next.startsWith('/organization/invitations/');

  return (
    <AuthShell panel="security" top={<>New here? <a href="/auth/signup">Create an account</a></>}>
      <Heading title="Sign in to Africa’s" accent="talent network.">
        {invited ? 'Sign in with the email your invitation was sent to. If you’re new, create an account and choose organization after confirming your email.' : undefined}
      </Heading>
      {notice ? <Alert tone={params.notice === 'signed-out' ? 'info' : 'success'}>{notice}</Alert> : null}
      {DEMO_ENABLED ? <Alert tone="info">Local demo: any email and password works. Nothing is sent to the real API.</Alert> : null}
      <SignInForm next={next} />
    </AuthShell>
  );
}
