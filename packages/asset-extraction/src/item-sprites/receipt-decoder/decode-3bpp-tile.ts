/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const decode3bppTile = (raw: Buffer, offset: number, palette: RGBA[], high: boolean): ImageBuffer => {
  const img = new ImageBuffer(8, 8);
  for (let y = 0; y < 8; y++) {
    const d0 = raw[offset + y * 2];
    const d1 = raw[offset + y * 2 + 1];
    const d2 = raw[offset + 16 + y];
    for (let x = 0; x < 8; x++) {
      const bit = 7 - x;
      const px = ((d0 >>> bit) & 1) | (((d1 >>> bit) & 1) << 1) | (((d2 >>> bit) & 1) << 2);
      if (px === 0) continue;
      const ci = high ? px + 8 : px;
      img.putPixel(x, y, palette[ci]);
    }
  }
  return img;
};

export { decode3bppTile };
