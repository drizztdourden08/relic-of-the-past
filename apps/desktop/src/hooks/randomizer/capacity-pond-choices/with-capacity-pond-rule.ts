/* @layer renderer-hooks @kind logic */
import { reconcileCapacityPond } from '@rotp/randomizer';
import { capacityPondOf } from '../randomizer-choices';
import type { CapacityProfile, CapacityPondAuthority, ReconciledCapacityPond } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '../randomizer-choices';

const keepingPinned = (settled: ReconciledCapacityPond, stored: CapacityProfile): CapacityProfile => {
  if (settled.forcedFamilies.size === 0) return settled.capacity;
  const kept = Object.fromEntries([...settled.forcedFamilies.keys()].map((family) => [family, stored[family]]));
  return { ...settled.capacity, ...kept };
};

const withCapacityPondRule = (
  choices: RandomizerOptionChoices, authority: CapacityPondAuthority,
): RandomizerOptionChoices => {
  const settled = reconcileCapacityPond(capacityPondOf(choices), authority);
  return {
    ...choices,
    capacityEnabled: settled.enabled,
    capacity: keepingPinned(settled, choices.capacity),
    ponds: { ...choices.ponds, capacity: settled.pond },
  };
};

export { withCapacityPondRule };
