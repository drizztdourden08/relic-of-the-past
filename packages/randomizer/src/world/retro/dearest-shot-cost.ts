/* @layer shared-game @kind logic */
import type { RetroBowSetting } from './retro.type';

const dearestShotCost = (setting: RetroBowSetting): number =>
  Math.max(setting.woodArrowCost, setting.silverArrowCost);

export { dearestShotCost };
