/* @layer store-site @kind hook */
/**
 * Which featured item the hero shows: it moves on by itself every few seconds, stops while
 * the pointer or focus is on the hero, and never moves for a player who asked for reduced
 * motion. Picking a dot shows that one.
 */
import { useCallback, useEffect, useState } from 'react';

const ROTATE_MS = 8000;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useRotation = (count: number) => {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (count < 2 || held || prefersReducedMotion()) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count, held]);

  const hold = useCallback(() => setHeld(true), []);
  const release = useCallback(() => setHeld(false), []);

  return { index: count ? index % count : 0, select: setIndex, hold, release };
};

export { useRotation };
