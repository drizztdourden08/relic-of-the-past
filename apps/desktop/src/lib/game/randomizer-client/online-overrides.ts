/* @layer bridge-wasm @kind logic */
import { locationKeyOfApId } from '@rotp/randomizer';
import { log } from '../../log-bus';
import type { LocationKey } from '@rotp/randomizer';
import type { ApGameData } from '@rotp/randomizer';
import type { ScoutMaps, ScoutPlan } from '@rotp/randomizer';

const keyOfLocationId = (id: number): LocationKey | undefined => {
  try {
    return locationKeyOfApId(id);
  } catch {
    return undefined;
  }
};

const buildScoutPlan = (gameData: ApGameData, maps: ScoutMaps): ScoutPlan => {
  const locationIds: number[] = [];
  for (const [name, locationId] of Object.entries(gameData.location_name_to_id)) {
    const key = keyOfLocationId(locationId);
    if (key === undefined) {
      log.randomizer(`[Online] No location of this game has server id ${locationId} (${name})`, 'warn');
      continue;
    }
    maps.keyByLocationId.set(locationId, key);
    maps.locationIdByKey.set(key, locationId);
    maps.overriddenLocationIds.add(locationId);
    locationIds.push(locationId);
  }
  return { locationIds, pollEntries: [] };
};

export { buildScoutPlan };
export type { ScoutMaps, ScoutPlan } from '@rotp/randomizer';
