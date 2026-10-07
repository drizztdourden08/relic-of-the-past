/* @layer renderer-hud @kind logic */
/**
 * The shine that keeps playing on the finished title: a sparkle that grows and shrinks over six
 * steps, then a pause, then the next one somewhere else. Each sparkle lands on a pixel drawn at
 * random from the logo's opaque pixels, or the sword's once it is planted, with a random pause and a
 * random step length from a seeded generator.
 */
import { seededRandom } from '../scene/seeded-random';
import { drawStar } from './draw-sword';
import type { PixelSet, ShinePixels } from './shine-pixels';

/** Star radius per step of one sparkle. */
const RADII: readonly number[] = [1, 2, 4, 6, 4, 2];
const STEP_SECONDS = { min: 0.05, max: 0.09 } as const;
const PAUSE_SECONDS = { min: 0.12, max: 0.9 } as const;

interface Sparkle {
  x: number;
  y: number;
  start: number;
  step: number;
  end: number;
}

interface Shine {
  draw: (ctx: CanvasRenderingContext2D, t: number, alpha: number, frameX: number, frameY: number, swordPlanted: boolean) => void;
}

const createShine = (seed: number, pixels: ShinePixels): Shine => {
  const rng = seededRandom(seed ^ 0x51a5);
  let current: Sparkle | null = null;
  let nextAt = rng.range(0.2, 0.8);

  /** A pixel drawn uniformly over the logo and, when it stands, the sword. */
  const pick = (swordPlanted: boolean): { x: number; y: number } | null => {
    const sets: PixelSet[] = swordPlanted ? [pixels.logo, pixels.sword] : [pixels.logo];
    const total = sets.reduce((n, s) => n + s.xs.length, 0);
    if (total === 0) return null;
    let i = rng.int(0, total - 1);
    for (const s of sets) {
      if (i < s.xs.length) return { x: s.xs[i], y: s.ys[i] };
      i -= s.xs.length;
    }
    return null;
  };

  return {
    draw: (ctx, t, alpha, frameX, frameY, swordPlanted) => {
      if (alpha <= 0) return;
      if (current && t >= current.end) {
        nextAt = current.end + rng.range(PAUSE_SECONDS.min, PAUSE_SECONDS.max);
        current = null;
      }
      if (!current && t >= nextAt) {
        const spot = pick(swordPlanted);
        if (!spot) return;
        const step = rng.range(STEP_SECONDS.min, STEP_SECONDS.max);
        current = { ...spot, start: t, step, end: t + step * RADII.length };
      }
      if (!current) return;
      const at = Math.min(RADII.length - 1, Math.floor((t - current.start) / current.step));
      ctx.globalAlpha = alpha;
      drawStar(ctx, frameX + current.x, frameY + current.y, RADII[at], RADII[at] >= 6);
      ctx.globalAlpha = 1;
    },
  };
};

export { createShine };
export type { Shine };
