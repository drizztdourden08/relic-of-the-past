/* @layer renderer-lib @kind logic */
/**
 * What a texture animation does at time |t|: how far the field has slid, how visible the whole
 * field is, and how visible one cell is. Twinkle gives every cell its own period and phase from a
 * seeded hash (no Math.random) so the flicker is stable across frames and reads as random.
 */
import type { DialogTextureAnimation, DialogTextureSpeed } from '@shared/game/dialog/box-style';
import { textureSpeedFactor } from '@shared/game/dialog/box-style';

interface AnimationState {
  offsetX: number;
  offsetY: number;
  fieldAlpha: number;
  cellAlpha: (row: number, col: number) => number;
}

/** Game pixels per second the field slides at normal speed. */
const SLIDE_PX_PER_S = 10;

const pseudo = (seed: number, salt: number): number => {
  const v = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const twinkleAlpha = (t: number, row: number, col: number): number => {
  const seed = row * 97 + col;
  const period = 3 + pseudo(seed, 1) * 5;
  const phase = pseudo(seed, 2) * period;
  const wave = 0.5 - 0.5 * Math.cos(((t + phase) / period) * Math.PI * 2);
  // Most of the cycle is dark; the cell shows for a short window, like a light coming on.
  return Math.max(0, (wave - 0.55) / 0.45);
};

const animationState = (animation: DialogTextureAnimation, speed: DialogTextureSpeed, t: number): AnimationState => {
  const s = textureSpeedFactor(speed);
  const still: AnimationState = { offsetX: 0, offsetY: 0, fieldAlpha: 1, cellAlpha: () => 1 };
  switch (animation) {
    case 'scroll':
      return { ...still, offsetX: t * SLIDE_PX_PER_S * s };
    case 'drift':
      return { ...still, offsetX: t * SLIDE_PX_PER_S * s * 0.7, offsetY: t * SLIDE_PX_PER_S * s * 0.4 };
    case 'twinkle':
      return { ...still, cellAlpha: (row, col) => twinkleAlpha(t * s, row, col) };
    case 'pulse':
      return { ...still, fieldAlpha: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s * 1.4)) };
    default:
      return still;
  }
};

export { animationState };
export type { AnimationState };
