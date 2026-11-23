import type { Metadata } from 'next';
import { Geist_Mono, Onest } from 'next/font/google';
import './globals.css';
import './ui.css';
import './home.css';

// Self-hosted at build time by next/font: visitors' browsers never call Google.
const sans = Onest({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'DBI Skills Network',
  description: 'The talent hub for Africa’s digital generation. Prove your skills, close the gaps and get hired on evidence.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
