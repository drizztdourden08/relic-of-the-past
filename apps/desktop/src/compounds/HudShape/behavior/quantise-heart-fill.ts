/* @layer renderer-hud @kind logic */
import { FULL_THRESHOLD, HEART_UNITS, QUARTER } from '../HudShape.constants';

const quantiseHeartFill = (fill: number): number => {
  const units = Math.min(HEART_UNITS, Math.max(0, fill * HEART_UNITS));
  const rounded = Math.ceil(units / QUARTER) * QUARTER;
  if (rounded >= FULL_THRESHOLD) return 1;
  return rounded > 0 ? 0.5 : 0;
};

export { quantiseHeartFill };
