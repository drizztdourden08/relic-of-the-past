/* @layer shared-game @kind logic */
import { CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP } from './capacity-bonus.data';

const clampBonusPercent = (percent: number): number => {
  if (!Number.isFinite(percent)) return 0;
  const snapped = Math.round(percent / CAPACITY_BONUS_STEP) * CAPACITY_BONUS_STEP;
  return Math.max(0, Math.min(CAPACITY_BONUS_MAX, snapped));
};

export { clampBonusPercent };
