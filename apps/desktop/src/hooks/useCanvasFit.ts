import { useState, useCallback, useEffect, type RefObject } from 'react';

interface FitSize {
  width: number;
  height: number;
}

/**
 * useCanvasFit — computes CSS width/height to fit a buffer (bufW×bufH)
 * inside a container while maintaining aspect ratio.
 *
 * Formula: scale = min(containerW/bufW, containerH/bufH)
 *          cssW = floor(bufW * scale), cssH = floor(bufH * scale)
 *
 * This is the same formula used for the game canvas and FX canvas.
 * When stretch=true, fills the container ignoring aspect ratio.
 */
function useCanvasFit(
  containerRef: RefObject<HTMLElement | null>,
  bufW: number,
  bufH: number,
  stretch = false,
): FitSize {
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
}

export { useCanvasFit };
export type { FitSize };
