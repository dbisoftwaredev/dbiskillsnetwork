import type { Metadata } from 'next';
import { LegalPage } from '../legal';

export const metadata: Metadata = { title: 'Privacy Notice · DBI Skills Network' };

export default function Privacy() {
  return <LegalPage title="Privacy Notice" />;
}
