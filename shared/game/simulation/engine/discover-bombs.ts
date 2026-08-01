/* @layer shared-game @kind logic */
/**
 * Cracked walls the run can blow open right now.
 *
 * The flood models one as an obstacle needing bombs, which only lets the player
 * stand ON it — the passage beyond stays shut, which is not what a bomb does. So
 * a reachable wall is offered as a TARGET instead: blast it, mark it floor, and
 * re-flood. One target per contiguous patch, since a single blast opens the lot.
 */
import type { GridPos } from '../../navigation/types';
import type { SimObservation } from '../types';
import { hasReachableNeighbor, DOOR_REACH_RADIUS } from './discover-reach';
import type { Reached } from './discover-reach';
import type { EngineState, SimTarget } from './state';

/** Cracked-wall attrs (TileBehavior_FlaggableDoor) — solid until blasted. */
const BOMBABLE_ATTR_MIN = 0xf0;
const BOMBABLE_ATTR_MAX = 0xff;

const discoverBombableWalls = (state: EngineState, obs: SimObservation, reached: Reached): SimTarget[] => {
  const bundle = obs.grids;
  if (!bundle) return [];
  // A split-level room keeps its floor on the LAYER grids and the dual-layer flood
  // reads those, not rawAttrGrid — so a wall scan that only looked at the raw grid
  // missed every cracked wall in such a room. Scan all of them.
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  const roomId = bundle.screenIndex;
  const targets: SimTarget[] = [];
  const claimed: GridPos[] = [];
  const rows = Math.max(...grids.map((g) => g.length));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 64; col++) {
      if (!grids.some((g) => { const a = g[row]?.[col] ?? 0; return a >= BOMBABLE_ATTR_MIN && a <= BOMBABLE_ATTR_MAX; })) continue;
      const tile = { row, col };
      // One target per patch: a blast opens everything around it.
      if (claimed.some((p) => Math.abs(p.row - row) <= 4 && Math.abs(p.col - col) <= 4)) continue;
      if (!hasReachableNeighbor(reached, tile, DOOR_REACH_RADIUS)) continue;
      const key = `bomb:${roomId}:${row},${col}`;
      if (state.done.has(key) || state.failed.has(key)) continue;
      claimed.push(tile);
      targets.push({
        screenId: state.virtual.screenId,
        roomId,
        action: { type: 'bombWall', roomId, tile },
        key,
        role: 'gate',
        label: `cracked wall (room ${roomId.toString(16)} @${col},${row})`,
        noun: 'cracked wall',
        verb: 'Bombing',
        tile,
      });
    }
  }
  return targets;
};

export { discoverBombableWalls, BOMBABLE_ATTR_MIN, BOMBABLE_ATTR_MAX };
