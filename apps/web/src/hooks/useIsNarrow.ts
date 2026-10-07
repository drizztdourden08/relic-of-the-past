/* @layer renderer-other @kind hook */
/**
 * Whether an element is narrower than a width given in rem: measured on the element itself,
 * so a pane squeezed by its neighbours answers the same as a small window. A layout that
 * changes shape when narrow (a side pane becoming a tab) reads this; one that only restyles
 * uses a container query instead.
 *
 * With no ResizeObserver (a DOM-less test) nothing is measured and the answer stays "wide".
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

const DEFAULT_REM_PX = 16;

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
      // An element of no width has not been laid out yet; it says nothing about the window.
      if (width > 0) setNarrow(width < belowRem * remPx());
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, belowRem]);

  return narrow;
};

export { useIsNarrow };
