/* @layer shared-asset-extraction @kind logic */
import { TRANSPARENT } from '../../graphics/palette';
import { ImageBuffer } from '../../graphics/png-writer';
import {
  FLIP_X_BIT, FLIP_Y_BIT, HUD_TILE_BYTES, HUD_TILES_PER_SHEET, PALETTE_SHIFT, TILE_NUMBER_MASK,
} from './hud-decoder.constants';
import type { RGBA } from '../../graphics/palette';

const decodeHudTile = (tileId: number, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const tileNum = tileId & TILE_NUMBER_MASK;
  const palIdx = (tileId >>> PALETTE_SHIFT) & 7;
  const flipX = !!(tileId & FLIP_X_BIT);
  const flipY = !!(tileId & FLIP_Y_BIT);

  const sheetIdx = Math.floor(tileNum / HUD_TILES_PER_SHEET);
  const localTile = tileNum % HUD_TILES_PER_SHEET;
  const raw = sheets[sheetIdx];
  const offset = localTile * HUD_TILE_BYTES;

  const img = new ImageBuffer(8, 8);

  for (let y = 0; y < 8; y++) {
    const d0 = raw[offset + y * 2];
    const d1 = raw[offset + y * 2 + 1];
    for (let x = 0; x < 8; x++) {
      const px = ((d0 >>> x) & 1) | (((d1 >>> x) & 1) << 1);
      if (px === 0) continue;
      const color = palette.get(palIdx * 4 + px) ?? TRANSPARENT;
      img.putPixel(7 - x, y, color);
    }
  }

  let result = img;
  if (flipX) result = result.flipX();
  if (flipY) result = result.flipY();
  return result;
};

export { decodeHudTile };
