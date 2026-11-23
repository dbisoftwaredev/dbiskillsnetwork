import type { ReactNode } from 'react';
import { signOut } from '../app/auth/actions';
import { Brand, Icon } from './ui';

type Panel = 'talent' | 'organization' | 'security';

// Photos are Unsplash stand-ins (public/images/people/CREDITS.md) until DBI supplies consented photography.
const panels: Record<Panel, { kicker: string; title: string; accent: string; body: string; foot: string; photo: string; alt: string }> = {
  talent: {
    kicker: 'Join the network',
    title: 'Your skills',
    accent: 'deserve to be seen.',
    body: 'Prove what you can do, learn exactly what comes next, and connect with the employers building the continent’s networks.',
    foot: 'Free for talent. Always.',
    photo: 'y-david', alt: 'A young man smiling while working on a laptop',
  },
  organization: {
    kicker: 'For organizations',
    title: 'Hire on evidence,',
    accent: 'not the CV.',
    body: 'One workspace for your team to find verified talent, build shortlists and track the people you develop.',
    foot: 'Talent contact details stay private until they agree.',
    photo: 't-network', alt: 'A young man configuring network equipment at a desk',
  },
  security: {
    kicker: 'Your account',
    title: 'Your record',
    accent: 'stays yours.',
    body: 'Sign-in codes expire after five minutes, and you choose which organizations can see your details.',
    foot: 'Never share a code with anyone, including DBI staff.',
    photo: 'y-amaka', alt: 'A smiling young woman wearing glasses',
  },
};

export function AuthShell({ panel = 'talent', top, children }: { panel?: Panel; top?: ReactNode; children: ReactNode }) {
  const content = panels[panel];
  return (
    <div className="ui ui-auth">
      <a className="ui-skip" href="#content">Skip to content</a>
      <div className="ui-auth-main">
        <div className="ui-topbar">
          <Brand />
          {top ? <div className="ui-topbar-link">{top}</div> : null}
        </div>
        <main id="content" className="ui-auth-body">{children}</main>
        <p className="ui-foot">
          <span>Digital Bridge Institute</span>
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/terms">Terms</a>
        </p>
      </div>
      <aside className={`ui-panel ui-panel-${panel}`} aria-label={content.kicker}>
        <div className="ui-panel-photo">
          <img src={`/images/people/${content.photo}.webp`} alt={content.alt} width={900} height={1200} decoding="async" />
          <div className="ui-panel-copy">
            <p className="ui-panel-title">{content.title} <em>{content.accent}</em></p>
            <p className="ui-panel-body">{content.body}</p>
            <p className="ui-panel-foot">{content.foot}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function AppShell({ email, children, wide = false }: { email: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="ui ui-app">
      <a className="ui-skip" href="#content">Skip to content</a>
      <div className="ui-appbar">
        <Brand />
        <div className="ui-account">
          <span className="ui-avatar" aria-hidden="true">{email.charAt(0).toUpperCase()}</span>
          <span className="ui-account-email">{email}</span>
          <form action={signOut}>
            <button type="submit" className="ui-link-button">Sign out</button>
          </form>
        </div>
      </div>
      <main id="content" className={`ui-app-body${wide ? ' is-wide' : ''}`}>{children}</main>
    </div>
  );
}

type NavIcon = 'home' | 'passport' | 'skills' | 'jobs' | 'learn' | 'shield';
const NAV_PATHS: Record<NavIcon, ReactNode> = {
  home: <path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5" />,
  passport: <><rect x="5" y="3" width="14" height="18" rx="2.5" /><circle cx="12" cy="10" r="2.6" /><path d="M8.5 16h7" /></>,
  skills: <><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></>,
  jobs: <><rect x="3.5" y="7" width="17" height="12.5" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3.5 12.5h17" /></>,
  learn: <><path d="M2.5 9L12 4.5 21.5 9 12 13.5z" /><path d="M6.5 11v4.5c1.5 1.5 3.4 2.2 5.5 2.2s4-.7 5.5-2.2V11" /></>,
  shield: <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" />,
};
const NavGlyph = ({ name }: { name: NavIcon }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{NAV_PATHS[name]}</svg>
);

const TALENT_NAV: { label: string; icon: NavIcon; href?: string }[] = [
  { label: 'Home', icon: 'home', href: '/talent' },
  { label: 'Passport', icon: 'passport' },
  { label: 'Skills', icon: 'skills' },
  { label: 'Opportunities', icon: 'jobs' },
  { label: 'Learning', icon: 'learn' },
];

/** Talent workspace: sidebar on desktop, top bar with scrollable sections on mobile.
 *  Sections that are not live yet are shown, labelled "Soon", and are not links. */
export function TalentShell({ email, name, initials, current = '/talent', children }: { email: string; name: string | null; initials: string; current?: string; children: ReactNode }) {
  return (
    <div className="ui tw">
      <a className="ui-skip" href="#content">Skip to content</a>
      <aside className="tw-side" aria-label="Workspace">
        <Brand />
        <nav className="tw-nav" aria-label="Talent workspace">
          {TALENT_NAV.map((item) => item.href ? (
            <a key={item.label} href={item.href} className="tw-nav-item" aria-current={item.href === current ? 'page' : undefined}>
              <NavGlyph name={item.icon} />{item.label}
            </a>
          ) : (
            <span key={item.label} className="tw-nav-item is-soon" aria-disabled="true">
              <NavGlyph name={item.icon} />{item.label}<small>Soon</small>
            </span>
          ))}
        </nav>
        <div className="tw-side-foot">
          <a href="/account/security" className="tw-nav-item"><NavGlyph name="shield" />Security</a>
          <div className="tw-me">
            <span className="tw-avatar" aria-hidden="true">{initials}</span>
            <span className="tw-me-text"><strong>{name ?? 'Your account'}</strong><span>{email}</span></span>
          </div>
          <form action={signOut}><button type="submit" className="ui-link-button">Sign out</button></form>
        </div>
      </aside>
      <main id="content" className="tw-main">{children}</main>
    </div>
  );
}

export function SentState({ icon = 'mail', title, children, action }: { icon?: 'mail' | 'check' | 'shield' | 'lock'; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="ui-sent">
      <span className="ui-sent-icon"><Icon name={icon} size={24} /></span>
      <h1>{title}</h1>
      <div className="ui-lede">{children}</div>
      {action}
    </div>
  );
}
