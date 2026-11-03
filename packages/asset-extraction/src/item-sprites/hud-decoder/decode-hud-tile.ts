/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { decode2bppTile } from '../../graphics/bitplane-decoder';
import { TRANSPARENT } from '../../graphics/palette';
import { paintIndexedTile } from '../../graphics/paint-indexed-tile';
import type { ImageBuffer } from '../../graphics/png-writer';
import {
  FLIP_X_BIT, FLIP_Y_BIT, HUD_TILE_BYTES, HUD_TILES_PER_SHEET, PALETTE_SHIFT, TILE_NUMBER_MASK,
} from './hud-decoder.constants';
import type { RGBA } from '../../graphics/palette';

const decodeHudTile = (tileId: number, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const tileNum = tileId & TILE_NUMBER_MASK;
  const palIdx = (tileId >>> PALETTE_SHIFT) & 7;
  const flipX = Boolean(tileId & FLIP_X_BIT);
  const flipY = Boolean(tileId & FLIP_Y_BIT);

  const sheetIdx = Math.floor(tileNum / HUD_TILES_PER_SHEET);
  const localTile = tileNum % HUD_TILES_PER_SHEET;
  const raw = itemAt(sheets, sheetIdx, 'HUD sheet');
  const offset = localTile * HUD_TILE_BYTES;

  let result = paintIndexedTile(decode2bppTile(raw, offset), (px) => palette.get(palIdx * 4 + px) ?? TRANSPARENT);
  if (flipX) result = result.flipX();
  if (flipY) result = result.flipY();
  return result;
};

export { decodeHudTile };
