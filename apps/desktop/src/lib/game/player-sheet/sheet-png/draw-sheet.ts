/* @layer renderer-lib @kind logic */
import { SHEET_COLS } from '@shared/game/data/player-sheet/types';
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import { resolvePalette } from '../resolve-palette';
import { blitTiles } from '../draw-tiles';
import { SHEET_PNG_HEIGHT, SHEET_PNG_WIDTH, SHEET_ROWS } from './sheet-png.constants';

const drawSheet = (sheet: PlayerSheet, wearing: Wearing, ctx: CanvasRenderingContext2D): void => {
  const image = ctx.createImageData(SHEET_PNG_WIDTH, SHEET_PNG_HEIGHT);
  const dest = new Uint32Array(image.data.buffer);
  blitTiles({
    dest,
    destWidth: SHEET_PNG_WIDTH,
    destHeight: SHEET_PNG_HEIGHT,
    pixels: sheet.pixels,
    row: resolvePalette(sheet, wearing),
    offset: 0,
    cols: SHEET_COLS,
    rows: SHEET_ROWS,
    x: 0,
    y: 0,
  });
  ctx.putImageData(image, 0, 0);
};

export { drawSheet };
