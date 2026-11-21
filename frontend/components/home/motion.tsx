'use client';

import { useEffect } from 'react';

/**
 * One place for the page's motion: scroll reveals, the sticky nav state, pointer tilt and
 * spotlight glow. The page is fully readable without it (server-rendered, no hidden content
 * until this runs) and it stays still for people who ask for reduced motion.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('js-motion');
    const cleanups: Array<() => void> = [];

    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        reveal.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));
    cleanups.push(() => reveal.disconnect());
    // Safety net for items the observer can miss (e.g. cards off to the side in a horizontal rail):
    // anything whose top has scrolled into view settles in place.
    const settle = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-in');
    });

    const nav = document.querySelector('.nv');
    const progress = document.querySelector<HTMLElement>('.sp-progress');
    const tracked = [...document.querySelectorAll<HTMLElement>('[data-progress]')];
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        nav?.classList.toggle('is-scrolled', window.scrollY > 12);
        settle();
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress?.style.setProperty('--p', String(max > 0 ? window.scrollY / max : 0));
        const vh = window.innerHeight;
        for (const el of tracked) {
          const box = el.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (vh * 0.8 - box.top) / (box.height * 0.75)));
          el.style.setProperty('--sp', reduce ? '1' : p.toFixed(3));
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    cleanups.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });

    if (!reduce && window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        const move = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width - 0.5;
          const y = (event.clientY - box.top) / box.height - 0.5;
          el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
          el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
          el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
          el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
        };
        const leave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
      });

      document.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
        const move = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${event.clientX - box.left}px`);
          el.style.setProperty('--my', `${event.clientY - box.top}px`);
        };
        el.addEventListener('pointermove', move);
        cleanups.push(() => el.removeEventListener('pointermove', move));
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
      root.classList.remove('js-motion');
    };
  }, []);
  return null;
}
