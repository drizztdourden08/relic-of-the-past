/* @layer renderer-hud @kind logic */
/**
 * The lake: what stands above the water line, mirrored below it. Each water row copies one row from
 * above, a little compressed toward the viewer and shifted sideways by a slow wave in whole pixels,
 * so the result stays pixel art. Then a two-pixel block blur (down to half width and back with
 * smoothing off) and a blue tint. The water's texture and the water line are their own layers over
 * this.
 */
import type { SceneGeometry, SceneLayer } from '../scene.type';

const COMPRESSION = 1.08;
/**
 * The sideways shift of a water row is two slow waves of unrelated periods, summed and snapped to
 * one pixel at most, with a small fixed phase of each row's own so the rows do not step together.
 * One wave alone snapped to whole pixels dwells at its peaks and jumps through the middle, and every
 * row jumping at once reads as a single lurch.
 */
const WAVE_A = { rate: 0.55, rowPhase: 0.16, amplitude: 0.85 } as const;
const WAVE_B = { rate: 0.83, rowPhase: -0.07, amplitude: 0.45 } as const;
const ROW_JITTER = 0.45;
const WAVE_MAX_PX = 1;
const TINT = 'rgba(120, 150, 230, 0.35)';

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

/** A fixed small phase per row, from the row number alone, so it is the same on every frame. */
const jitterOf = (r: number): number => (Math.sin(r * 12.9898) * 43758.5453 % 1) * ROW_JITTER;

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
        const srcY = Math.max(0, horizonY - 1 - Math.floor(r * COMPRESSION));
        const shift = moving ? rowShift(t, r, jitterOf(r), r / waterH) : 0;
        ctx.drawImage(above.canvas, 0, srcY, width, 1, shift, waterTop + r, width, 1);
      }
      half.ctx.drawImage(ctx.canvas, 0, waterTop, width, waterH, 0, 0, width >> 1, waterH);
      ctx.drawImage(half.canvas, 0, 0, width >> 1, waterH, 0, waterTop, width, waterH);
      ctx.fillStyle = TINT;
      ctx.fillRect(0, waterTop, width, waterH);
    },
  };
};

export { reflectionLayer };
