/* @layer renderer-hud @kind hook */
/**
 * Display scale and the size of the play field in SNES pixels.
 *
 * Scale comes off the CANVAS's own native height, not off a constant, because
 * the core can be running in 240-line mode. Measuring against a hardcoded 224
 * would leave the whole HUD a few percent oversized exactly when the extra rows
 * are visible. Width is then derived from that same scale, so a wide display
 * reports a wide play field and an anchored element keeps its own corner.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SNES_HEIGHT, SNES_WIDTH } from '../../../hooks/useHud';
import type { Size } from '@shared/hud/layouts';

const CANVAS_ID = 'canvas';

interface HudViewport {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  /** The container measured in SNES pixels, which placeElement anchors against. */
  view: Size;
}

const useHudViewport = (): HudViewport => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(2);
  const [view, setView] = useState<Size>({ w: SNES_WIDTH, h: SNES_HEIGHT });

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w <= 0 || h <= 0) return;

    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
    const nativeH = canvas && canvas.height > 0 ? canvas.height / 2 : SNES_HEIGHT;
    const next = h / nativeH;

    setScale(next);
    setView({ w: w / next, h: nativeH });
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, scale, view };
};

export { useHudViewport };
export type { HudViewport };
