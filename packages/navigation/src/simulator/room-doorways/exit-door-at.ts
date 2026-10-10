/* @layer bridge-wasm @kind logic */
import type { EdgeName } from '../exit-order';
import { alongEdge } from '../exit-order';
import {
  EXIT_DOOR_SCAN_DEPTH, EXIT_DOOR_TRIGGER_ATTR, FLAG_GATED_DOOR_MAX, FLAG_GATED_DOOR_MIN, GRID,
} from './room-doorways.constants';
import { roomLayerGrids } from './room-layer-grids';

const blockedTriggerAttr = (a: number): boolean =>
  a === EXIT_DOOR_TRIGGER_ATTR || (a >= FLAG_GATED_DOOR_MIN && a <= FLAG_GATED_DOOR_MAX);

const exitDoorAt = (roomId: number, edge: EdgeName, pos: number): boolean => {
  const grids = roomLayerGrids(roomId);
  for (let depth = 0; depth <= EXIT_DOOR_SCAN_DEPTH; depth++) {
    for (let dpos = -1; dpos <= 2; dpos++) {
      const p = pos + dpos;
      if (p < 0 || p >= GRID) continue;
      const { row: r, col: c } = alongEdge(edge, p, { north: depth, south: 63 - depth, west: depth, east: 63 - depth });
      if (grids.some((g) => blockedTriggerAttr(g[r]?.[c] ?? 0))) return true;
    }
  }
  return false;
};

export { exitDoorAt };
