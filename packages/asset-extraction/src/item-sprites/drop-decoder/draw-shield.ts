/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import { paletteRow } from '../receipt-palettes';
import type { DrawShieldOptions } from './drop-decoder.type';

const drawShield = ({ shield, paletteIdx, spritePalettes, dropSheets, positions }: DrawShieldOptions): ImageBuffer => {
  const { sheetId, tileIds } = shield;
  const sheet = dropSheets.sheets.get(sheetId);
  if (!sheet) throw new Error(`Drop sheet ${sheetId} is not loaded`);
  const palette = paletteRow(spritePalettes, paletteIdx);
  const img = new ImageBuffer(16, 16);
  positions.forEach(([x, y], i) => {
    img.paste(decode3bppTile(sheet, itemAt(tileIds, i, 'Shield tile') * 24, palette, false), x, y);
  });
  return img;
};

export { drawShield };
