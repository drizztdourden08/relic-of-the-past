/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { RegionReachMap } from './regions.type';
import { cellAt } from '../../../checked-access';
import { LANDING_SCAN_WINDOW, REGION_GRID_SIZE } from './regions.constants';

const regionCovered = (map: RegionReachMap, screenId: string, tile?: GridPos): boolean => {
  const grid = map.get(screenId);
  if (!grid || !tile) return true;
  for (let dr = -LANDING_SCAN_WINDOW; dr <= LANDING_SCAN_WINDOW; dr++) {
    for (let dc = -LANDING_SCAN_WINDOW; dc <= LANDING_SCAN_WINDOW; dc++) {
      const r = tile.row + dr;
      const c = tile.col + dc;
      if (r < 0 || r >= REGION_GRID_SIZE || c < 0 || c >= REGION_GRID_SIZE) continue;
      if (cellAt(grid, r, c)) return true;
    }
  }
  return false;
};

export { regionCovered };
