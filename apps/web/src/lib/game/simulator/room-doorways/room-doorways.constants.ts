/* @layer bridge-wasm @kind constants */
import type { EdgeName } from '../exit-order';

const ROOMS_PER_ROW = 16;
const ROOM_ROWS = 20;

const ROOM_EDGE_ADJ: Record<EdgeName, (r: number) => number | null> = {
  north: (r) => (Math.floor(r / ROOMS_PER_ROW) > 0 ? r - ROOMS_PER_ROW : null),
  south: (r) => (Math.floor(r / ROOMS_PER_ROW) < ROOM_ROWS - 1 ? r + ROOMS_PER_ROW : null),
  west: (r) => (r % ROOMS_PER_ROW > 0 ? r - 1 : null),
  east: (r) => (r % ROOMS_PER_ROW < ROOMS_PER_ROW - 1 ? r + 1 : null),
};

const OPPOSITE: Record<EdgeName, EdgeName> = { north: 'south', south: 'north', west: 'east', east: 'west' };

const OUTER_WALL_NEAR = 8;
const OUTER_WALL_FAR = 52;
const EXIT_DOOR_TRIGGER_ATTR = 0x8e;
const FLAG_GATED_DOOR_MIN = 0xf0;
const FLAG_GATED_DOOR_MAX = 0xf7;
const EXIT_DOOR_SCAN_DEPTH = 14;
const LANDING_SCAN_DEPTH = 3;
const GRID = 64;

export {
  ROOM_EDGE_ADJ, OPPOSITE, OUTER_WALL_NEAR, OUTER_WALL_FAR, EXIT_DOOR_TRIGGER_ATTR,
  FLAG_GATED_DOOR_MIN, FLAG_GATED_DOOR_MAX, EXIT_DOOR_SCAN_DEPTH, LANDING_SCAN_DEPTH, GRID,
};
