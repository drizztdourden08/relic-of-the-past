/* @layer shared-game @kind logic */
import type { DialogCell } from '../dialog-frame.types';
import type { BoxLayout, LayoutOptions } from './box-geometry.type';
import { INK_OPTICAL_OFFSET_Y, SCREEN_H, SCREEN_W, TEXT_AREA_COLS, TEXT_ROW_PX, TEXT_ROWS, TILE_PX } from './box-geometry.constants';
import { contentOf } from './content-of';
import { frameRectOf } from './frame-rect-of';

const clamp = (value: number, low: number, high: number): number => Math.min(Math.max(value, low), high);

const layoutBox = (topleft: number, rows: DialogCell[][], options: LayoutOptions): BoxLayout => {
  const { mode, fontScale, padX, padY } = options;
  const vanilla = frameRectOf(topleft);
  if (mode === 'native') {
    return { frame: vanilla, textOrigin: { x: vanilla.x + TILE_PX, y: vanilla.y + TILE_PX }, textWidth: TEXT_AREA_COLS * TILE_PX, visibleRows: TEXT_ROWS };
  }
  const content = contentOf(rows, options);
  const contentW = Math.max(TILE_PX, content.width) * fontScale;
  const contentH = content.rows * TEXT_ROW_PX * fontScale;
  const shrink = mode !== 'full';
  const w = shrink ? contentW + 2 * padX : Math.max(vanilla.w, contentW + 2 * padX);
  const h = shrink ? contentH + 2 * padY : Math.max(vanilla.h, contentH + 2 * padY);
  const x = clamp(vanilla.x + (vanilla.w - w) / 2, 0, Math.max(0, SCREEN_W - w));
  const y = clamp(vanilla.y + (vanilla.h - h) / 2, 0, Math.max(0, SCREEN_H - h));
  return {
    frame: { x, y, w, h },
    textOrigin: { x: x + Math.round((w - contentW) / 2), y: y + Math.round((h - contentH) / 2) + INK_OPTICAL_OFFSET_Y },
    textWidth: Math.max(TILE_PX, content.width),
    visibleRows: content.rows,
  };
};

export { layoutBox };
