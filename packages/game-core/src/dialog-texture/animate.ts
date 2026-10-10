/* @layer renderer-lib @kind logic */
import type { DialogTextureAnimation, DialogTextureSpeed } from '@rotp/game-data';
import { textureSpeedFactor } from '@rotp/game-data';
import type { AnimationState } from './animate.type';
import { SLIDE_GAME_PX_PER_SECOND, TWINKLE_DARK_SHARE, TWINKLE_LIT_SHARE } from './animate.constants';
import { seededNoise } from './seeded-noise';

const twinkleAlpha = (t: number, row: number, col: number): number => {
  const seed = row * 97 + col;
  const period = 3 + seededNoise(seed, 1) * 5;
  const phase = seededNoise(seed, 2) * period;
  const wave = 0.5 - 0.5 * Math.cos(((t + phase) / period) * Math.PI * 2);
  return Math.max(0, (wave - TWINKLE_DARK_SHARE) / TWINKLE_LIT_SHARE);
};

const animationState = (animation: DialogTextureAnimation, speed: DialogTextureSpeed, t: number): AnimationState => {
  const s = textureSpeedFactor(speed);
  const still: AnimationState = { offsetX: 0, offsetY: 0, fieldAlpha: 1, cellAlpha: () => 1 };
  switch (animation) {
    case 'scroll':
      return { ...still, offsetX: t * SLIDE_GAME_PX_PER_SECOND * s };
    case 'drift':
      return { ...still, offsetX: t * SLIDE_GAME_PX_PER_SECOND * s * 0.7, offsetY: t * SLIDE_GAME_PX_PER_SECOND * s * 0.4 };
    case 'twinkle':
      return { ...still, cellAlpha: (row, col) => twinkleAlpha(t * s, row, col) };
    case 'pulse':
      return { ...still, fieldAlpha: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s * 1.4)) };
    case 'none':
    default:
      return still;
  }
};

export { animationState };
export type { AnimationState };
