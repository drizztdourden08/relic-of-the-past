/* @layer shared-game @kind types */
import type { RegionId } from '../../game/data/types/ids';
import type { LocationKey } from '../world/location-key';

interface PlacementReach {
  available: Set<LocationKey>;
  reachableRegions: Set<RegionId>;
}

export type { PlacementReach };
