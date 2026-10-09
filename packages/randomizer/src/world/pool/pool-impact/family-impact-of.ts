/* @layer shared-game @kind logic */
import { familyById } from '../../capacity/capacity-family';
import { familyOfOptionKey } from '../../capacity/capacity-option-keys';
import { capacityProfileFromSnapshot } from '../../capacity/capacity-profile-from-snapshot';
import { planOf } from '../../capacity/family-plan';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { PoolImpact } from '../pool.type';

const familyImpactOf = (key: string, snapshot: RandomizerOptionsSnapshot): PoolImpact | undefined => {
  const familyId = familyOfOptionKey(key);
  if (familyId === undefined) return undefined;
  const plan = planOf(familyById(familyId), capacityProfileFromSnapshot(snapshot)[familyId]);
  const count = plan.items.length;
  return {
    locations: plan.spotIsCheck ? 1 : 0,
    items: count,
    note: count > 0 ? `${count} upgrade${count === 1 ? '' : 's'}, replacing filler` : 'vanilla',
  };
};

export { familyImpactOf };
