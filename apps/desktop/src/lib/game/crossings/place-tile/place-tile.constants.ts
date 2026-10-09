/* @layer bridge-wasm @kind constants */
import type { GridPos } from '@shared/game/navigation';
import type { DoorSide } from './place-tile.type';

const DOOR_REACH_RADIUS = 14;
const ASSUMED_DEPTH = 2;
const GRID = 64;

const INWARD: Record<DoorSide, GridPos> = {
  north: { row: 1, col: 0 },
  south: { row: -1, col: 0 },
  west: { row: 0, col: 1 },
  east: { row: 0, col: -1 },
};

export { DOOR_REACH_RADIUS, ASSUMED_DEPTH, GRID, INWARD };
