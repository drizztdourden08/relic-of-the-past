/* @layer bridge-wasm @kind types */
import type { GridPos } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import type { ReachState } from '@rotp/game-core';

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
