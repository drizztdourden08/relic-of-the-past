/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { RegionReachMap } from './regions.type';
import { ENTRY_STAMP_RADIUS, REGION_GRID_SIZE } from './regions.constants';

const emptyGrid = (): boolean[][] =>
  Array.from({ length: REGION_GRID_SIZE }, () => new Array<boolean>(REGION_GRID_SIZE).fill(false));

const stampReach = (map: RegionReachMap, screenId: string, tile: GridPos): void => {
  const grid = map.get(screenId) ?? emptyGrid();
  for (let dr = -ENTRY_STAMP_RADIUS; dr <= ENTRY_STAMP_RADIUS; dr++) {
    for (let dc = -ENTRY_STAMP_RADIUS; dc <= ENTRY_STAMP_RADIUS; dc++) {
      const r = tile.row + dr;
      const c = tile.col + dc;
      if (r >= 0 && r < REGION_GRID_SIZE && c >= 0 && c < REGION_GRID_SIZE) grid[r][c] = true;
    }
  }
  map.set(screenId, grid);
};

export { stampReach };
