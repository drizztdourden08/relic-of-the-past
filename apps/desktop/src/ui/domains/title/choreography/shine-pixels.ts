/* @layer renderer-hud @kind logic */
import { LOGO_AT, SWORD_REST_BASE, SWORD_TOP_FOR_BASE, SWORD_X } from '@rotp/game-data';
import type { Picture, PixelSet, ShinePixels } from './choreography.type';
import { OPAQUE_ALPHA_FROM } from './shine-pixels.constants';

const noPixels = (): PixelSet => ({ xs: new Int16Array(0), ys: new Int16Array(0) });

const readPixelsOrNull = (ctx: CanvasRenderingContext2D, w: number, h: number): Uint8ClampedArray | null => {
  try {
    return ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
};

const opaquePixels = ({ img, scale }: Picture, atX: number, atY: number): PixelSet => {
  const w = Math.round(img.width / scale);
  const h = Math.round(img.height / scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return noPixels();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);
  const data = readPixelsOrNull(ctx, w, h);
  if (!data) return noPixels();
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < OPAQUE_ALPHA_FROM) continue;
      xs.push(atX + x);
      ys.push(atY + y);
    }
  }
  return { xs: Int16Array.from(xs), ys: Int16Array.from(ys) };
};

const shinePixelsOf = (logo: Picture, sword: Picture): ShinePixels => ({
  logo: opaquePixels(logo, LOGO_AT.x, LOGO_AT.y),
  sword: opaquePixels(sword, SWORD_X, SWORD_TOP_FOR_BASE + SWORD_REST_BASE),
});

export { shinePixelsOf };
