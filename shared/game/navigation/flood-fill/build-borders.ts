/* @layer shared-game @kind logic */
import type { ReachState, TransitionPoint, FloodFillResult } from '../types';
import type { TileReq } from '../tile-attrs';
import { unmetRequirements } from '../core/inventory';

const buildBorders = (transitions: TransitionPoint[], reachable: ReachState[][], inv: Set<TileReq>): FloodFillResult['borders'] => {
  const borders: FloodFillResult['borders'] = {
    north: { freeTiles: [], itemTiles: [] },
    south: { freeTiles: [], itemTiles: [] },
    east: { freeTiles: [], itemTiles: [] },
    west: { freeTiles: [], itemTiles: [] },
  };

  for (const t of transitions) {
    if (t.edge === 'entrance') continue;
    if (reachable[t.row][t.col] >= 2) continue;
    const pos = t.edge === 'north' || t.edge === 'south' ? t.col : t.row;
    const unmet = unmetRequirements(t.requirements, inv);
    if (unmet.length === 0) {
      borders[t.edge].freeTiles.push(pos);
    } else {
      borders[t.edge].itemTiles.push({ pos, requirements: unmet });
    }
  }
  return borders;
};

export { buildBorders };
