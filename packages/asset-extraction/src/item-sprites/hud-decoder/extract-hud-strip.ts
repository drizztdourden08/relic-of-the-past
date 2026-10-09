/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decodeHudTile } from './decode-hud-tile';
import type { RGBA } from '../../graphics/palette';

const cropStrip = (img: ImageBuffer, fullW: number, cropWidth: number): ImageBuffer => {
  const cropped = new ImageBuffer(cropWidth, 8);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < cropWidth; x++) {
      const srcOff = (y * fullW + x) * 4;
      const dstOff = (y * cropWidth + x) * 4;
      cropped.data[dstOff] = img.data[srcOff];
      cropped.data[dstOff + 1] = img.data[srcOff + 1];
      cropped.data[dstOff + 2] = img.data[srcOff + 2];
      cropped.data[dstOff + 3] = img.data[srcOff + 3];
    }
  }
  return cropped;
};

const extractHudStrip = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>, cropWidth?: number): ImageBuffer => {
  const fullW = tileIds.length * 8;
  const img = new ImageBuffer(fullW, 8);
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decodeHudTile(tileIds[i], sheets, palette);
    img.paste(tile, i * 8, 0);
  }
  if (cropWidth && cropWidth < fullW) return cropStrip(img, fullW, cropWidth);
  return img;
};

export { extractHudStrip };
