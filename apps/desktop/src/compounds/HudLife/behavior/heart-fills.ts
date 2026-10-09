/* @layer renderer-hud @kind logic */
import type { HeartMode } from '../../../primitives/HudHeart';
import { FULL_THRESHOLD, HEART_UNITS, QUARTER } from '../HudLife.constants';

const heartFills = (current: number, hearts: number, mode: HeartMode): number[] => {
  const rounded = (current + (QUARTER - 1)) & ~(QUARTER - 1);
  const source = mode === 'original' ? rounded : current;
  return Array.from({ length: hearts }, (_, i) => {
    const left = source - i * HEART_UNITS;
    if (mode === 'original') return left >= FULL_THRESHOLD ? 1 : left > 0 ? 0.5 : 0;
    return Math.min(Math.max(left / HEART_UNITS, 0), 1);
  });
};

export { heartFills };
