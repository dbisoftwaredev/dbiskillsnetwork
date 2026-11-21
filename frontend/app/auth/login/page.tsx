import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '../../../components/shells';
import { Alert, Heading } from '../../../components/ui';
import { noticeFor, safeNext } from '../../../lib/rules';
import { homeFor, readSession } from '../../../lib/session';
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
    <AuthShell panel="security" top={<>New here? <a href={invited ? '/auth/signup?type=organization' : '/auth/signup'}>Create an account</a></>}>
      <Heading eyebrow={invited ? 'Workspace invitation' : undefined} title="Sign in to Africa’s" accent="talent network.">
        {invited ? 'Sign in with the email your invitation was sent to. New to DBI Skills Network? Create an organization account with that email first.' : undefined}
      </Heading>
      {notice ? <Alert tone={params.notice === 'signed-out' ? 'info' : 'success'}>{notice}</Alert> : null}
      <SignInForm next={next} />
    </AuthShell>
  );
}
