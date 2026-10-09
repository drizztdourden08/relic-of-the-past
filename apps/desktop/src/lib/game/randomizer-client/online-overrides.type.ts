/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { PollEntry } from './location-poller';

interface ScoutMaps {
  keyByLocationId: Map<number, LocationKey>;
  locationIdByKey: Map<LocationKey, number>;
  overriddenLocationIds: Set<number>;
}

interface ScoutPlan {
  locationIds: number[];
  pollEntries: PollEntry[];
}

export type { ScoutMaps, ScoutPlan };
