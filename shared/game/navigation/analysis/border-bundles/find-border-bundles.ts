/* @layer shared-game @kind logic */
import type { FloodFillResult, ReachState } from '../../types';
import type { BorderBundle, BorderDir } from './border-bundles.type';
import { GRID_SIZE } from '../../types';
import { BORDER_DIRS } from './border-bundles.constants';

const borderCell = (grid: ReachState[][], direction: BorderDir, i: number): ReachState | undefined => {
  switch (direction) {
    case 'n': return grid[0]?.[i];
    case 's': return grid[GRID_SIZE - 1]?.[i];
    case 'e': return grid[i]?.[GRID_SIZE - 1];
    case 'w': return grid[i]?.[0];
  }
};

const reachableBorderTiles = (result: FloodFillResult, direction: BorderDir): number[] => {
  const tiles: number[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    if (borderCell(result.reachable, direction, i) === 1) tiles.push(i);
  }
  return tiles;
};

const splitIntoBundles = (tiles: number[], direction: BorderDir, prefix: string): BorderBundle[] => {
  const bundles: BorderBundle[] = [];
  let bundleStart = 0;
  for (let i = 1; i <= tiles.length; i++) {
    if (i === tiles.length || tiles[i] !== tiles[i - 1] + 1) {
      bundles.push({
        id: `${prefix}-edge-${direction}-${bundles.length}`,
        direction,
        tiles: tiles.slice(bundleStart, i),
        requirements: [],
      });
      bundleStart = i;
    }
  }
  return bundles;
};

const findBorderBundles = (result: FloodFillResult): BorderBundle[] => {
  const prefix = `lw-${result.screenIndex.toString(16).padStart(2, '0')}`;
  return BORDER_DIRS.flatMap((direction) => splitIntoBundles(reachableBorderTiles(result, direction), direction, prefix));
};

export { findBorderBundles };
