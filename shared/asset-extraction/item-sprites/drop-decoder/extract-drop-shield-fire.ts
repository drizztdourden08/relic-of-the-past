/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';

const extractDropShieldFire = (sheetId: number, tileIds: number[], paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const sheet = dropSheets.sheets.get(sheetId)!;
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decode3bppTile(sheet, tileIds[i] * 24, palette, false);
    img.paste(tile, pos[i][0], pos[i][1]);
  }
  return img;
};

export { extractDropShieldFire };
