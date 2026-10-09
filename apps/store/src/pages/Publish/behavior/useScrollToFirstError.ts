/* @layer store-site @kind hook */
import { useEffect } from 'react';
import { FOCUSABLE, INVALID_FIELD } from './useScrollToFirstError.constants';

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
