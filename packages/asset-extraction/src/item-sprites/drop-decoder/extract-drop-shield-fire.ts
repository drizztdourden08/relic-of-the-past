/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropShieldFire = (sheetId: number, tileIds: number[], paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const sheet = dropSheets.sheets.get(sheetId);
  if (!sheet) throw new Error(`Drop sheet ${sheetId} is not loaded`);
  const palette = paletteRow(spritePalettes, paletteIdx);
  const img = new ImageBuffer(16, 16);
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (const [i, tileId] of tileIds.entries()) {
    const tile = decode3bppTile(sheet, tileId * 24, palette, false);
    const [x, y] = itemAt(pos, i, 'Shield tile position');
    img.paste(tile, x, y);
  }
  return img;
};

export { extractDropShieldFire };
