'use client';

import { useEffect } from 'react';

/** Pointer-driven motion for the landing page: 3D tilt + spotlight on `[data-tilt]` surfaces and a
 *  magnetic pull on `[data-magnet]` buttons. Only writes CSS custom properties (`--tx`, `--ty`,
 *  `--ax`, `--ay`, `--ang`, `--mx`, `--my`); the CSS decides what to do with them. Does nothing on
 *  touch devices or when the visitor prefers reduced motion. */
export function PointerFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let last: { x: number; y: number; target: EventTarget | null } | null = null;
    const active = new Set<HTMLElement>();

    const reset = (el: HTMLElement) => {
      el.style.removeProperty('--tx'); el.style.removeProperty('--ty');
      el.style.removeProperty('--ang'); el.classList.remove('is-lit');
      active.delete(el);
    };

    const frame = () => {
      raf = 0;
      if (!last) return;
      const node = last.target instanceof Element ? last.target : null;
      const tilt = node?.closest<HTMLElement>('[data-tilt]') ?? null;
      const magnet = node?.closest<HTMLElement>('[data-magnet]') ?? null;
      for (const el of active) if (el !== tilt && el !== magnet) reset(el);

      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (last.x - r.left) / r.width - 0.5; // -0.5 … 0.5
        const py = (last.y - r.top) / r.height - 0.5;
        // Rotate around the axis perpendicular to the pointer offset, so the near edge dips.
        tilt.style.setProperty('--ax', String(-py));
        tilt.style.setProperty('--ay', String(px));
        tilt.style.setProperty('--ang', `${Math.hypot(px, py) * 12}deg`);
        tilt.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
        tilt.style.setProperty('--my', `${(py + 0.5) * 100}%`);
        tilt.classList.add('is-lit');
        active.add(tilt);
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        magnet.style.setProperty('--tx', `${(last.x - (r.left + r.width / 2)) * 0.25}px`);
        magnet.style.setProperty('--ty', `${(last.y - (r.top + r.height / 2)) * 0.35}px`);
        active.add(magnet);
      }
    };

    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY, target: e.target };
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => { for (const el of [...active]) reset(el); };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      onLeave();
    };
  }, []);
  return null;
}
