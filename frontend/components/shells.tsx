import type { ReactNode } from 'react';
import { signOut } from '../app/auth/actions';
import { HeroWall } from './home/hero-wall';
import { Brand, Icon } from './ui';

type Panel = 'talent' | 'organization' | 'security';

const panels: Record<Panel, { kicker: string; title: string; accent: string; body: string; foot: string }> = {
  talent: {
    kicker: 'Join the network',
    title: 'Where Africa’s young talent',
    accent: 'gets seen.',
    body: 'Prove what you can do, learn exactly what comes next, and connect with the employers building the continent’s networks.',
    foot: 'Free for talent. Always.',
  },
  organization: {
    kicker: 'For organizations',
    title: 'Hire on evidence,',
    accent: 'not the CV.',
    body: 'One workspace for your team to find verified talent, build shortlists and track the people you develop.',
    foot: 'Talent contact details stay private until they agree.',
  },
  security: {
    kicker: 'Your account',
    title: 'Your record',
    accent: 'stays yours.',
    body: 'Sign-in codes expire after five minutes, and you choose which organizations can see your details.',
    foot: 'Never share a code with anyone, including DBI staff.',
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
        <div className="ui-panel-wall"><HeroWall /></div>
        <div className="ui-panel-copy">
          <p className="ui-panel-kicker"><span aria-hidden="true" />{content.kicker}</p>
          <p className="ui-panel-title">{content.title} <em>{content.accent}</em></p>
          <p className="ui-panel-body">{content.body}</p>
          <p className="ui-panel-foot">{content.foot}</p>
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
