/* @layer store-site @kind hook */
/**
 * After each press of Submit, brings the first field outlined in red into view and puts the
 * cursor in its control when it has one. Smooth unless the player asked for less motion.
 */
import { useEffect } from 'react';

const INVALID_FIELD = '.publish .field--invalid';
const FOCUSABLE = 'input:not([type="file"]), textarea, button';

const useScrollToFirstError = (attempts: number) => {
  useEffect(() => {
    if (attempts === 0) return;
    const first = document.querySelector<HTMLElement>(INVALID_FIELD);
    if (!first) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    first.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    first.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
  }, [attempts]);
};

export { useScrollToFirstError };
