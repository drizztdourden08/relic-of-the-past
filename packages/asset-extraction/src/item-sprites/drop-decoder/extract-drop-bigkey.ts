/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { kDecodeTab } from '../drop-tables';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { ReceiptSheets } from '../receipt-decoder/receipt-decoder.type';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropBigkey = (paletteIdx: number, spritePalettes: SpritePalettes, receiptSheets: ReceiptSheets): ImageBuffer => {
  const palette = paletteRow(spritePalettes, paletteIdx);
  const combined = Buffer.concat([receiptSheets.base, receiptSheets.sheet5B]);
  const offset = kDecodeTab[0x22];
  const img = new ImageBuffer(16, 16);
  const tl = decode3bppTile(combined, offset, palette, true);
  const tr = decode3bppTile(combined, offset + 0x18, palette, true);
  const bl = decode3bppTile(combined, offset + 0x180, palette, true);
  const br = decode3bppTile(combined, offset + 0x198, palette, true);
  img.paste(tl, 0, 0);
  img.paste(tr, 8, 0);
  img.paste(bl, 0, 8);
  img.paste(br, 8, 8);
  return img;
};

export { extractDropBigkey };
