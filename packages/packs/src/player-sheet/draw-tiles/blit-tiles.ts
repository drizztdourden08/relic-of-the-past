/* @layer renderer-lib @kind logic */
import { decode4bppTile } from '@rotp/asset-extraction';
import { SHEET_COLS } from '@rotp/game-data';
import type { BlitArgs } from './draw-tiles.type';
import { TILE, TILE_BYTES } from './draw-tiles.constants';

const destIndexOf = (args: BlitArgs, srcX: number, srcY: number): number | null => {
  const { destWidth, destHeight, cols, rows, x, y, flipX = false, flipY = false } = args;
  const dx = x + (flipX ? cols * TILE - 1 - srcX : srcX);
  const dy = y + (flipY ? rows * TILE - 1 - srcY : srcY);
  if (dx < 0 || dy < 0 || dx >= destWidth || dy >= destHeight) return null;
  return dy * destWidth + dx;
};

const blitTile = (args: BlitArgs, tx: number, ty: number): void => {
  const { dest, pixels, row, offset } = args;
  const tileOffset = offset + (ty * SHEET_COLS + tx) * TILE_BYTES;
  if (tileOffset < 0 || tileOffset + TILE_BYTES > pixels.length) return;
  const decoded = decode4bppTile(pixels, tileOffset);
  for (let py = 0; py < TILE; py++) {
    for (let px = 0; px < TILE; px++) {
      const index = decoded[py * TILE + px];
      const at = index === undefined || index === 0 ? null : destIndexOf(args, tx * TILE + px, ty * TILE + py);
      if (index !== undefined && at !== null) dest[at] = row[index] ?? 0;
    }
  }
};

const blitTiles = (args: BlitArgs): void => {
  const { cols, rows } = args;
  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) blitTile(args, tx, ty);
  }
};

export { blitTiles };
