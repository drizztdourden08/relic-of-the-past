/* @layer shared-game @kind logic */
import { all, getItem, capacityFamilyOfItemName } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import type { LocationKey } from '../../location-key';
import type { CapacityFamilyId } from '../capacity-profile.type';

const familyOfCheck = (check: CheckRecord): CapacityFamilyId | undefined => {
  const [only] = check.vanillaItemIds;
  if (only === undefined || check.vanillaItemIds.length !== 1 || (check.pond?.rung ?? 1) !== 1) return undefined;
  return capacityFamilyOfItemName(getItem(only).name);
};

const spotsByFamily = (): ReadonlyMap<CapacityFamilyId, LocationKey> => {
  const spots = new Map<CapacityFamilyId, LocationKey>();
  for (const check of [...all('check')].sort((a, b) => a.id.localeCompare(b.id))) {
    const family = familyOfCheck(check);
    if (family !== undefined && !spots.has(family)) spots.set(family, check.id);
  }
  return spots;
};

let spots: ReadonlyMap<CapacityFamilyId, LocationKey> | null = null;

const capacitySpots = (): ReadonlyMap<CapacityFamilyId, LocationKey> => {
  spots ??= spotsByFamily();
  return spots;
};

export { capacitySpots };
