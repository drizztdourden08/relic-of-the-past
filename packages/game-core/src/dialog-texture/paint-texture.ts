/* @layer renderer-lib @kind logic */
import { animationState } from './animate';
import { patternOf } from './patterns';
import { seededNoise } from './seeded-noise';
import type { GridSpan, TextureFrame, TextureGrid } from './paint-texture.type';
import { SPARSEST_PITCH_FACTOR } from './paint-texture.constants';

const prepareCanvas = (canvas: HTMLCanvasElement, frame: TextureFrame): CanvasRenderingContext2D | null => {
  const { widthPx, heightPx, devicePx } = frame;
  const width = Math.max(1, Math.round(widthPx * devicePx));
  const height = Math.max(1, Math.round(heightPx * devicePx));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return ctx;
};

const spanOf = (grid: TextureGrid): GridSpan => {
  const { pattern, pitchX, pitchY, widthPx, heightPx, offsetX, offsetY } = grid;
  return {
    rowStart: Math.floor(-offsetY / pitchY) - 2,
    rowEnd: Math.ceil((heightPx - offsetY) / pitchY) + 2,
    colStart: pattern.rows ? 0 : Math.floor(-offsetX / pitchX) - 2,
    colEnd: pattern.rows ? 1 : Math.ceil((widthPx - offsetX) / pitchX) + 2,
  };
};

const drawCell = (ctx: CanvasRenderingContext2D, grid: TextureGrid, r: number, c: number): void => {
  const { pattern, pitchX, pitchY, loose, scale, widthPx, offsetX, offsetY, alphaAt } = grid;
  const alpha = alphaAt(r, c);
  if (alpha <= 0.005) return;
  const shift = pattern.brick && (r & 1) !== 0 ? pitchX / 2 : 0;
  const seed = r * 7919 + c * 104729;
  const jx = pattern.rows ? 0 : (seededNoise(seed, 1) - 0.5) * loose * pitchX * 1.2;
  const jy = (seededNoise(seed, 2) - 0.5) * loose * pitchY * 1.2;
  const size = scale * (1 + (seededNoise(seed, 3) - 0.5) * 0.6 * loose);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(pattern.rows ? widthPx / 2 : c * pitchX + shift + offsetX + jx, r * pitchY + offsetY + jy);
  ctx.scale(size, size);
  ctx.lineWidth = 1 / size;
  pattern.draw(ctx, widthPx);
  ctx.restore();
};

const paintTexture = (canvas: HTMLCanvasElement, frame: TextureFrame): void => {
  const { texture, color, opacity, animation, speed, scale, density, scatter, t, widthPx, heightPx, devicePx } = frame;
  const pattern = patternOf(texture);
  const ctx = prepareCanvas(canvas, frame);
  if (!ctx || !pattern || opacity <= 0) return;

  const { offsetX, offsetY, fieldAlpha, cellAlpha } = animationState(animation, speed, t);
  ctx.scale(devicePx, devicePx);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = 'round';

  const spacing = 1 + (1 - Math.min(100, Math.max(0, density)) / 100) * (SPARSEST_PITCH_FACTOR - 1);
  const grid: TextureGrid = {
    pattern,
    pitchX: pattern.pitchX * scale * spacing,
    pitchY: pattern.pitchY * scale * spacing,
    loose: Math.min(100, Math.max(0, scatter)) / 100,
    scale, widthPx, heightPx, offsetX, offsetY,
    alphaAt: (r, c) => opacity * fieldAlpha * cellAlpha(r, c),
  };
  const { rowStart, rowEnd, colStart, colEnd } = spanOf(grid);
  for (let r = rowStart; r < rowEnd; r++) {
    for (let c = colStart; c < colEnd; c++) drawCell(ctx, grid, r, c);
  }
};

export { paintTexture };
