/* @layer renderer-other @kind hook */
import { useState, useCallback, useEffect, type RefObject } from 'react';

interface FitSize {
  width: number;
  height: number;
}

interface CanvasFitParams {
  containerRef: RefObject<HTMLElement | null>;
  /** Canvas backing-store size. Twice the source resolution — the core presents at 2x. */
  bufW: number;
  bufH: number;
  /** Fill the container outright, ignoring the source proportions. */
  stretch?: boolean;
  /** Snap to a whole number of source pixels so none of them come out a different size. */
  pixelPerfect?: boolean;
}

/** The backing store is 2x the source resolution, so a source pixel is this many buffer pixels. */
const BUFFER_OVERSAMPLE = 2;

const getPixelRatio = (): number => {
  return window.devicePixelRatio || 1;
};

/**
 * Largest whole-source-pixel size that still fits.
 *
 * Measured in device pixels, not CSS pixels: at 125% or 150% display scaling a size that looks
 * like a clean multiple in CSS units lands on a fractional number of real pixels, and the uneven
 * pixel sizes this is meant to remove come straight back. Returns a CSS size for layout.
 */
const fitWholePixels = (containerW: number, containerH: number, bufW: number, bufH: number): FitSize => {
  const dpr = getPixelRatio();
  const sourceW = bufW / BUFFER_OVERSAMPLE;
  const sourceH = bufH / BUFFER_OVERSAMPLE;

  // Whole device pixels per source pixel. Never below 1 — a container too small for even 1:1 gets
  // the smallest honest size and overflows rather than collapsing to nothing.
  const scale = Math.max(1, Math.floor(Math.min((containerW * dpr) / sourceW, (containerH * dpr) / sourceH)));

  return { width: (sourceW * scale) / dpr, height: (sourceH * scale) / dpr };
};

/** Largest size preserving the source proportions, filling one axis exactly. */
const fitProportional = (containerW: number, containerH: number, bufW: number, bufH: number): FitSize => {
  const scale = Math.min(containerW / bufW, containerH / bufH);
  return { width: Math.floor(bufW * scale), height: Math.floor(bufH * scale) };
};

const useCanvasFit = (params: CanvasFitParams): FitSize => {
  const { containerRef, bufW, bufH, stretch = false, pixelPerfect = false } = params;
  const [size, setSize] = useState<FitSize>({ width: bufW, height: bufH });
  const [pixelRatio, setPixelRatio] = useState(getPixelRatio);

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

    setSize(pixelPerfect
      ? fitWholePixels(containerW, containerH, bufW, bufH)
      : fitProportional(containerW, containerH, bufW, bufH));
  }, [containerRef, bufW, bufH, stretch, pixelPerfect]);

  useEffect(() => {
    compute();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [compute]);

  // Dragging the window to a monitor with different display scaling changes how many real pixels a
  // CSS pixel is worth without changing the container's CSS size, so the resize observer above never
  // fires — this media query does. Re-armed on each change, because a query only ever matches the
  // ratio it was built with. Nothing but pixel-perfect mode depends on the ratio, so nothing else
  // pays for the listener.
  useEffect(() => {
    if (!pixelPerfect) return;
    const query = window.matchMedia(`(resolution: ${pixelRatio}dppx)`);
    const onChange = () => {
      setPixelRatio(getPixelRatio());
      compute();
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [compute, pixelPerfect, pixelRatio]);

  return size;
};

export { useCanvasFit };
export type { CanvasFitParams, FitSize };
