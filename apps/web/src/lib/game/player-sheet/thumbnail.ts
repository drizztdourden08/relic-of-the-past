/* @layer renderer-lib @kind logic */
/**
 * One small still of a sheet, for the library list.
 *
 * The front-facing standing block is the sheet's first 2x3 tiles, which makes it the one
 * pose addressable without consulting the pose atlas, so the list stays cheap to render
 * and does not depend on the atlas being loaded.
 */
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import { resolvePalette } from './resolve-palette';
import { blitTiles, TILE } from './draw-tiles';

const STANDING_COLS = 2;
const STANDING_ROWS = 3;
const DEFAULT_WEARING: Wearing = { outfit: 'green', gloves: 0 };

/** Renders the standing pose to a PNG data URL, or null when no canvas is available. */
const renderThumbnail = (sheet: PlayerSheet, wearing: Wearing = DEFAULT_WEARING): string | null => {
  const width = STANDING_COLS * TILE;
  const height = STANDING_ROWS * TILE;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const image = ctx.createImageData(width, height);
  const dest = new Uint32Array(image.data.buffer);
  blitTiles({
    dest,
    destWidth: width,
    destHeight: height,
    pixels: sheet.pixels,
    row: resolvePalette(sheet, wearing),
    offset: 0,
    cols: STANDING_COLS,
    rows: STANDING_ROWS,
    x: 0,
    y: 0,
  });
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
};

export { renderThumbnail };
