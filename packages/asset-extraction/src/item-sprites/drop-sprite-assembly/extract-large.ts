/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import { getSheetForChar } from './get-sheet-for-char';
import type { RGBA } from '../../graphics/palette';
import type { DropSheets } from './drop-sprite-assembly.type';

const extractLarge = (charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const chars = [charId, charId + 1, charId + 16, charId + 17];
  const pos: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < 4; i++) {
    const { sheet, offset, high } = getSheetForChar(chars[i] & 0xff, dropSheets);
    if (offset + 24 <= sheet.length) {
      const t = decode3bppTile(sheet, offset, palette, high);
      img.paste(t, pos[i][0], pos[i][1]);
    }
  }
  return img;
};

export { extractLarge };
