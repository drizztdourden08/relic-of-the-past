/* @layer shared-game @kind logic */
import { FAMILIES } from '../capacity-family';
import { capacityPlansOf } from './capacity-plans-of';
import type { CapacityFamilyId, CapacityPoolCounts, CapacityProfile } from '../capacity-profile.type';

const capacityPoolCountsOf = (profile: CapacityProfile, checkSpots: number): CapacityPoolCounts => {
  const plans = capacityPlansOf(profile);
  const perFamily = Object.fromEntries(
    FAMILIES.map((capacityFamily) => [capacityFamily.id, plans[capacityFamily.id].items.length]),
  ) as Record<CapacityFamilyId, number>;
  const total = FAMILIES.reduce((sum, capacityFamily) => sum + perFamily[capacityFamily.id], 0);
  return { perFamily, poolDelta: total - checkSpots };
};

export { capacityPoolCountsOf };
