/* @layer shared-game @kind logic */
/** Entrance-position resolution and border-bundle building for the flood-fill orchestrator. */
import type { OverworldEntrance, CollisionGrid, ReachState, TransitionPoint, FloodFillResult } from '../types';
import type { TileReq } from '../tile-attrs';
import { unmetRequirements } from '../core/inventory';
import type { QuadrantBounds } from '../strategies/layer-strategy';

const findEntrancePositions = (indoors: boolean, entrances: OverworldEntrance[], screenIndex: number): { screenEntrances: OverworldEntrance[]; entrancePositions: { row: number; col: number; idx: number }[] } => {
  if (!indoors) {
    const screenEntrances = entrances.filter(e => e.area === screenIndex);
    const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
    return { screenEntrances, entrancePositions };
  }

  // Interior rooms: filter entrances physically placed in this room (area === screenIndex).
  // The widget adds indoor spawn positions and stairs with area = roomIndex.
  const screenEntrances = entrances.filter(e => e.area === screenIndex);
  const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
  return { screenEntrances, entrancePositions };
};

const buildBorders = (transitions: TransitionPoint[], reachable: ReachState[][], grid: CollisionGrid, inv: Set<TileReq>, quadrantBounds?: QuadrantBounds): FloodFillResult['borders'] => {
  const borders: FloodFillResult['borders'] = {
    north: { freeTiles: [], itemTiles: [] },
    south: { freeTiles: [], itemTiles: [] },
    east: { freeTiles: [], itemTiles: [] },
    west: { freeTiles: [], itemTiles: [] },
  };

  for (const t of transitions) {
    if (t.edge === 'entrance') continue;
    if (reachable[t.row][t.col] >= 2) continue;
    const attr = grid.rawAttr[t.row]?.[t.col] ?? 0;
    // Door passage tiles (0x80-0x8F) at room edges are valid inter-room transitions.
    // BFS doesn't propagate past the grid boundary — these just get reported as exits.
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

export { findEntrancePositions, buildBorders };
