/* @layer store-site @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { ROTATE_MS } from './useRotation.constants';

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
