/* @layer renderer-hud @kind hook */
import { useCallback, useState } from 'react';
import { aspectRatioValue } from '@rotp/game-core';
import { canvasNativeHeight } from '../../../hooks/canvas-native-height';
import { SNES_HEIGHT } from '../../../hooks/hooks.constants';
import { useResizeMeasure } from '../../../hooks/useResizeMeasure';
import type { HudScale, HudScaleParams } from '../HudView.type';

const useHudScale = ({ ratio, customW, customH }: HudScaleParams): HudScale => {
  const [scale, setScale] = useState(2);
  const [hudWidth, setHudWidth] = useState<number | undefined>(undefined);

  const computeScale = useCallback((el: HTMLDivElement) => {
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;

    setScale(h / canvasNativeHeight(SNES_HEIGHT));

    const numericRatio = aspectRatioValue(ratio, customW, customH);
    if (numericRatio <= 0) {
      setHudWidth(undefined);
    } else {
      const screenRatio = w / h;
      const effectiveRatio = Math.min(numericRatio, screenRatio);
      setHudWidth(Math.floor(h * effectiveRatio));
    }
  }, [ratio, customW, customH]);

  const containerRef = useResizeMeasure(computeScale);

  return { containerRef, scale, hudWidth };
};

export { useHudScale };
