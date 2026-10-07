/* @layer renderer-hud @kind logic */
/**
 * The box layout in CSS pixels: the game-pixel layout from box-geometry, placed by the overlay's
 * scale. A box that follows its rows keeps the layout it had once a scroll starts, so the frame
 * never changes size while the rows slide; the next still frame lays it out again.
 */
import { useMemo, useRef } from 'react';
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';
import { layoutBox, TILE_PX } from '@shared/game/dialog/box-geometry';
import type { BoxLayout, BoxPlacement } from '@shared/game/dialog/box-geometry';
import type { CssRect } from '../../../compounds/DialogBox';
import type { DialogScale } from './useDialogScale';

interface DialogGeometry {
  frame: CssRect;
  textOrigin: { x: number; y: number };
  /** Text-area width in game pixels, magnification included. */
  textWidthPx: number;
  visibleRows: number;
  /** CSS pixels per game pixel for the text, magnification included. */
  unit: number;
  /** CSS pixels per game pixel for the frame tiles. */
  tile: number;
}

interface GeometryOptions {
  mode: BoxPlacement;
  fontScale: number;
  /** Game pixels between the frame's sides and the text, and above and below it. */
  padX: number;
  padY: number;
  /** Game pixels the text layer is scrolled; a native layout moves with it, as the game's text does. */
  shiftX: number;
  shiftY: number;
}

const useDialogGeometry = (frame: DialogFrame, options: GeometryOptions, metrics: DialogScale): DialogGeometry => {
  const { mode, fontScale, padX, padY, shiftX, shiftY } = options;
  const { scale, offsetX, offsetY } = metrics;
  const held = useRef<{ key: string; layout: BoxLayout } | null>(null);

  const layout = useMemo(() => {
    const { topleft, rows, scrollStep, messageWidth, messageRows, generation } = frame;
    const key = `${generation}:${topleft}:${mode}:${fontScale}:${padX}:${padY}`;
    // Mid-scroll, the rows in use change under the box; the layout from before the scroll holds.
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
export type { DialogGeometry, GeometryOptions };
