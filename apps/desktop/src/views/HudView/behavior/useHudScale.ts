/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { aspectRatioValue } from '@rotp/game-core';
import { SNES_HEIGHT } from '../../../hooks/hooks.constants';
import type { HudScale, HudScaleParams } from '../HudView.type';

const useHudScale = ({ ratio, customW, customH }: HudScaleParams): HudScale => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(2);
  const [hudWidth, setHudWidth] = useState<number | undefined>(undefined);

  const computeScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const nativeH = canvas ? canvas.height / 2 : SNES_HEIGHT;
    const newScale = h / nativeH;
    setScale(newScale);

    const numericRatio = aspectRatioValue(ratio, customW, customH);
    if (numericRatio <= 0) {
      setHudWidth(undefined);
    } else {
      const screenRatio = w / h;
      const effectiveRatio = Math.min(numericRatio, screenRatio);
      setHudWidth(Math.floor(h * effectiveRatio));
    }
  }, [ratio, customW, customH]);

  useEffect(() => {
    computeScale();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => computeScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeScale]);

  return { containerRef, scale, hudWidth };
};

export { useHudScale };
