/* @layer renderer-hud @kind logic */
import type { HeartMode } from '../../../primitives/HudHeart';
import { HEART_UNITS, QUARTER } from '../HudLife.constants';
import { originalFill } from './original-fill';

const heartFills = (current: number, hearts: number, mode: HeartMode): number[] => {
  const rounded = (current + (QUARTER - 1)) & ~(QUARTER - 1);
  const source = mode === 'original' ? rounded : current;
  return Array.from({ length: hearts }, (_, i) => {
    const left = source - i * HEART_UNITS;
    if (mode === 'original') return originalFill(left);
    return Math.min(Math.max(left / HEART_UNITS, 0), 1);
  });
};

export { heartFills };
