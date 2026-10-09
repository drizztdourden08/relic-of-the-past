/* @layer renderer-lib @kind logic */
import type { PlayerSheet, Wearing } from '@rotp/game-data';
import { resolvePalette } from './resolve-palette';
import { blitTiles, TILE } from './draw-tiles';
import { DEFAULT_WEARING, STANDING_COLS, STANDING_ROWS } from './thumbnail.constants';

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
