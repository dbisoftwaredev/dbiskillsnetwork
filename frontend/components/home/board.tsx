'use client';

import { useState } from 'react';
import { Barcode } from './art';

type Role = {
  id: string; title: string; code: string; readiness: number; gate: string;
  checks: { name: string; level: number; target: number }[];
  connections: string[];
};

// Illustrative only: shows how CareerGPS will explain readiness. Not real assessment data.
const ROLES: Role[] = [
  {
    id: 'net', title: 'Network Engineer', code: 'NWE', readiness: 72, gate: 'A4',
    checks: [
      { name: 'IP routing & switching', level: 82, target: 85 },
      { name: 'Network security', level: 58, target: 80 },
      { name: 'Fibre optics', level: 74, target: 70 },
      { name: 'Automation & scripting', level: 36, target: 65 },
    ],
    connections: ['Routing practical assessment', 'Firewall fundamentals lab', 'Python for network automation'],
  },
  {
    id: 'fibre', title: 'Fibre Field Technician', code: 'FFT', readiness: 64, gate: 'B2',
    checks: [
      { name: 'Fusion splicing', level: 70, target: 90 },
      { name: 'OTDR testing', level: 52, target: 80 },
      { name: 'Site safety', level: 88, target: 85 },
      { name: 'FTTH installation', level: 61, target: 75 },
    ],
    connections: ['Supervised splicing evaluation', 'OTDR trace interpretation', 'Field deployment cohort'],
  },
  {
    id: 'cloud', title: 'Cloud Support Engineer', code: 'CSE', readiness: 58, gate: 'C7',
    checks: [
      { name: 'Linux administration', level: 66, target: 80 },
      { name: 'Cloud networking', level: 49, target: 75 },
      { name: 'Containers', level: 34, target: 65 },
      { name: 'Customer troubleshooting', level: 80, target: 75 },
    ],
    connections: ['Linux work-sample assessment', 'Cloud networking lab path', 'Containers fundamentals'],
  },
  {
    id: 'sec', title: 'Cybersecurity Analyst', code: 'CSA', readiness: 41, gate: 'D1',
    checks: [
      { name: 'Security monitoring', level: 38, target: 80 },
      { name: 'Network fundamentals', level: 72, target: 75 },
      { name: 'Incident response', level: 24, target: 70 },
      { name: 'Risk & compliance', level: 45, target: 60 },
    ],
    connections: ['Security foundations pathway', 'SOC simulation lab', 'Mentored incident-response project'],
  },
];

const status = (n: number) => (n >= 70 ? 'BOARDING' : n >= 55 ? 'GATE OPEN' : 'EN ROUTE');

/** Characters that flip into place, staggered, whenever the text changes. */
function Flaps({ text, length }: { text: string; length: number }) {
  const padded = text.toUpperCase().padEnd(length, ' ').slice(0, length);
  return (
    <span className="fl" aria-hidden="true">
      {padded.split('').map((ch, i) => (
        <span key={`${i}-${ch}`} className="fl-c" style={{ ['--i' as string]: i }}>{ch === ' ' ? ' ' : ch}</span>
      ))}
    </span>
  );
}

export function DepartureBoard() {
  const [active, setActive] = useState(ROLES[0].id);
  const role = ROLES.find((r) => r.id === active) ?? ROLES[0];

  return (
    <div className="gp" data-reveal>
      <div className="bd">
        <div className="bd-head" aria-hidden="true">
          <span>Departures · Dream roles</span>
          <span className="bd-clock">CAREERGPS</span>
        </div>
        <div className="bd-cols" aria-hidden="true"><span>Destination</span><span>Ready</span><span>Status</span></div>
        <ul className="bd-rows" aria-label="Choose a dream role">
          {ROLES.map((r) => (
            <li key={r.id}>
              <button type="button" className="bd-row" aria-pressed={r.id === active} onClick={() => setActive(r.id)}
                aria-label={`${r.title}: ${r.readiness}% ready, ${status(r.readiness).toLowerCase()}`}>
                <Flaps text={r.title} length={22} />
                <Flaps text={`${r.readiness}%`} length={4} />
                <span className={`bd-status bd-status-${r.readiness >= 70 ? 'go' : r.readiness >= 55 ? 'open' : 'route'}`}>
                  <Flaps text={status(r.readiness)} length={9} />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="bd-hint" aria-hidden="true">Select a destination to print your pass ↓</p>
      </div>

      <article className="bp" key={role.id} aria-live="polite" aria-label={`Boarding pass for ${role.title}`}>
        <div className="bp-main">
          <header className="bp-head">
            <span>Boarding pass · CareerGPS</span>
            <span className="bp-specimen">Illustrative</span>
          </header>
          <div className="bp-route">
            <div><small>From</small><strong>YOU</strong><span>Today</span></div>
            <svg className="bp-plane" viewBox="0 0 120 24" aria-hidden="true">
              <path d="M4 12h96" stroke="currentColor" strokeDasharray="3 5" />
              <path d="M104 12l-10-7v4l-6 3 6 3v4z" fill="currentColor" />
            </svg>
            <div className="bp-to"><small>To</small><strong>{role.code}</strong><span>{role.title}</span></div>
          </div>
          <div className="bp-meta">
            <div><small>Ready</small><b>{role.readiness}%</b></div>
            <div><small>Gate</small><b>{role.gate}</b></div>
            <div><small>Status</small><b>{status(role.readiness)}</b></div>
          </div>
          <p className="bp-label">Checks to clear</p>
          <ul className="bp-checks">
            {role.checks.map((c, i) => {
              const met = c.level >= c.target;
              return (
                <li key={c.name} style={{ ['--i' as string]: i }}>
                  <span className={`bp-tick${met ? ' is-met' : ''}`} aria-hidden="true">{met ? '✓' : ''}</span>
                  <span className="bp-check-name">{c.name}</span>
                  <span className="bp-gauge" aria-hidden="true"><i style={{ width: `${c.level}%` }} /><b style={{ left: `${c.target}%` }} /></span>
                  <span className="bp-gap">{met ? 'Clear' : `−${c.target - c.level}`}</span>
                </li>
              );
            })}
          </ul>
          <p className="bp-label">Connections</p>
          <ol className="bp-conn">
            {role.connections.map((c, i) => <li key={c} style={{ ['--i' as string]: i }}><span>{String(i + 1).padStart(2, '0')}</span>{c}</li>)}
          </ol>
        </div>
        <div className="bp-stub" aria-hidden="true">
          <small>Readiness</small>
          <strong>{role.readiness}<span>%</span></strong>
          <small>{role.code} · {role.gate}</small>
          <Barcode className="bp-barcode" />
        </div>
      </article>
      <p className="fineprint">Illustrative example of how CareerGPS will explain readiness. Scores are not real assessment results.</p>
    </div>
  );
}
