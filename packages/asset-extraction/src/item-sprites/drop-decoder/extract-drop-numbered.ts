/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import { extractLarge, getSheetForChar } from '../drop-sprite-assembly';
import { kNumChar, kNumExt, kNumX, kNumY } from '../drop-tables';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropNumbered = (_spriteType: number, paletteIdx: number, group: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const a = (group - 1) * 3;
  const palette = paletteRow(spritePalettes, paletteIdx);
  const img = new ImageBuffer(16, 16);

  for (let j = 0; j < 3; j++) {
    const ii = a + j;
    const cid = itemAt(kNumChar, ii, 'Numbered drop character');
    const ext = kNumExt[ii];
    const x = itemAt(kNumX, ii, 'Numbered drop x');
    const y = itemAt(kNumY, ii, 'Numbered drop y');
    if (ext === 2) {
      const tileImg = extractLarge(cid, palette, dropSheets);
      img.paste(tileImg, x, y);
    } else {
      const { sheet, offset, high } = getSheetForChar(cid, dropSheets);
      if (offset + 24 <= sheet.length) {
        const t = decode3bppTile(sheet, offset, palette, high);
        img.paste(t, x, y);
      }
    }
  }
  return img;
};

export { extractDropNumbered };
