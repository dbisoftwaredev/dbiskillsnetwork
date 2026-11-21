// Generative woven pattern: the DBI signature. Built from kente's structure (bands of
// woven blocks: stripes, checks, zigzags, diamonds) in the brand palette. Deterministic
// per seed, so server and client render identical markup. Decorative only.
import type { ReactNode } from 'react';

const PALETTE = ['#10263B', '#128F8A', '#64DCD1', '#D9AB60', '#F2F5FA'];
const WIDTHS = [18, 24, 36, 48, 60, 84];
const KINDS = ['solid', 'vstripe', 'hstripe', 'check', 'zig', 'diamond', 'vstripe', 'check'] as const;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function Block({ x, w, h, kind, bg, fg }: { x: number; w: number; h: number; kind: (typeof KINDS)[number]; bg: string; fg: string }) {
  const parts: ReactNode[] = [<rect key="bg" x={x} y={0} width={w} height={h} fill={bg} />];
  if (kind === 'vstripe') {
    for (let i = 3; i < w; i += 7) parts.push(<rect key={i} x={x + i} y={0} width={3} height={h} fill={fg} />);
  } else if (kind === 'hstripe') {
    for (let j = 3; j < h; j += 7) parts.push(<rect key={j} x={x} y={j} width={w} height={3} fill={fg} />);
  } else if (kind === 'check') {
    const c = 6;
    for (let i = 0; i < w; i += c) for (let j = 0; j < h; j += c) if (((i + j) / c) % 2 === 0) parts.push(<rect key={`${i}-${j}`} x={x + i} y={j} width={Math.min(c, w - i)} height={Math.min(c, h - j)} fill={fg} />);
  } else if (kind === 'zig') {
    let d = `M${x} ${h}`;
    for (let i = 0; i <= w; i += 8) d += `L${x + i + 4} ${h * 0.25}L${Math.min(x + i + 8, x + w)} ${h}`;
    parts.push(<path key="z" d={d} fill={fg} />);
  } else if (kind === 'diamond') {
    const cx = x + w / 2;
    parts.push(<path key="d" d={`M${cx} 3L${cx + Math.min(w, h) / 2 - 2} ${h / 2}L${cx} ${h - 3}L${cx - Math.min(w, h) / 2 + 2} ${h / 2}Z`} fill={fg} />);
    parts.push(<rect key="l" x={x} y={h / 2 - 1} width={w} height={2} fill={fg} opacity={0.6} />);
  }
  return <>{parts}</>;
}

function band(seed: number, width: number, h: number) {
  const r = rng(seed);
  const blocks: { x: number; w: number; kind: (typeof KINDS)[number]; bg: string; fg: string }[] = [];
  let x = 0;
  while (x < width) {
    const w = WIDTHS[Math.floor(r() * WIDTHS.length)];
    const kind = KINDS[Math.floor(r() * KINDS.length)];
    const bgI = Math.floor(r() * PALETTE.length);
    let fgI = Math.floor(r() * PALETTE.length);
    if (fgI === bgI) fgI = (fgI + 2) % PALETTE.length;
    blocks.push({ x, w, kind, bg: PALETTE[bgI], fg: PALETTE[fgI] });
    x += w + 2;
  }
  return blocks.map((b, i) => (
    <g key={i} className="kt-block" style={{ ['--i' as string]: i }}>
      <Block {...b} h={h} />
    </g>
  ));
}

/** A thin woven strip, used as a chapter divider. Reveals block by block. */
export function KenteBand({ seed = 7, className, height = 22 }: { seed?: number; className?: string; height?: number }) {
  return (
    <div className={`kt-band${className ? ` ${className}` : ''}`} data-reveal aria-hidden="true">
      <svg viewBox={`0 0 1600 ${height}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        {band(seed, 1600, height)}
      </svg>
    </div>
  );
}

/** A woven field of stacked bands, for textured backgrounds. */
export function KenteField({ seed = 3, rows = 10, className }: { seed?: number; rows?: number; className?: string }) {
  const h = 22;
  return (
    <svg className={className} viewBox={`0 0 800 ${rows * (h + 6)}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {Array.from({ length: rows }, (_, row) => (
        <g key={row} transform={`translate(0 ${row * (h + 6)})`}>{band(seed * 31 + row * 7, 800, h)}</g>
      ))}
    </svg>
  );
}

/** A tiny three-block swatch that marks every section label. */
export function KenteSwatch({ seed = 1 }: { seed?: number }) {
  return (
    <svg className="kt-swatch" viewBox="0 0 34 12" aria-hidden="true" focusable="false">
      {band(seed * 13 + 5, 34, 12)}
    </svg>
  );
}
