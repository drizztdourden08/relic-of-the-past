/* @layer renderer-hud @kind logic */
/**
 * Every pixel a sparkle may land on: the opaque pixels of the logo and of the sword at rest, read
 * from the pictures themselves at game scale and kept as frame coordinates, so a spot can be anywhere
 * on either.
 */
import { LOGO_AT, SWORD_REST_BASE, SWORD_TOP_FOR_BASE, SWORD_X } from '@shared/game/title/title-layout';
import type { Picture } from './draw-title-frame';

/** Frame coordinates packed as x + y * 256... kept as two parallel arrays for clarity. */
interface PixelSet {
  xs: Int16Array;
  ys: Int16Array;
}

const OPAQUE_FROM = 128;

const opaquePixels = ({ img, scale }: Picture, atX: number, atY: number): PixelSet => {
  const w = Math.round(img.width / scale);
  const h = Math.round(img.height / scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { xs: new Int16Array(0), ys: new Int16Array(0) };
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try {
    ({ data } = ctx.getImageData(0, 0, w, h));
  } catch {
    // A picture from another origin taints the canvas; without its pixels there is nothing to land on.
    return { xs: new Int16Array(0), ys: new Int16Array(0) };
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < OPAQUE_FROM) continue;
      xs.push(atX + x);
      ys.push(atY + y);
    }
  }
  return { xs: Int16Array.from(xs), ys: Int16Array.from(ys) };
};

interface ShinePixels {
  logo: PixelSet;
  sword: PixelSet;
}

const shinePixelsOf = (logo: Picture, sword: Picture): ShinePixels => ({
  logo: opaquePixels(logo, LOGO_AT.x, LOGO_AT.y),
  sword: opaquePixels(sword, SWORD_X, SWORD_TOP_FOR_BASE + SWORD_REST_BASE),
});

export { shinePixelsOf };
export type { PixelSet, ShinePixels };
