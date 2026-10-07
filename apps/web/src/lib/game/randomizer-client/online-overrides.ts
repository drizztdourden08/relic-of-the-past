/* @layer bridge-wasm @kind logic */
/**
 * Online scout plumbing: maps every server location of this game to the key it stands for,
 * through the frozen id table (ap-ids.data.ts). What each scouted location arms is decided by
 * the shared start sequence over the placement the scouts become (online-scouted.ts); server
 * items no in-world pickup covers are delivered by server-delivery.ts.
 *
 * Scout-first dedup: every scouted location id joins `overriddenLocationIds` BEFORE the
 * scout is sent. Once the scouts are armed, the set keeps exactly the locations the game
 * grants in-world, so their receive-path delivery is swallowed (online-received.ts).
 */
import { locationKeyOfApId } from '@shared/randomizer/archipelago/ap-id-lookup';
import { log } from '../../log-bus';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ApGameData } from './ap-protocol.type';
import type { PollEntry } from './location-poller';

interface ScoutMaps {
  /** A server location id to the key it is: the wire speaks ids, the app keys by key. */
  keyByLocationId: Map<number, LocationKey>;
  locationIdByKey: Map<LocationKey, number>;
  overriddenLocationIds: Set<number>;
}

interface ScoutPlan {
  locationIds: number[];
  /** What to poll before the scouts are armed; the armed plan replaces it. */
  pollEntries: PollEntry[];
}

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
export type { ScoutMaps, ScoutPlan };
