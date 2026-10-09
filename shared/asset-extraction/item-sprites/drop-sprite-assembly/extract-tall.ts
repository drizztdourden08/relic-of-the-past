/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import { getSheetForChar } from './get-sheet-for-char';
import type { RGBA } from '../../graphics/palette';
import type { DropSheets } from './drop-sprite-assembly.type';

const extractTall = (charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const { sheet: s1, offset: o1, high: h1 } = getSheetForChar(charId & 0xff, dropSheets);
  if (o1 + 24 <= s1.length) {
    const t = decode3bppTile(s1, o1, palette, h1);
    img.paste(t, 4, 0);
  }
  const bc = (charId + 0x10) & 0xff;
  const { sheet: s2, offset: o2, high: h2 } = getSheetForChar(bc, dropSheets);
  if (o2 + 24 <= s2.length) {
    const t = decode3bppTile(s2, o2, palette, h2);
    img.paste(t, 4, 8);
  }
  return img;
};

export { extractTall };
