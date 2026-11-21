// Security-print illustration kit for the landing page: guilloché, crest, rubber stamps,
// portrait, route map and ink line drawings. Everything here is decorative (aria-hidden).
import type { CSSProperties, ReactNode } from 'react';

const f = (n: number) => Math.round(n * 10) / 10;

/** Concentric rings whose radius ripples: the classic banknote rosette. */
function rosettePath(rings: number, base: number, gap: number, amp: number, lobes: number, steps = 160) {
  let d = '';
  for (let i = 0; i < rings; i++) {
    const r0 = base + i * gap;
    const phase = i * 0.42;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * Math.PI * 2;
      const r = r0 + amp * Math.sin(lobes * t + phase) + amp * 0.4 * Math.sin((lobes * 3) * t - phase);
      d += `${s ? 'L' : 'M'}${f(Math.cos(t) * r)} ${f(Math.sin(t) * r)}`;
    }
  }
  return d;
}

/** Interlaced sine waves for horizontal security bands. */
function wavePath(lines: number, width: number, height: number, cycles: number) {
  let d = '';
  const steps = 120;
  for (let i = 0; i < lines; i++) {
    const phase = (i / lines) * Math.PI;
    for (let s = 0; s <= steps; s++) {
      const x = (s / steps) * width;
      const y = height / 2 + Math.sin((s / steps) * Math.PI * 2 * cycles + phase) * (height / 2 - 2) * Math.cos(phase / 2);
      d += `${s ? 'L' : 'M'}${f(x)} ${f(y)}`;
    }
  }
  return d;
}

/** Shared defs, rendered once: patterns, ink texture and foil gradients. */
export function ArtSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="g-rosette" viewBox="-200 -200 400 400">
          <path d={rosettePath(16, 70, 7.5, 9, 9)} fill="none" stroke="currentColor" strokeWidth=".6" />
        </symbol>
        <symbol id="g-rosette-sm" viewBox="-120 -120 240 240">
          <path d={rosettePath(9, 40, 7, 6, 12, 140)} fill="none" stroke="currentColor" strokeWidth=".7" />
        </symbol>
        <symbol id="g-waves" viewBox="0 0 600 60" preserveAspectRatio="none">
          <path d={wavePath(9, 600, 60, 7)} fill="none" stroke="currentColor" strokeWidth=".7" />
        </symbol>
        <filter id="g-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" result="inked" />
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9" result="warp" />
          <feDisplacementMap in="inked" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="g-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3DDB0" />
          <stop offset=".35" stopColor="#D9AB60" />
          <stop offset=".55" stopColor="#FBEBC8" />
          <stop offset=".8" stopColor="#B8873E" />
          <stop offset="1" stopColor="#ECD09A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Rosette({ className, small = false }: { className?: string; small?: boolean }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false" viewBox={small ? '-120 -120 240 240' : '-200 -200 400 400'}>
      <use href={small ? '#g-rosette-sm' : '#g-rosette'} />
    </svg>
  );
}

export function Waves({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false" viewBox="0 0 600 60" preserveAspectRatio="none">
      <use href="#g-waves" />
    </svg>
  );
}

/** The DBI crest: a network constellation inside a lettered seal, struck in foil. */
export function Crest({ className, id = 'crest' }: { className?: string; id?: string }) {
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [f(Math.cos(a) * 34), f(Math.sin(a) * 34)];
  });
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <defs><path id={`${id}-ring`} d="M -74 0 a 74 74 0 1 1 148 0 a 74 74 0 1 1 -148 0" /></defs>
      <g fill="none" stroke="url(#g-foil)">
        <circle r="94" strokeWidth="1.4" />
        <circle r="88" strokeWidth=".7" strokeDasharray="1.2 3.2" />
        <circle r="60" strokeWidth="1.2" />
      </g>
      <text fill="url(#g-foil)" fontSize="11.5" letterSpacing="4.2" fontFamily="var(--font-mono), monospace">
        <textPath href={`#${id}-ring`} startOffset="0">DIGITAL BRIDGE INSTITUTE · SKILLS PASSPORT ·</textPath>
      </text>
      <g stroke="url(#g-foil)" strokeWidth="1.3" fill="none">
        {nodes.map(([x, y], i) => {
          const [nx, ny] = nodes[(i + 2) % 6];
          return <path key={`l${i}`} d={`M${x} ${y}L${nx} ${ny}M${x} ${y}L0 0`} />;
        })}
      </g>
      {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="url(#g-foil)" />)}
      <circle r="10" fill="url(#g-foil)" />
    </svg>
  );
}

