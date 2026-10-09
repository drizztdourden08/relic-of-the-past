/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';

const extractDropRupee = (paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const palette = spritePalettes.palettes[paletteIdx];
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(dropSheets.sheet96, 0, palette, true);
  const bot = decode3bppTile(dropSheets.sheet96, 0x180, palette, true);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

export { extractDropRupee };
