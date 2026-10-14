/* @layer renderer-hud @kind logic */
import { FULL_THRESHOLD } from '../HudLife.constants';

const originalFill = (left: number): number => {
  if (left >= FULL_THRESHOLD) return 1;
  return left > 0 ? 0.5 : 0;
};

export { originalFill };
