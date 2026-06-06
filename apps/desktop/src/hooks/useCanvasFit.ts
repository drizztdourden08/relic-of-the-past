/* @layer renderer-other @kind hook */
import { useState, useCallback, useEffect, type RefObject } from 'react';

interface FitSize {
  width: number;
  height: number;
}

const useCanvasFit = (containerRef: RefObject<HTMLElement | null>, bufW: number, bufH: number, stretch = false): FitSize => {
  const [size, setSize] = useState<FitSize>({ width: bufW, height: bufH });

  const compute = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const containerW = el.clientWidth;
    const containerH = el.clientHeight;
    if (!containerW || !containerH) return;

    if (stretch) {
      setSize({ width: containerW, height: containerH });
      return;
    }

    if (!bufW || !bufH) return;

    const scale = Math.min(containerW / bufW, containerH / bufH);
    setSize({
      width: Math.floor(bufW * scale),
      height: Math.floor(bufH * scale),
    });
  }, [containerRef, bufW, bufH, stretch]);

  useEffect(() => {
    compute();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [compute]);

  return size;
};

export { useCanvasFit };
export type { FitSize };
