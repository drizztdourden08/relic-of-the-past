/* @layer bridge-wasm @kind types */
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { ReachState } from '@shared/game/navigation/types';

interface AvailabilityArgs {
  tile: GridPos;
  requirements?: readonly string[];
  reachable?: readonly ReachState[][];
  items: readonly TileReq[];
}

interface Availability {
  available: boolean;
  requirements: readonly string[];
}

export type { Availability, AvailabilityArgs };
