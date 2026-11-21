import type { Metadata } from 'next';
import { LegalPage } from '../legal';

export const metadata: Metadata = { title: 'Terms of Use · DBI Skills Network' };

export default function Terms() {
  return <LegalPage title="Terms of Use" />;
}
