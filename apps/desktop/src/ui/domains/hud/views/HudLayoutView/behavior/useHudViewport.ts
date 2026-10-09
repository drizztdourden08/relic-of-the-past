/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SNES_HEIGHT, SNES_WIDTH } from '../../../hooks/hooks.constants';
import type { Size } from '@rotp/hud';
import { CANVAS_ID } from '../HudLayoutView.constants';
import type { HudViewport } from '../HudLayoutView.type';

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
