/* @layer renderer-other @kind hook */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { DEFAULT_REM_PX } from './use-is-narrow.constants';

const remPx = (): number => {
  if (typeof document === 'undefined') return DEFAULT_REM_PX;
  const size = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) && size > 0 ? size : DEFAULT_REM_PX;
};

const useIsNarrow = (ref: RefObject<HTMLElement | null>, belowRem: number): boolean => {
  const [narrow, setNarrow] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const measure = (): void => {
      const width = element.clientWidth;
      const isLaidOut = width > 0;
      if (isLaidOut) setNarrow(width < belowRem * remPx());
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, belowRem]);

  return narrow;
};

export { useIsNarrow };
