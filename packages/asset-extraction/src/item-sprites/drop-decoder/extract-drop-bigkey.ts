/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { kDecodeTab } from '../receipt-tables';
import { extractReceipt16x16 } from '../receipt-decoder/extract-receipt-16x16';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { ReceiptSheets } from '../receipt-decoder/receipt-decoder.type';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropBigkey = (paletteIdx: number, spritePalettes: SpritePalettes, receiptSheets: ReceiptSheets): ImageBuffer => {
  const palette = paletteRow(spritePalettes, paletteIdx);
  const combined = Buffer.concat([receiptSheets.base, receiptSheets.sheet5B]);
  return extractReceipt16x16(combined, itemAt(kDecodeTab, 0x22, 'Big key graphic offset'), palette);
};

export { extractDropBigkey };
