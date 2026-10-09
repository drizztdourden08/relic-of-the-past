/* @layer renderer-hud @kind logic */
import type { SceneGeometry, SceneLayer } from '../scene.type';
import { REFLECTION_COMPRESSION, REFLECTION_TINT, ROW_JITTER, WAVE_A, WAVE_B, WAVE_MAX_PX } from './layers.constants';

const offscreen = (w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
};

const rowShift = (t: number, r: number, jitter: number, depth: number): number => {
  const a = Math.sin(t * WAVE_A.rate + r * WAVE_A.rowPhase + jitter) * WAVE_A.amplitude;
  const b = Math.sin(t * WAVE_B.rate + r * WAVE_B.rowPhase) * WAVE_B.amplitude;
  const wave = (a + b) * (0.4 + 0.6 * depth);
  return Math.max(-WAVE_MAX_PX, Math.min(WAVE_MAX_PX, Math.round(wave)));
};

const fixedRowJitter = (r: number): number => (Math.sin(r * 12.9898) * 43758.5453 % 1) * ROW_JITTER;

const reflectionLayer = (geometry: SceneGeometry): SceneLayer => {
  const { width, height, horizonY } = geometry;
  const waterTop = horizonY + 2;
  const waterH = height - waterTop;
  const above = offscreen(width, horizonY);
  const half = offscreen(width >> 1, waterH);

  return {
    draw: (ctx, { t, moving }) => {
      if (waterH <= 0) return;
      above.ctx.drawImage(ctx.canvas, 0, 0, width, horizonY, 0, 0, width, horizonY);
      for (let r = 0; r < waterH; r++) {
        const srcY = Math.max(0, horizonY - 1 - Math.floor(r * REFLECTION_COMPRESSION));
        const shift = moving ? rowShift(t, r, fixedRowJitter(r), r / waterH) : 0;
        ctx.drawImage(above.canvas, 0, srcY, width, 1, shift, waterTop + r, width, 1);
      }
      half.ctx.drawImage(ctx.canvas, 0, waterTop, width, waterH, 0, 0, width >> 1, waterH);
      ctx.drawImage(half.canvas, 0, 0, width >> 1, waterH, 0, waterTop, width, waterH);
      ctx.fillStyle = REFLECTION_TINT;
      ctx.fillRect(0, waterTop, width, waterH);
    },
  };
};

export { reflectionLayer };
