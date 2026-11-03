/* @layer renderer-hud @kind hook */
import { useCallback, useState } from 'react';
import { SCREEN_H, SCREEN_W } from '@rotp/game-data';
import { wasmGetViewportInfo, linesAbovePicture } from '@rotp/game-core';
import { canvasNativeHeight } from '../../../hooks/canvas-native-height';
import { useResizeMeasure } from '../../../hooks/useResizeMeasure';
import { INITIAL_DIALOG_SCALE, SCANLINE_LEAD } from '../DialogView.constants';
import type { DialogScale } from '../DialogView.type';

const linesAbove = (nativeH: number): number =>
  linesAbovePicture(nativeH, wasmGetViewportInfo()?.extraTopBottom);

const useDialogScale = () => {
  const [metrics, setMetrics] = useState<DialogScale>(INITIAL_DIALOG_SCALE);

  const measure = useCallback((el: HTMLDivElement) => {
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;
    const nativeH = canvasNativeHeight(SCREEN_H);
    const scale = h / nativeH;
    setMetrics({
      height: h,
      scale,
      offsetX: (w - SCREEN_W * scale) / 2,
      offsetY: (linesAbove(nativeH) - SCANLINE_LEAD) * scale,
    });
  }, []);

  const containerRef = useResizeMeasure(measure);

  return { containerRef, ...metrics };
};

export { useDialogScale };
