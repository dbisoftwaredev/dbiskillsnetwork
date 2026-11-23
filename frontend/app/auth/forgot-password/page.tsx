import type { Metadata } from 'next';
import { AuthShell } from '../../../components/shells';
import { Heading } from '../../../components/ui';
import { ForgotPasswordForm } from '../forms';

export const metadata: Metadata = { title: 'Reset your password · DBI Skills Network' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell panel="security" top={<a href="/auth/login">Back to sign in</a>}>
      <Heading title="Reset your" accent="password.">Enter your account email and we’ll send you a reset link.</Heading>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
