/* @layer renderer-hud @kind hook */
/**
 * `prefers-reduced-motion: reduce`, live - the app already honours it in CSS
 * (every design-system view's own media query); this is the same signal read
 * once for the HUD's OWN motion system, which samples in JS instead of
 * declaring a CSS animation, so there is no media query for the browser to
 * apply on its own.
 *
 * THE DECISION THIS PHASE MAKES, DELIBERATELY (see `resolve-node-motion.ts`'s
 * own header for where it is applied): a looping `animation` is decorative by
 * construction - it is a clock the DOCUMENT drives for its own sake, not a
 * reaction to anything the player did - so reduced motion silences every
 * `animation` entry outright, regardless of its own `loop` value, and holds
 * the node at its rest keyframe (`at: 0`) instead. `transition` (a bound
 * value easing toward what it was already going to become) and `enter`/
 * `exit` keep running: they carry real information ("this counter changed",
 * "this heart arrived") over a short, non-repeating span, which is exactly
 * the essential motion accessibility guidance asks to preserve even under
 * reduced motion - only the purely ornamental, perpetual kind goes.
 */
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(() => (
    typeof window === 'undefined' ? false : window.matchMedia(QUERY).matches
  ));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia(QUERY);
    const onChange = (): void => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

export { useReducedMotion };
