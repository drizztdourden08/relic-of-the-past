/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { kTab1 } from '../receipt-tables';
import { decode3bppTile } from './decode-3bpp-tile';
import { LARGE_RECEIPT } from './receipt-decoder.constants';
import type { RGBA } from '../../graphics/palette';

const extractReceipt16x16 = (raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const tl = decode3bppTile(raw, offset, palette, true);
  const tr = decode3bppTile(raw, offset + 0x18, palette, true);
  const bl = decode3bppTile(raw, offset + 0x180, palette, true);
  const br = decode3bppTile(raw, offset + 0x198, palette, true);
  img.paste(tl, 0, 0);
  img.paste(tr, 8, 0);
  img.paste(bl, 0, 8);
  img.paste(br, 8, 8);
  return img;
};

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