type StampProps = {
  id: string; top: string; word: string; bottom?: string; date?: string;
  tone?: 'teal' | 'red' | 'blue' | 'gold' | 'ink'; shape?: 'circle' | 'rect' | 'oval'; dashed?: boolean;
  className?: string; style?: CSSProperties;
};

/** A rubber-stamp impression with ink grain. */
export function Stamp({ id, top, word, bottom, date, tone = 'teal', shape = 'circle', dashed = false, className, style }: StampProps) {
  const dash = dashed ? '5 4' : undefined;
  let body: ReactNode;
  if (shape === 'rect') {
    body = (
      <>
        <rect x="-92" y="-52" width="184" height="104" rx="8" fill="none" stroke="currentColor" strokeWidth="4.5" strokeDasharray={dash} />
        <rect x="-84" y="-44" width="168" height="88" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text y="-22" textAnchor="middle" fontSize="12" letterSpacing="3" fill="currentColor" fontFamily="var(--font-mono), monospace">{top}</text>
        <text y="12" textAnchor="middle" fontSize="27" fontWeight="800" letterSpacing="1" fill="currentColor" fontFamily="var(--font-sans), sans-serif">{word}</text>
        {date ? <text y="34" textAnchor="middle" fontSize="12" letterSpacing="2" fill="currentColor" fontFamily="var(--font-mono), monospace">{date}</text> : null}
      </>
    );
  } else {
    const rx = shape === 'oval' ? 96 : 84;
    const ry = shape === 'oval' ? 62 : 84;
    const tr = shape === 'oval' ? null : 66;
    body = (
      <>
        <defs>
          {tr ? (
            <>
              <path id={`${id}-t`} d={`M ${-tr} 0 a ${tr} ${tr} 0 0 1 ${tr * 2} 0`} />
              <path id={`${id}-b`} d={`M ${-tr - 10} 0 a ${tr + 10} ${tr + 10} 0 0 0 ${(tr + 10) * 2} 0`} />
            </>
          ) : null}
        </defs>
        <ellipse rx={rx} ry={ry} fill="none" stroke="currentColor" strokeWidth="4.5" strokeDasharray={dash} />
        <ellipse rx={rx - 9} ry={ry - 9} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {tr ? (
          <>
            <text fontSize="13" letterSpacing="3.4" fill="currentColor" fontFamily="var(--font-mono), monospace">
              <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">{top}</textPath>
            </text>
            {bottom ? (
              <text fontSize="12" letterSpacing="3" fill="currentColor" fontFamily="var(--font-mono), monospace" dy="-2">
                <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">{bottom}</textPath>
              </text>
            ) : null}
            <path d="M-50 -16H50M-50 22H50" stroke="currentColor" strokeWidth="1.5" />
            <text y="12" textAnchor="middle" fontSize={word.length > 9 ? 19 : 24} fontWeight="800" letterSpacing=".5" fill="currentColor" fontFamily="var(--font-sans), sans-serif">{word}</text>
            {date ? <text y="40" textAnchor="middle" fontSize="11" letterSpacing="2" fill="currentColor" fontFamily="var(--font-mono), monospace">{date}</text> : null}
          </>
        ) : (
          <>
            <text y="-20" textAnchor="middle" fontSize="11.5" letterSpacing="3" fill="currentColor" fontFamily="var(--font-mono), monospace">{top}</text>
            <text y="10" textAnchor="middle" fontSize="24" fontWeight="800" fill="currentColor" fontFamily="var(--font-sans), sans-serif">{word}</text>
            {date ? <text y="32" textAnchor="middle" fontSize="11" letterSpacing="2" fill="currentColor" fontFamily="var(--font-mono), monospace">{date}</text> : null}
          </>
        )}
      </>
    );
  }
  return (
    <svg className={`st st-${tone}${className ? ` ${className}` : ''}`} style={style} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <g filter="url(#g-ink)">{body}</g>
    </svg>
  );
}

