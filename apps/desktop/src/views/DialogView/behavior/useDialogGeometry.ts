/* @layer renderer-hud @kind hook */
import { useMemo, useRef } from 'react';
import type { DialogFrame, BoxLayout } from '@rotp/game-data';
import { layoutBox, TILE_PX } from '@rotp/game-data';
import type { DialogGeometry, DialogScale, GeometryOptions } from '../DialogView.type';

const useDialogGeometry = (frame: DialogFrame, options: GeometryOptions, metrics: DialogScale): DialogGeometry => {
  const { mode, fontScale, padX, padY, shiftX, shiftY } = options;
  const { scale, offsetX, offsetY } = metrics;
  const held = useRef<{ key: string; layout: BoxLayout } | null>(null);

  const layout = useMemo(() => {
    const { topleft, rows, scrollStep, messageWidth, messageRows, generation } = frame;
    const key = `${generation}:${topleft}:${mode}:${fontScale}:${padX}:${padY}`;
    if (mode === 'fit' && scrollStep > 0 && held.current?.key === key) return held.current.layout;
    const next = layoutBox(topleft, rows, { mode, fontScale, padX, padY, messageWidth, messageRows });
    held.current = { key, layout: next };
    return next;
  }, [frame, mode, fontScale, padX, padY]);

  return useMemo(() => {
    const toCss = (v: number): number => v * scale;
    return {
      frame: {
        x: offsetX + toCss(layout.frame.x - shiftX),
        y: offsetY + toCss(layout.frame.y - shiftY),
        w: toCss(layout.frame.w),
        h: toCss(layout.frame.h),
      },
      textOrigin: { x: toCss(layout.textOrigin.x - layout.frame.x), y: toCss(layout.textOrigin.y - layout.frame.y) },
      textWidthPx: layout.textWidth,
      visibleRows: layout.visibleRows,
      unit: scale * fontScale,
      tile: TILE_PX * scale,
    };
  }, [layout, fontScale, shiftX, shiftY, scale, offsetX, offsetY]);
};

export { useDialogGeometry };
