'use client';

import { useEffect, useState } from 'react';

type Role = { id: string; title: string; readiness: number; checks: { name: string; level: number; target: number }[]; next: string[] };

// Illustrative only: shows how CareerGPS will explain readiness. Not real assessment data.
const ROLES: Role[] = [
  {
    id: 'net', title: 'Network Engineer', readiness: 72,
    checks: [
      { name: 'IP routing & switching', level: 82, target: 85 },
      { name: 'Network security', level: 58, target: 80 },
      { name: 'Fibre optics', level: 74, target: 70 },
      { name: 'Automation & scripting', level: 36, target: 65 },
    ],
    next: ['Routing practical assessment', 'Firewall fundamentals lab', 'Python for network automation'],
  },
  {
    id: 'fibre', title: 'Fibre Field Technician', readiness: 64,
    checks: [
      { name: 'Fusion splicing', level: 70, target: 90 },
      { name: 'OTDR testing', level: 52, target: 80 },
      { name: 'Site safety', level: 88, target: 85 },
      { name: 'FTTH installation', level: 61, target: 75 },
    ],
    next: ['Supervised splicing evaluation', 'OTDR trace interpretation', 'Field deployment cohort'],
  },
  {
    id: 'cloud', title: 'Cloud Support Engineer', readiness: 58,
    checks: [
      { name: 'Linux administration', level: 66, target: 80 },
      { name: 'Cloud networking', level: 49, target: 75 },
      { name: 'Containers', level: 34, target: 65 },
      { name: 'Customer troubleshooting', level: 80, target: 75 },
    ],
    next: ['Linux work-sample assessment', 'Cloud networking lab path', 'Containers fundamentals'],
  },
  {
    id: 'sec', title: 'Cybersecurity Analyst', readiness: 41,
    checks: [
      { name: 'Security monitoring', level: 38, target: 80 },
      { name: 'Network fundamentals', level: 72, target: 75 },
      { name: 'Incident response', level: 24, target: 70 },
      { name: 'Risk & compliance', level: 45, target: 60 },
    ],
    next: ['Security foundations pathway', 'SOC simulation lab', 'Mentored incident-response project'],
  },
];

export function ReadinessExplorer() {
  const [id, setId] = useState(ROLES[2].id);
  // Cycles through roles on its own until the visitor picks one (never with reduced motion).
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!auto || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setId((current) => ROLES[(ROLES.findIndex((r) => r.id === current) + 1) % ROLES.length].id);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [auto, paused]);
  const role = ROLES.find((r) => r.id === id) ?? ROLES[0];
  const pick = (next: string) => { setAuto(false); setId(next); };
  return (
    <div className={`rx${auto ? ' is-auto' : ''}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="rx-roles" role="radiogroup" aria-label="Choose a dream role">
        {ROLES.map((r) => (
          <button key={r.id} type="button" role="radio" aria-checked={r.id === id} className="rx-role" onClick={() => pick(r.id)}>
            {r.title}
          </button>
        ))}
      </div>
      <div className="rx-panel" key={role.id} aria-live={auto ? 'off' : 'polite'}>
        <div className="rx-score">
          <p className="rx-label">Example readiness</p>
          <p className="rx-num">{role.readiness}<span>%</span></p>
          <div className="rx-bar" aria-hidden="true"><i style={{ width: `${role.readiness}%` }} /></div>
          <p className="rx-note">for an entry-level {role.title.toLowerCase()} role, based on a sample profile.</p>
        </div>
        <div className="rx-checks">
          <p className="rx-label">Skills against the role</p>
          <ul>
            {role.checks.map((c) => (
              <li key={c.name}>
                <div className="rx-check-head"><span>{c.name}</span><span className={c.level >= c.target ? 'rx-met' : 'rx-gap'}>{c.level >= c.target ? 'Met' : `Gap of ${c.target - c.level}`}</span></div>
                <div className="rx-track" aria-hidden="true"><i style={{ width: `${c.level}%` }} /><b style={{ left: `${c.target}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rx-next">
          <p className="rx-label">Your next steps</p>
          <ol>{role.next.map((n, i) => <li key={n} style={{ ['--i' as string]: i }}><span>{String(i + 1).padStart(2, '0')}</span>{n}</li>)}</ol>
          <a className="btn btn-dark" href="/auth/signup">Check my own readiness</a>
        </div>
      </div>
    </div>
  );
}
