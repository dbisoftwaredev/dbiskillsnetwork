'use client';

import { useEffect, useState } from 'react';

const WORDS = ['seen.', 'hired.', 'verified.', 'funded.', 'connected.'];

const useReducedMotion = () => {
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  return reduce;
};

/** The headline's last word, cycling. Screen readers get the first word only. */
export function RotatingWord() {
  const reduce = useReducedMotion();
  const [state, setState] = useState({ i: 0, prev: -1 });
  useEffect(() => {
    if (reduce) return;
    const start = window.setTimeout(() => {
      const timer = window.setInterval(() => setState((s) => ({ i: (s.i + 1) % WORDS.length, prev: s.i })), 2600);
      cleanup = () => window.clearInterval(timer);
    }, 2200);
    let cleanup = () => {};
    return () => { window.clearTimeout(start); cleanup(); };
  }, [reduce]);

  return (
    <span className="rw">
      <span className="sr-only">{WORDS[0]}</span>
      <span className="rw-sizer" aria-hidden="true">connected.</span>
      {state.prev >= 0 ? <span key={`p${state.prev}-${state.i}`} className="rw-word is-out" aria-hidden="true">{WORDS[state.prev]}</span> : null}
      <span key={`c${state.i}`} className={`rw-word${state.prev >= 0 ? ' is-in' : ' is-first'}`} aria-hidden="true">{WORDS[state.i]}</span>
    </span>
  );
}
