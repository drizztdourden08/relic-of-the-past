/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import { getSheetForChar } from './get-sheet-for-char';
import type { RGBA } from '../../graphics/palette';
import type { DropSheets } from './drop-sprite-assembly.type';

const extractLarge = (charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const placed: [number, number, number][] = [[charId, 0, 0], [charId + 1, 8, 0], [charId + 16, 0, 8], [charId + 17, 8, 8]];
  for (const [char, x, y] of placed) {
    const { sheet, offset, high } = getSheetForChar(char & 0xff, dropSheets);
    if (offset + 24 <= sheet.length) {
      const t = decode3bppTile(sheet, offset, palette, high);
      img.paste(t, x, y);
    }
  }
  return img;
};

export { extractLarge };
