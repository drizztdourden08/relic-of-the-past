/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropShieldFighters = (sheetId: number, tileIds: number[], paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const sheet = dropSheets.sheets.get(sheetId)!;
  const palette = paletteRow(spritePalettes, paletteIdx);
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(sheet, tileIds[0] * 24, palette, false);
  const bot = decode3bppTile(sheet, tileIds[1] * 24, palette, false);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

export { extractDropShieldFighters };
