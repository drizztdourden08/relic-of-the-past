/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from './decode-3bpp-tile';
import type { RGBA } from '../../graphics/palette';

const extractReceipt16x16 = (raw: Buffer, offset: number, palette: RGBA[]): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  img.paste(decode3bppTile(raw, offset, palette, true), 0, 0);
  img.paste(decode3bppTile(raw, offset + 0x18, palette, true), 8, 0);
  img.paste(decode3bppTile(raw, offset + 0x180, palette, true), 0, 8);
  img.paste(decode3bppTile(raw, offset + 0x198, palette, true), 8, 8);
  return img;
};

export { extractReceipt16x16 };
