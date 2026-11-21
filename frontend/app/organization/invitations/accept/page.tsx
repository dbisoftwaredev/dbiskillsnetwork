import type { Metadata } from 'next';
import { AuthShell, SentState } from '../../../../components/shells';
import { Heading } from '../../../../components/ui';
import { requireSession } from '../../../../lib/session';
import { AcceptInvitationForm } from '../../forms';

export const metadata: Metadata = { title: 'Join a workspace · DBI Skills Network' };

export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? '';
  const session = await requireSession(`/organization/invitations/accept${token ? `?token=${encodeURIComponent(token)}` : ''}`);

  let body;
  if (!token) {
    body = <SentState title="This link is incomplete"><p>Open the link from your invitation email again.</p></SentState>;
  } else if (session.accountType !== 'ORGANIZATION_REPRESENTATIVE') {
    body = (
      <SentState icon="lock" title="Use an organization account" action={<a className="ui-button ui-button-ghost" href="/talent">Go to my passport</a>}>
        <p>You’re signed in as <strong>{session.email}</strong>, a talent account. Workspace invitations need an organization account using the invited email.</p>
      </SentState>
    );
  } else {
    body = (
      <>
        <Heading eyebrow="Invitation" title="Join your team’s workspace">
          You’re signed in as <strong>{session.email}</strong>. This must be the address the invitation was sent to.
        </Heading>
        <AcceptInvitationForm token={token} />
      </>
    );
  }
  return <AuthShell panel="organization">{body}</AuthShell>;
}
