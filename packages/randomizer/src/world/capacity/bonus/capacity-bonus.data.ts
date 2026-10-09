/* @layer shared-game @kind data */
import type { CapacityBonusSetting } from './capacity-bonus.type';

const CAPACITY_BONUS_STEP = 5;
const CAPACITY_BONUS_MAX = 100;

const REFERENCE_CAPACITY_BONUS: CapacityBonusSetting = {
  explosives: { percent: 100, stepBase: false },
  projectiles: { percent: 100, stepBase: false },
  meter: { percent: 15, stepBase: false },
  wallet: { percent: 50, stepBase: true },
};

const DEFAULT_CAPACITY_BONUS: CapacityBonusSetting = {
  explosives: { percent: 25, stepBase: true },
  projectiles: { percent: 25, stepBase: true },
  meter: { percent: 100, stepBase: false },
  wallet: { percent: 0, stepBase: true },
};

export {
  CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP, DEFAULT_CAPACITY_BONUS, REFERENCE_CAPACITY_BONUS,
};
