/* @layer renderer-hud @kind hook */
import { useCallback, useState } from 'react';
import { canvasNativeHeight } from '../../../hooks/canvas-native-height';
import { SNES_HEIGHT, SNES_WIDTH } from '../../../hooks/hooks.constants';
import { useResizeMeasure } from '../../../hooks/useResizeMeasure';
import type { Size } from '@rotp/hud';
import { CANVAS_ID } from '../HudLayoutView.constants';
import type { HudViewport } from '../HudLayoutView.type';

const useHudViewport = (): HudViewport => {
  const [scale, setScale] = useState(2);
  const [view, setView] = useState<Size>({ w: SNES_WIDTH, h: SNES_HEIGHT });

  const measure = useCallback((el: HTMLDivElement) => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w <= 0 || h <= 0) return;

    const nativeH = canvasNativeHeight(SNES_HEIGHT, 2, CANVAS_ID);
    const next = h / nativeH;

    setScale(next);
    setView({ w: w / next, h: nativeH });
  }, []);

  const containerRef = useResizeMeasure(measure);

  return { containerRef, scale, view };
};

export { useHudViewport };
