/* @layer renderer-components @kind hook */
import { useLayoutEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { BoxSize, OverlayMetrics } from '../PadOverlay.type';
import { RESIZE_SETTLE_MS } from '../PadOverlay.constants';
import { textMeasure } from './text-measure';

const sameSize = (a: BoxSize | null, b: BoxSize): boolean => a !== null && a.width === b.width && a.height === b.height;

const useOverlayMetrics = (ref: RefObject<HTMLElement | null>): OverlayMetrics | null => {
  const [size, setSize] = useState<BoxSize | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = { width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) };
      clearTimeout(timer);
      timer = setTimeout(() => setSize((previous) => (sameSize(previous, next) ? previous : next)), RESIZE_SETTLE_MS);
    });
    observer.observe(element);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref]);

  return useMemo(() => {
    const element = ref.current;
    if (!size || !element || size.width === 0 || size.height === 0) return null;
    return { ...size, ...textMeasure(element) };
  }, [size, ref]);
};

export { useOverlayMetrics };
