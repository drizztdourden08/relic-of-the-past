/* @layer renderer-lib @kind logic */
import { animationState } from './animate';
import { patternOf } from './patterns';
import { seededNoise } from './seeded-noise';
import type { TextureFrame } from './paint-texture.type';
import { SPARSEST_PITCH_FACTOR } from './paint-texture.constants';

const paintTexture = (canvas: HTMLCanvasElement, frame: TextureFrame): void => {
  const { texture, color, opacity, animation, speed, scale, density, scatter, t, widthPx, heightPx, devicePx } = frame;
  const pattern = patternOf(texture);
  const width = Math.max(1, Math.round(widthPx * devicePx));
  const height = Math.max(1, Math.round(heightPx * devicePx));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!pattern || opacity <= 0) return;

  const { offsetX, offsetY, fieldAlpha, cellAlpha } = animationState(animation, speed, t);
  ctx.scale(devicePx, devicePx);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = 'round';

  const spacing = 1 + (1 - Math.min(100, Math.max(0, density)) / 100) * (SPARSEST_PITCH_FACTOR - 1);
  const loose = Math.min(100, Math.max(0, scatter)) / 100;
  const { brick, rows, draw } = pattern;
  const pitchX = pattern.pitchX * scale * spacing;
  const pitchY = pattern.pitchY * scale * spacing;
  const rowStart = Math.floor(-offsetY / pitchY) - 2;
  const rowEnd = Math.ceil((heightPx - offsetY) / pitchY) + 2;
  const colStart = rows ? 0 : Math.floor(-offsetX / pitchX) - 2;
  const colEnd = rows ? 1 : Math.ceil((widthPx - offsetX) / pitchX) + 2;

  for (let r = rowStart; r < rowEnd; r++) {
    const shift = brick && (r & 1) !== 0 ? pitchX / 2 : 0;
    for (let c = colStart; c < colEnd; c++) {
      const alpha = opacity * fieldAlpha * cellAlpha(r, c);
      if (alpha <= 0.005) continue;
      const seed = r * 7919 + c * 104729;
      const jx = rows ? 0 : (seededNoise(seed, 1) - 0.5) * loose * pitchX * 1.2;
      const jy = (seededNoise(seed, 2) - 0.5) * loose * pitchY * 1.2;
      const size = scale * (1 + (seededNoise(seed, 3) - 0.5) * 0.6 * loose);
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.translate(rows ? widthPx / 2 : c * pitchX + shift + offsetX + jx, r * pitchY + offsetY + jy);
      ctx.scale(size, size);
      ctx.lineWidth = 1 / size;
      draw(ctx, widthPx);
      ctx.restore();
    }
  }
};

export { paintTexture };
export type { TextureFrame };
