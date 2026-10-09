/* @layer renderer-stores @kind logic */
import type { PauseContext, PauseState } from '@rotp/game-data';
import { planConfirm } from '@rotp/game-data';
import { setGear } from '@rotp/game-core';

const performConfirm = (state: PauseState, ctx: PauseContext): boolean => {
  const plan = planConfirm(state, ctx);
  if (plan.outcome === 'refused') return false;
  if (plan.outcome === 'equip') setGear(plan.gear, plan.tier);
  return true;
};

export { performConfirm };
