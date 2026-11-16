import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DBI Skills Network',
  description: 'Your skills. Your reputation. Your next opportunity.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
