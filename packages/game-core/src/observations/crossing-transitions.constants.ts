/* @layer bridge-wasm @kind constants */
import type { CrossingOrigin } from '../pathfinding/crossing.type';

const INDOOR_SOURCE: Partial<Record<CrossingOrigin, string>> = {
  'room-stair': 'stair',
  'room-border': 'walk',
  'room-door': 'exit',
  'exit-table': 'exit',
  'warp-slot': 'travel',
  'room-doorway': 'doorway',
};

const OUTDOOR_SOURCE: Partial<Record<CrossingOrigin, string>> = {
  'ow-entrance': 'entrance',
  'fall-hole': 'hole',
};

const FLOOD_SOURCE = 'flood';

export { INDOOR_SOURCE, OUTDOOR_SOURCE, FLOOD_SOURCE };
