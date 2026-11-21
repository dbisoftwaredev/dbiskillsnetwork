'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { Crest } from './art';

const CANDIDATES = [
  { initials: 'CA', name: 'Candidate A', role: 'Field Deployment Supervisor', fit: 86, marks: ['Fibre splicing · DBI verified', 'Site safety · DBI verified'], ref: 'EV-2026-0412' },
  { initials: 'CB', name: 'Candidate B', role: 'Field Deployment Supervisor', fit: 79, marks: ['OTDR testing · Demonstrated', 'Work sample · Reviewed'], ref: 'EV-2026-0388' },
  { initials: 'CC', name: 'Candidate C', role: 'Field Deployment Supervisor', fit: 74, marks: ['Site safety · DBI verified', 'Project reference · Confirmed'], ref: 'EV-2026-0351' },
];

/**
 * "Inspect the evidence": a UV lamp follows the pointer and reveals the fluorescent
 * verification marks hidden in each dossier. Touch and keyboard users switch the lamp on.
 */
export function UvInspect() {
  const [lampOn, setLampOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--ux', `${event.clientX - box.left}px`);
    ref.current.style.setProperty('--uy', `${event.clientY - box.top}px`);
    // Each dossier's hidden layer is masked around the lamp in its own coordinates.
    ref.current.querySelectorAll<HTMLElement>('.uv-card').forEach((card) => {
      const c = card.getBoundingClientRect();
      card.style.setProperty('--cx', `${event.clientX - c.left}px`);
      card.style.setProperty('--cy', `${event.clientY - c.top}px`);
    });
    ref.current.classList.add('is-hover');
  };

  return (
    <div className="uv-wrap" data-reveal>
      <div ref={ref} className={`uv${lampOn ? ' is-on' : ''}`} onPointerMove={move} onPointerLeave={() => ref.current?.classList.remove('is-hover')}>
        {CANDIDATES.map((c, i) => (
          <article key={c.name} className="uv-card" style={{ ['--i' as string]: i }}>
            <div className="uv-visible">
              <span className="uv-avatar">{c.initials}</span>
              <div className="uv-who"><strong>{c.name}</strong><span>{c.role}</span></div>
              <div className="uv-fit"><b>{c.fit}%</b><span>role fit</span></div>
            </div>
            <div className="uv-hidden" aria-hidden={!lampOn}>
              <Crest className="uv-crest" id={`uv-crest-${i}`} />
              <ul>{c.marks.map((m) => <li key={m}>{m}</li>)}</ul>
              <span className="uv-ref">{c.ref}</span>
            </div>
          </article>
        ))}
        <p className="uv-note">Shortlist · Illustrative · Contact details stay private until the candidate agrees.</p>
      </div>
      <button type="button" className="uv-toggle" aria-pressed={lampOn} onClick={() => setLampOn((v) => !v)}>
        <span className="uv-bulb" aria-hidden="true" />{lampOn ? 'Switch off UV lamp' : 'Switch on UV lamp'}
      </button>
    </div>
  );
}
