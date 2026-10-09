/* @layer shared-game @kind logic */
import type { RetroBowSetting, RetroCostCeilings } from './retro.type';

const heldRetroBow = (setting: RetroBowSetting, ceilings: RetroCostCeilings): RetroBowSetting => {
  const woodArrowCost = Math.min(setting.woodArrowCost, ceilings.wood);
  const silverArrowCost = Math.min(setting.silverArrowCost, ceilings.silver);
  if (woodArrowCost === setting.woodArrowCost && silverArrowCost === setting.silverArrowCost) return setting;
  return { ...setting, woodArrowCost, silverArrowCost };
};

export { heldRetroBow };
