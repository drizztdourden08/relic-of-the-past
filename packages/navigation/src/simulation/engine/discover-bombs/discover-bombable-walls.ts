/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SimObservation } from '../../types';
import { hasReachableNeighbor } from '../discover-reach/has-reachable-neighbor';
import { DOOR_REACH_RADIUS } from '../discover-reach/discover-reach.constants';
import type { Reached } from '../discover-reach/discover-reach.type';
import type { EngineState, SimTarget } from '../state/state.type';
import { BLAST_PATCH_RADIUS, BOMB_SCAN_COLS } from './discover-bombs.constants';
import { attrGridsOf } from './attr-grids-of';
import { isBombableAttr } from './is-bombable-attr';

const inClaimedPatch = (claimed: GridPos[], row: number, col: number): boolean =>
  claimed.some((p) => Math.abs(p.row - row) <= BLAST_PATCH_RADIUS && Math.abs(p.col - col) <= BLAST_PATCH_RADIUS);

const wallTarget = (state: EngineState, roomId: number, tile: GridPos, key: string): SimTarget => ({
  screenId: state.virtual.screenId,
  roomId,
  action: { type: 'bombWall', roomId, tile },
  key,
  role: 'gate',
  label: `cracked wall (room ${roomId.toString(16)} @${tile.col},${tile.row})`,
  noun: 'cracked wall',
  verb: 'Bombing',
  tile,
});

const discoverBombableWalls = (state: EngineState, obs: SimObservation, reached: Reached): SimTarget[] => {
  const bundle = obs.grids;
  if (!bundle) return [];
  const grids = attrGridsOf(bundle);
  const roomId = bundle.screenIndex;
  const targets: SimTarget[] = [];
  const claimed: GridPos[] = [];
  const rows = Math.max(...grids.map((g) => g.length));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < BOMB_SCAN_COLS; col++) {
      if (!grids.some((g) => isBombableAttr(g[row]?.[col] ?? 0))) continue;
      const tile = { row, col };
      if (inClaimedPatch(claimed, row, col)) continue;
      if (!hasReachableNeighbor(reached, tile, DOOR_REACH_RADIUS)) continue;
      const key = `bomb:${roomId}:${row},${col}`;
      if (state.done.has(key) || state.failed.has(key)) continue;
      claimed.push(tile);
      targets.push(wallTarget(state, roomId, tile, key));
    }
  }
  return targets;
};

export { discoverBombableWalls };
