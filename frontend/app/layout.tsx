import type { Metadata } from 'next';
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './ui.css';
import './home.css';

// Self-hosted at build time by next/font: visitors' browsers never call Google.
const serif = Fraunces({ subsets: ['latin'], variable: '--font-serif', axes: ['SOFT', 'WONK', 'opsz'], style: ['normal', 'italic'], display: 'swap' });
const sans = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'DBI Skills Network',
  description: 'Your skills. Your reputation. Your next opportunity.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