/** Engraved portrait: a hatched bust, deliberately not a real person. */
export function Portrait({ className }: { className?: string }) {
  const lines = Array.from({ length: 34 }, (_, i) => i * 4 - 4);
  return (
    <svg className={className} viewBox="0 0 120 150" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="pt-bust">
          <circle cx="60" cy="56" r="26" />
          <path d="M14 150c2-34 20-52 46-52s44 18 46 52z" />
        </clipPath>
      </defs>
      <g clipPath="url(#pt-bust)" stroke="currentColor" strokeWidth="1.1">
        {lines.map((y) => <path key={y} d={`M0 ${y}q30 ${-6} 60 0t60 0`} fill="none" />)}
      </g>
      <path d="M43 40c4-12 30-14 36 2 2 6 1 12-1 16" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Hand-inked line drawings for the six engines. */
export function EngineArt({ kind }: { kind: 'registry' | 'verify' | 'gps' | 'bridge' | 'hub' | 'iq' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const art: Record<typeof kind, ReactNode> = {
    registry: (
      <g {...common}>
        <rect x="30" y="34" width="120" height="78" rx="6" transform="rotate(-6 90 73)" />
        <rect x="48" y="44" width="120" height="78" rx="6" />
        <circle cx="74" cy="72" r="12" /><path d="M96 66h50M96 78h34M62 104h92" />
        <path d="M168 60l14-8M168 84h18M168 108l14 8" strokeDasharray="2 4" />
      </g>
    ),
    verify: (
      <g {...common}>
        <path d="M100 22l44 16v32c0 30-20 50-44 60-24-10-44-30-44-60V38z" />
        <path d="M100 36l32 12v22c0 22-14 38-32 46-18-8-32-24-32-46V48z" strokeDasharray="2 4" />
        <path d="M84 78l12 12 22-26" strokeWidth="3" />
      </g>
    ),
    gps: (
      <g {...common}>
        <path d="M24 124c36 0 30-48 70-48s30-46 76-46" strokeDasharray="6 6" />
        <circle cx="24" cy="124" r="6" /><circle cx="94" cy="76" r="5" />
        <path d="M170 46c-10-12-16-19-16-27a16 16 0 0132 0c0 8-6 15-16 27z" /><circle cx="170" cy="19" r="5" />
      </g>
    ),
    bridge: (
      <g {...common}>
        <path d="M12 112h176M24 112C60 40 140 40 176 112" />
        {[44, 62, 80, 100, 120, 138, 156].map((x) => {
          const t = (x - 24) / 152;
          return <path key={x} d={`M${x} ${f(112 - 4 * 54 * t * (1 - t))}V112`} />;
        })}
        <path d="M24 112v14M176 112v14" strokeWidth="3" />
      </g>
    ),
    hub: (
      <g {...common}>
        <circle cx="100" cy="74" r="18" /><path d="M92 74l6 6 10-12" strokeWidth="2.4" />
        {[0, 60, 120, 180, 240, 300].map((d) => {
          const a = (d * Math.PI) / 180;
          const x = f(100 + Math.cos(a) * 70);
          const y = f(74 + Math.sin(a) * 46);
          return <g key={d}><path d={`M${f(100 + Math.cos(a) * 20)} ${f(74 + Math.sin(a) * 20)}L${x} ${y}`} strokeDasharray="2 4" /><rect x={x - 12} y={y - 9} width="24" height="18" rx="4" /></g>;
        })}
      </g>
    ),
    iq: (
      <g {...common}>
        <path d="M20 126h170" />
        {[[34, 56], [58, 80], [82, 64], [106, 96], [130, 84], [154, 108]].map(([x, h]) => <rect key={x} x={x} y={126 - h} width="14" height={h} rx="2" />)}
        <path d="M30 92l26-20 24 10 26-30 24 10 26-28" strokeWidth="2.2" />
      </g>
    ),
  };
  return <svg className="eng-art" viewBox="0 0 200 140" aria-hidden="true" focusable="false">{art[kind]}</svg>;
}

/** Hand-drawn underline that writes itself under a word. */
export function Swash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M4 20C70 8 150 6 230 10s120 8 166-2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" pathLength={1} />
    </svg>
  );
}

/** Decorative barcode with a fixed pattern. */
export function Barcode({ className }: { className?: string }) {
  const widths = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 4, 1, 1, 2, 3, 1, 2, 2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 2];
  let x = 0;
  return (
    <svg className={className} viewBox="0 0 84 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {widths.map((w, i) => {
        const bar = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="40" fill="currentColor" /> : null;
        x += w * 1.1;
        return bar;
      })}
    </svg>
  );
}
