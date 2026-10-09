/* @layer renderer-other @kind hook */
import { useState, useCallback, useEffect } from 'react';
import type { CanvasFitParams, FitSize } from './useCanvasFit.type';
import { BUFFER_OVERSAMPLE } from './useCanvasFit.constants';

const getPixelRatio = (): number => {
  return window.devicePixelRatio || 1;
};

const fitWholePixels = (containerW: number, containerH: number, bufW: number, bufH: number): FitSize => {
  const dpr = getPixelRatio();
  const sourceW = bufW / BUFFER_OVERSAMPLE;
  const sourceH = bufH / BUFFER_OVERSAMPLE;

  const scale = Math.max(1, Math.floor(Math.min((containerW * dpr) / sourceW, (containerH * dpr) / sourceH)));

  return { width: (sourceW * scale) / dpr, height: (sourceH * scale) / dpr };
};

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
