// Hero: three drifting columns of large portrait cards of African talent. People first, minimal chrome.
// Personas are illustrative; photos are Unsplash stand-ins.

type Card =
  | { kind: 'person'; photo: string; name: string; track: string; base: string; level: 'Declared' | 'Demonstrated'; no: string }
  | { kind: 'stamp'; word: string; top: string; note: string }
  | { kind: 'ready'; pct: number; role: string };

const COLUMNS: Card[][] = [
  [
    { kind: 'person', photo: 'y-ada', name: 'Ada', track: 'Network engineering', base: 'Lagos', level: 'Demonstrated', no: '0001' },
    { kind: 'person', photo: 'y-kwame', name: 'Kwame', track: 'Software engineering', base: 'Accra', level: 'Demonstrated', no: '0186' },
    { kind: 'stamp', word: 'Verified', top: 'Cloud fundamentals', note: 'Assessed · signed' },
    { kind: 'person', photo: 'y-zuri', name: 'Zuri', track: 'UI/UX design', base: 'Nairobi', level: 'Declared', no: '0233' },
  ],
  [
    { kind: 'person', photo: 'y-tobi', name: 'Tobi', track: 'Frontend development', base: 'Ibadan', level: 'Demonstrated', no: '0351' },
    { kind: 'ready', pct: 72, role: 'Cloud Engineer' },
    { kind: 'person', photo: 'y-fatima', name: 'Fatima', track: 'Data analytics', base: 'Kano', level: 'Declared', no: '0274' },
    { kind: 'person', photo: 'y-sipho', name: 'Sipho', track: 'Digital content', base: 'Johannesburg', level: 'Declared', no: '0297' },
  ],
  [
    { kind: 'person', photo: 'y-amaka', name: 'Amaka', track: 'Product management', base: 'Enugu', level: 'Declared', no: '0388' },
    { kind: 'person', photo: 'y-david', name: 'David', track: 'Backend engineering', base: 'Kampala', level: 'Demonstrated', no: '0412' },
    { kind: 'person', photo: 'y-nia', name: 'Nia', track: 'Cybersecurity', base: 'Kigali', level: 'Demonstrated', no: '0129' },
    { kind: 'person', photo: 'y-emeka', name: 'Emeka', track: 'Cloud support', base: 'Abuja', level: 'Demonstrated', no: '0263' },
  ],
];

function CardView({ card, hidden }: { card: Card; hidden: boolean }) {
  if (card.kind === 'person') {
    return (
      <article className="hw-card hw-person">
        <img src={`/images/people/${card.photo}.webp`} alt={hidden ? '' : `${card.name}, illustrative ${card.track.toLowerCase()} talent`} width={900} height={1100}
          loading={hidden ? 'lazy' : 'eager'} decoding="async" />
        <div className="hw-meta">
          <strong>{card.name}</strong>
          <span>{card.track} · {card.base}</span>
        </div>
      </article>
    );
  }
  if (card.kind === 'stamp') {
    return (
      <article className="hw-card hw-stampcard">
        <span className="hw-seal mono"><b>{card.word}</b><small>{card.top}</small><small>{card.note}</small></span>
        <p>Skills confirmed by DBI evaluators, recognised by employers across the continent.</p>
      </article>
    );
  }
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <article className="hw-card hw-ready">
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={r} className="hw-ring-bg" />
        <circle cx="40" cy="40" r={r} className="hw-ring" strokeDasharray={c} strokeDashoffset={c * (1 - card.pct / 100)} transform="rotate(-90 40 40)" />
      </svg>
      <strong>{card.pct}%</strong>
      <span>ready for {card.role}</span>
      <small className="mono">CareerGPS · illustrative</small>
    </article>
  );
}

export function HeroWall() {
  return (
    <div className="hw" aria-label="Illustrative passport holders">
      {COLUMNS.map((col, i) => (
        <div key={i} className={`hw-col hw-col-${i}`}>
          <div className="hw-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="hw-set" aria-hidden={copy === 1 ? true : undefined}>
                {col.map((card, k) => <CardView key={k} card={card} hidden={copy === 1} />)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
