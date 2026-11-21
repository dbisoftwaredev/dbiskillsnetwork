import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '../../../components/shells';
import { Heading, Stepper } from '../../../components/ui';
import { api, type Organization } from '../../../lib/api';
import { requireSession } from '../../../lib/session';
import { CreateOrganizationForm } from '../../organization/forms';

export const metadata: Metadata = { title: 'Set up your workspace · DBI Skills Network' };

export default async function OrganizationOnboarding() {
  const session = await requireSession('/onboarding/organization');
  if (session.accountType !== 'ORGANIZATION_REPRESENTATIVE') redirect('/talent');
  const existing = await api<Organization[]>('/organizations', { method: 'GET', token: session.accessToken });
  if (existing.ok && existing.data.length > 0) redirect('/organization');

  return (
    <AuthShell panel="organization" top={<span className="ui-muted">{session.email}</span>}>
      <Stepper steps={['Account', 'Workspace', 'Verification']} current={1} />
      <Heading eyebrow="Set up" title="Tell us about your" accent="organization.">
        This creates your workspace. You’ll be its owner and can invite your team afterwards.
      </Heading>
      <CreateOrganizationForm />
      <p className="ui-muted ui-center">Invited by a colleague? Open the link in their invitation email instead.</p>
    </AuthShell>
  );
}
