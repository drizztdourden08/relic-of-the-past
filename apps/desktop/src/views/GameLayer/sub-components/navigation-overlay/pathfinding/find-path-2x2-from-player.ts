/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';
import { isValid2x2 } from './is-valid-2x2';
import { findNearest2x2Goal } from './find-nearest-2x2-goal';
import { findPath2x2AStar } from './find-path-2x2-astar';
import { findPath2x2LayerAware } from './find-path-2x2-layer-aware';
import { TILE_PX } from './pathfinding.constants';
import type { PlayerPathQuery } from './pathfinding.type';

const findPath2x2FromPlayer = (query: PlayerPathQuery): GridPos[] | null => {
  const { player, screenWorld, goal, reachable, layerGrids, startLayer } = query;
  const startRow = Math.floor((player.y - screenWorld.y) / TILE_PX);
  const startCol = Math.floor((player.x - screenWorld.x) / TILE_PX);

  if (layerGrids && startLayer !== undefined) {
    const grid = layerGrids[startLayer];
    const start = isValid2x2(startRow, startCol, grid)
      ? { row: startRow, col: startCol }
      : findNearest2x2Goal(startRow, startCol, grid);
    if (!start) return null;
    return findPath2x2LayerAware({ start, goal, startLayer, layerGrids, merged: reachable });
  }

  const start = isValid2x2(startRow, startCol, reachable)
    ? { row: startRow, col: startCol }
    : findNearest2x2Goal(startRow, startCol, reachable);
  if (!start) return null;
  return findPath2x2AStar(start, goal, reachable);
};

export { findPath2x2FromPlayer };
