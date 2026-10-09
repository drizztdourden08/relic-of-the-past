/* @layer renderer-lib @kind logic */
import { decode4bppTile } from '@rotp/asset-extraction';
import { SHEET_COLS } from '@rotp/game-data';
import type { BlitArgs } from './draw-tiles.type';
import { TILE, TILE_BYTES } from './draw-tiles.constants';

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

export { blitTiles };
