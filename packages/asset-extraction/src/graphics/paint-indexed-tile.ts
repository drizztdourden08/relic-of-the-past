/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from './png-writer';
import type { RGBA } from './palette';

const paintIndexedTile = (pixels: Uint8Array, colourAt: (index: number) => RGBA): ImageBuffer => {
  const img = new ImageBuffer(8, 8);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const px = pixels[y * 8 + x] ?? 0;
      if (px === 0) continue;
      img.putPixel(x, y, colourAt(px));
    }
  }
  return img;
};

export { paintIndexedTile };
