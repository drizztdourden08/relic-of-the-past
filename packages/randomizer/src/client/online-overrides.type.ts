/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';
import type { PollEntry } from './location-poller/location-poller.type';

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
