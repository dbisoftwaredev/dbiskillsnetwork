import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '../../../components/shells';
import { Heading } from '../../../components/ui';
import { DEMO_ENABLED } from '../../../lib/demo';
import { readAccountSetupToken, readSession } from '../../../lib/session';
import { AccountTypeForm } from '../forms';

export const metadata: Metadata = { title: 'Choose how to use your account · DBI Skills Network' };

export default async function ChooseAccountPage() {
  const [setupToken, session] = await Promise.all([readAccountSetupToken(), readSession()]);
  if (!setupToken && !(DEMO_ENABLED && session)) redirect('/auth/login?notice=setup-expired');

  return (
    <AuthShell panel="talent">
      <Heading eyebrow="One last step" title="How will you use" accent="your account?">
        Choose an individual account to head to your talent dashboard, or choose organization to set up a workspace.
      </Heading>
      <AccountTypeForm />
    </AuthShell>
  );
}
