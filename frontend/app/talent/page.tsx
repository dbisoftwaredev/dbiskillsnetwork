import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TalentShell } from '../../components/shells';
import { Alert } from '../../components/ui';
import { api } from '../../lib/api';
import { homeFor, requireSession } from '../../lib/session';
import type { Me } from '../../lib/talent';
import { TalentDashboard } from './dashboard';

export const metadata: Metadata = { title: 'Home · DBI Skills Network' };

export default async function TalentHome() {
  const session = await requireSession('/talent');
  if (session.accountType !== 'TALENT') redirect(await homeFor(session));

  const result = await api<Me>('/users/me', { method: 'GET', token: session.accessToken });
  if (!result.ok) {
    return (
      <TalentShell email={session.email} name={null} initials={session.email.charAt(0).toUpperCase()}>
        <div className="tw-page">
          <h1>Welcome back</h1>
          <Alert>We couldn’t load your dashboard just now. {result.message} <a href="/talent">Try again</a></Alert>
        </div>
      </TalentShell>
    );
  }

  return <TalentDashboard me={result.data} />;
}
