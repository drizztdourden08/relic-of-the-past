/* @layer renderer-lib @kind logic */
/**
 * Blit tiles from a player sheet into an RGBA buffer.
 *
 * Everything the studio draws reduces to this: a rectangular run of tiles taken from the
 * 16-column sheet, looked up through a resolved 16-colour row, optionally flipped on either
 * axis — the engine stores one copy of the art and sets flip bits in OAM, so a preview has
 * to be able to do the same. Palette index 0 is left untouched rather than written as
 * transparent black, so overlapping quads compose the way sprites do.
 */
import { decode4bppTile } from '@shared/asset-extraction/graphics';
import { SHEET_COLS } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from './resolve-palette';

const TILE = 8;
const TILE_BYTES = 32;

interface BlitArgs {
  /** Destination, as a Uint32Array view over an ImageData buffer. */
  dest: Uint32Array;
  destWidth: number;
  destHeight: number;
  pixels: Uint8Array;
  row: ResolvedRow;
  /** Byte offset of the top-left tile inside the sheet. */
  offset: number;
  cols: number;
  rows: number;
  x: number;
  y: number;
  flipX?: boolean;
  flipY?: boolean;
}

const blitTiles = (args: BlitArgs): void => {
  const { dest, destWidth, destHeight, pixels, row, offset, cols, rows, x, y, flipX = false, flipY = false } = args;
  const width = cols * TILE;
  const height = rows * TILE;
  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const tileOffset = offset + (ty * SHEET_COLS + tx) * TILE_BYTES;
      if (tileOffset < 0 || tileOffset + TILE_BYTES > pixels.length) continue;
      const decoded = decode4bppTile(pixels, tileOffset);
      for (let py = 0; py < TILE; py++) {
        for (let px = 0; px < TILE; px++) {
          const index = decoded[py * TILE + px];
          if (index === 0) continue;
          const srcX = tx * TILE + px;
          const srcY = ty * TILE + py;
          const dx = x + (flipX ? width - 1 - srcX : srcX);
          const dy = y + (flipY ? height - 1 - srcY : srcY);
          if (dx < 0 || dy < 0 || dx >= destWidth || dy >= destHeight) continue;
          dest[dy * destWidth + dx] = row[index];
        }
      }
    }
  }
};

export { blitTiles, TILE };
export type { BlitArgs };
