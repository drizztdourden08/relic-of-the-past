/* @layer shared-game @kind logic */
import { planOf, startTierOf } from '../capacity/family-plan';
import { PLAN_JUMPS } from './plan-jumps.constants';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { FamilySetting } from '../capacity/capacity-profile.type';
import type { CollectionState } from '../collection-state.type';

const planJumpsOf = (capacityFamily: CapacityFamily, setting: FamilySetting): readonly number[] => {
  const cached = PLAN_JUMPS.get(setting);
  if (cached !== undefined) return cached;
  const jumps = setting.mode === 'custom' ? planOf(capacityFamily, setting).jumps : [];
  PLAN_JUMPS.set(setting, jumps);
  return jumps;
};

const collectedStepsOf = (state: CollectionState, capacityFamily: CapacityFamily, setting: FamilySetting): number => {
  let steps = 0;
  for (let jump = 1; jump <= capacityFamily.maxJump; jump += 1) {
    steps += jump * state.count(capacityFamily.itemFor(jump));
  }
  const progressive = state.count(capacityFamily.progressiveItem);
  if (progressive > 0) {
    const jumps = planJumpsOf(capacityFamily, setting);
    for (let k = 0; k < Math.min(progressive, jumps.length); k += 1) steps += jumps[k];
  }
  return steps;
};

const tierReached = (state: CollectionState, capacityFamily: CapacityFamily, setting: FamilySetting): number =>
  Math.min(
    capacityFamily.ladder.length - 1,
    startTierOf(capacityFamily, setting) + collectedStepsOf(state, capacityFamily, setting),
  );

export { tierReached };
