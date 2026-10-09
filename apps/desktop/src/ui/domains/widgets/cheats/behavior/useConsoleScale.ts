/* @layer renderer-widgets @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SCALE_MAX, SCALE_MIN, SCALE_STEP, SNES_TILE } from '../CheatsWidget.constants';

const scaleFor = (width: number, tilesWide: number): number => {
  const raw = width / (tilesWide * SNES_TILE);
  const stepped = Math.floor(raw / SCALE_STEP) * SCALE_STEP;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, stepped));
};

const useConsoleScale = (tilesWide: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || el.clientWidth <= 0) return;
    setScale(scaleFor(el.clientWidth, tilesWide));
  }, [tilesWide]);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { ref, scale };
};

export { useConsoleScale };
