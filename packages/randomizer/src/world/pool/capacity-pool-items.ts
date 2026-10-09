/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_LOCATIONS } from '../scope-tables';
import { familyOfSpot } from '../capacity/capacity-spots';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';
import type { CapacityPlans } from './pool.type';

const removeOne = (items: ItemKey[], wanted: ItemKey): void => {
  const index = items.indexOf(wanted);
  if (index !== -1) items.splice(index, 1);
};

const capacityPoolItems = (plans: CapacityPlans, lockedSpots: ReadonlySet<LocationKey>): ItemKey[] => {
  const perFamily: Record<CapacityFamilyId, ItemKey[]> = {
    explosives: [...plans.explosives.items],
    projectiles: [...plans.projectiles.items],
    meter: [],
    wallet: [...plans.wallet.items],
  };
  for (const [location, vanillaItem] of CAPACITY_UPGRADE_LOCATIONS) {
    const family = familyOfSpot(location);
    if (family !== undefined && lockedSpots.has(location)) removeOne(perFamily[family], vanillaItem);
  }
  return [...perFamily.explosives, ...perFamily.projectiles, ...perFamily.wallet];
};

export { capacityPoolItems };
