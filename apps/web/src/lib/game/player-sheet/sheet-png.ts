/* @layer renderer-lib @kind logic */
/**
 * Render a whole sheet as one PNG covering the full 16x56 tile grid, 128x448 pixels.
 *
 * Two callers: the tile-sheet view, which is how a pose can be checked against the raw art,
 * and the courtesy preview inside a pack so the file shows something in an image viewer.
 * Uses the green outfit because a sheet has to be drawn through some palette and that is
 * the one the game starts in.
 */
import { SHEET_COLS, SHEET_BYTES } from '@shared/game/data/player-sheet/types';
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import { resolvePalette } from './resolve-palette';
import { blitTiles, TILE } from './draw-tiles';

const SHEET_ROWS = SHEET_BYTES / (SHEET_COLS * 32);
const WIDTH = SHEET_COLS * TILE;
const HEIGHT = SHEET_ROWS * TILE;
const DEFAULT_WEARING: Wearing = { outfit: 'green', gloves: 0 };

const drawSheet = (sheet: PlayerSheet, wearing: Wearing, ctx: CanvasRenderingContext2D): void => {
  const image = ctx.createImageData(WIDTH, HEIGHT);
  const dest = new Uint32Array(image.data.buffer);
  blitTiles({
    dest,
    destWidth: WIDTH,
    destHeight: HEIGHT,
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

/** PNG bytes for the whole sheet, or null when no canvas is available. */
const renderSheetPng = (sheet: PlayerSheet, wearing: Wearing = DEFAULT_WEARING): Uint8Array | null => {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawSheet(sheet, wearing, ctx);
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
};

export { renderSheetPng, drawSheet, SHEET_ROWS, WIDTH as SHEET_PNG_WIDTH, HEIGHT as SHEET_PNG_HEIGHT };
