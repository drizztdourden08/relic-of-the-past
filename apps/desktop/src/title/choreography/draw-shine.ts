/* @layer renderer-hud @kind logic */
import { seededRandom } from '../scene/seeded-random';
import type { PixelSet, Shine, ShinePixels, Sparkle } from './choreography.type';
import { drawStar } from './draw-star';
import { itemAt } from '@app/checked-access';
import { PAUSE_SECONDS, SHINE_SEED_SALT, SPARKLE_DIAGONALS_FROM_RADIUS, SPARKLE_RADIUS_PER_STEP, STEP_SECONDS } from './draw-shine.constants';

const createShine = (seed: number, pixels: ShinePixels): Shine => {
  const rng = seededRandom(seed ^ SHINE_SEED_SALT);
  let current: Sparkle | null = null;
  let nextAt = rng.range(0.2, 0.8);

  const pickSparkleSpot = (swordPlanted: boolean): { x: number; y: number } | null => {
    const sets: PixelSet[] = swordPlanted ? [pixels.logo, pixels.sword] : [pixels.logo];
    const total = sets.reduce((n, s) => n + s.xs.length, 0);
    if (total === 0) return null;
    let i = rng.int(0, total - 1);
    for (const s of sets) {
      if (i < s.xs.length) return { x: itemAt(s.xs, i), y: itemAt(s.ys, i) };
      i -= s.xs.length;
    }
    return null;
  };

  return {
    draw: ({ ctx, t, alpha, at, swordPlanted }) => {
      if (alpha <= 0) return;
      if (current && t >= current.end) {
        nextAt = current.end + rng.range(PAUSE_SECONDS.min, PAUSE_SECONDS.max);
        current = null;
      }
      if (!current && t >= nextAt) {
        const spot = pickSparkleSpot(swordPlanted);
        if (!spot) return;
        const step = rng.range(STEP_SECONDS.min, STEP_SECONDS.max);
        current = { ...spot, start: t, step, end: t + step * SPARKLE_RADIUS_PER_STEP.length };
      }
      if (!current) return;
      const index = Math.min(SPARKLE_RADIUS_PER_STEP.length - 1, Math.floor((t - current.start) / current.step));
      const radius = itemAt(SPARKLE_RADIUS_PER_STEP, index);
      ctx.globalAlpha = alpha;
      drawStar(ctx, { x: at.x + current.x, y: at.y + current.y }, radius, radius >= SPARKLE_DIAGONALS_FROM_RADIUS);
      ctx.globalAlpha = 1;
    },
  };
};

export { createShine };
