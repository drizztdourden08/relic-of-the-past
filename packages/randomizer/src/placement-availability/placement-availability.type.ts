/* @layer shared-game @kind types */
import type { RegionId } from '@rotp/game-data';
import type { LocationKey } from '../world/location-key';

interface PlacementReach {
  available: Set<LocationKey>;
  reachableRegions: Set<RegionId>;
}

export type { PlacementReach };
