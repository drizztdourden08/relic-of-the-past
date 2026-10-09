/* @layer shared-game @kind logic */
import { getCheck } from '@rotp/game-data';
import { isSeedLocation } from '../seed-locations';
import { REGION_LOCATION_ORDER } from '../fill/location-order.constants';
import { POND_REGION_LOCATIONS } from '../pond/pond-region-locations';
import { checksByRegion } from '../world-from-records';
import type { RegionId } from '@rotp/game-data';
import type { LocationKey } from '../location-key.type';

const regionLocationKeys = (regionId: RegionId): readonly LocationKey[] => {
  const rows = (checksByRegion().get(regionId) ?? []).filter((id) => isSeedLocation(getCheck(id)));
  const stated = POND_REGION_LOCATIONS.get(regionId) ?? REGION_LOCATION_ORDER[regionId];
  if (stated === undefined) return rows;
  const held = new Set<LocationKey>(rows);
  const wrong = [
    ...rows.filter((id) => !stated.includes(id)),
    ...stated.filter((key) => key.startsWith('check-') && !held.has(key)),
  ];
  if (wrong.length > 0) throw new Error(`stated locations do not match the rows: ${regionId} ${wrong.join(' ')}`);
  return stated;
};

export { regionLocationKeys };
