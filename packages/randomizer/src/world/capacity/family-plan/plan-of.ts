/* @layer shared-game @kind logic */
import { jumpsOf } from '../curves/jumps-of';
import { ladderOf } from '../curves/ladder-of';
import type { CapacityFamily } from '../capacity-family';
import type { FamilyPlan, FamilySetting } from '../capacity-profile.type';

const planOf = (capacityFamily: CapacityFamily, setting: FamilySetting, progressive = false): FamilyPlan => {
  const { ladder, vanillaRung, referenceJumps, hasSpot, itemFor, progressiveItem, indexOf, maxJump } = capacityFamily;
  if (setting.mode === 'vanilla') {
    return { jumps: [], ladder: ladder.slice(vanillaRung), items: [], spotIsCheck: false, progressive: false };
  }
  if (setting.mode === 'vanilla-in-pool') {
    const jumps = referenceJumps;
    return {
      jumps, ladder: ladderOf(ladder, vanillaRung, jumps), items: jumps.map(itemFor), spotIsCheck: hasSpot, progressive: false,
    };
  }
  const { start, max, count, shape } = setting;
  const low = indexOf(start);
  const span = indexOf(max) - low;
  const jumps = span > 0 ? jumpsOf(shape, count, span, maxJump) : [];
  const items = progressive ? jumps.map(() => progressiveItem) : jumps.map(itemFor);
  return { jumps, ladder: ladderOf(ladder, low, jumps), items, spotIsCheck: hasSpot, progressive };
};

export { planOf };
