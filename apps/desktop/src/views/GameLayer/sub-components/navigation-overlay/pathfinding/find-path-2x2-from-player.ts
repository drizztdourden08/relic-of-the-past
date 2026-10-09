/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { isValid2x2 } from './is-valid-2x2';
import { findNearest2x2Goal } from './find-nearest-2x2-goal';
import { findPath2x2AStar } from './find-path-2x2-astar';
import { findPath2x2LayerAware } from './find-path-2x2-layer-aware';
import { TILE_PX } from './pathfinding.constants';
import type { LayerGrids, LayerIndex } from './pathfinding.type';

const findPath2x2FromPlayer = (playerX: number, playerY: number, screenWorldX: number, screenWorldY: number, goal: GridPos, reachable: ReachState[][], layerGrids?: LayerGrids, startLayer?: LayerIndex): GridPos[] | null => {
  const startRow = Math.floor((playerY - screenWorldY) / TILE_PX);
  const startCol = Math.floor((playerX - screenWorldX) / TILE_PX);

  if (layerGrids && startLayer !== undefined) {
    const grid = layerGrids[startLayer];
    const start = isValid2x2(startRow, startCol, grid)
      ? { row: startRow, col: startCol }
      : findNearest2x2Goal(startRow, startCol, grid);
    if (!start) return null;
    return findPath2x2LayerAware(start, goal, startLayer, layerGrids, reachable);
  }

  const start = isValid2x2(startRow, startCol, reachable)
    ? { row: startRow, col: startCol }
    : findNearest2x2Goal(startRow, startCol, reachable);
  if (!start) return null;
  return findPath2x2AStar(start, goal, reachable);
};

export { findPath2x2FromPlayer };
