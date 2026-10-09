/* @layer shared-game @kind logic */
import { shopSlotLocationsOf } from './shop-slot-locations-of';
import type { RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../../location-key';
import type { ShopScope } from '../shop-scope.type';

const shopLocationsByRegion = (scope: ShopScope): ReadonlyMap<RegionId, readonly LocationKey[]> => {
  const byRegion = new Map<RegionId, LocationKey[]>();
  for (const row of shopSlotLocationsOf(scope)) {
    const keys = byRegion.get(row.slot.region) ?? [];
    keys.push(row.key);
    byRegion.set(row.slot.region, keys);
  }
  return byRegion;
};

export { shopLocationsByRegion };
