/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { kTab1 } from '../receipt-tables';
import { decode3bppTile } from './decode-3bpp-tile';
import { extractReceipt16x16 } from './extract-receipt-16x16';
import { LARGE_RECEIPT } from './receipt-decoder.constants';
import type { RGBA } from '../../graphics/palette';

const extractReceipt8x16 = (raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const top = decode3bppTile(raw, offset, palette, true);
  const bot = decode3bppTile(raw, offset + 0x180, palette, true);
  img.paste(top, 4, 0);
  img.paste(bot, 4, 8);
  return img;
};

const receiptPicture = (raw: Buffer, offset: number, palette: RGBA[], receiptId: number): ImageBuffer =>
  (kTab1[receiptId] === LARGE_RECEIPT
    ? extractReceipt16x16(raw, offset, palette)
    : extractReceipt8x16(raw, offset, palette));

export { receiptPicture };
