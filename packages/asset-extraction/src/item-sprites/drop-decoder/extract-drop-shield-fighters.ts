/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { DropSheets } from '../drop-sprite-assembly';
import type { ShieldTiles } from './drop-decoder.type';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropShieldFighters = (shield: ShieldTiles, paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const { sheetId, tileIds } = shield;
  const sheet = dropSheets.sheets.get(sheetId);
  if (!sheet) throw new Error(`Drop sheet ${sheetId} is not loaded`);
  const palette = paletteRow(spritePalettes, paletteIdx);
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(sheet, itemAt(tileIds, 0, 'Shield top tile') * 24, palette, false);
  const bot = decode3bppTile(sheet, itemAt(tileIds, 1, 'Shield bottom tile') * 24, palette, false);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

export { extractDropShieldFighters };
