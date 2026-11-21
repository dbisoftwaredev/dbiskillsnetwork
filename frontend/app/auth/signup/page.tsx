import type { Metadata } from 'next';
import { AuthShell } from '../../../components/shells';
import { Heading } from '../../../components/ui';
import { SignUpForm } from '../forms';

export const metadata: Metadata = { title: 'Create your account · DBI Skills Network' };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const organization = (await searchParams).type === 'organization';
  return (
    <AuthShell panel={organization ? 'organization' : 'talent'} top={<>Have an account? <a href="/auth/login">Sign in</a></>}>
      <Heading eyebrow="Get started · Free" title="Join the" accent="network.">
        {organization ? 'Set up access for your organization. You’ll add workspace details next.' : 'Join Africa’s digital talent network. It’s free and takes a couple of minutes.'}
      </Heading>
      <SignUpForm initialType={organization ? 'ORGANIZATION_REPRESENTATIVE' : 'TALENT'} />
    </AuthShell>
  );
}
