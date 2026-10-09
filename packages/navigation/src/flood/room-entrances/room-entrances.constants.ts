/* @layer bridge-wasm @kind constants */
const THRONE_DOOR = 0x14;
const STAIR_ID_BASE = 1000;
const BOUNDARY_ID_BASE = 2000;
const GRID = 64;

const DOOR_LANDING_OFFSET = {
  south: { row: 3, col: 1 },
  north: { row: 4, col: 1 },
  side: { row: 1, col: 2 },
} as const;

export { THRONE_DOOR, STAIR_ID_BASE, BOUNDARY_ID_BASE, GRID, DOOR_LANDING_OFFSET };
