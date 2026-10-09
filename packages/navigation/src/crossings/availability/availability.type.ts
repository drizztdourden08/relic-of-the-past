/* @layer bridge-wasm @kind types */
import type { GridPos, ReachState } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';

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
