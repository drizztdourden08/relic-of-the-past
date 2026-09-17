/* @layer renderer-widgets @kind hook */
/**
 * The HUD scale a tab draws at, from the width it has. The pause components take an
 * integer-ish scale (1 SNES pixel = scale CSS pixels), so the tab says how many tiles wide
 * its widest row is and gets the largest quarter-step scale that fits, the same way
 * PauseMenuView derives its scale from the game view's height.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Quarter steps keep every tile an integer number of pixels at the common widget widths. */
const SCALE_STEP = 0.25;
const SCALE_MIN = 0.75;
const SCALE_MAX = 2.5;
const SNES_TILE = 8;

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

export { useConsoleScale, scaleFor };
