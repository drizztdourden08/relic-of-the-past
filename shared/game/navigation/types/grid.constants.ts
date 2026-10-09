/* @layer shared-game @kind constants */
import type { LedgeDir } from './grid.type';

const GRID_SIZE = 64;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const TRAVERSAL_DIRS: readonly LedgeDir[] = ['s', 'n', 'e', 'w', 'se', 'sw', 'ne', 'nw'] as const;
const TRAVERSAL_DIR_OFFSET: Record<LedgeDir, number> = { s: 2, n: 3, e: 4, w: 5, se: 6, sw: 7, ne: 8, nw: 9 };

const STAIRS_TRAVERSAL_STATE = 10;

export { GRID_SIZE, STAIRS_TRAVERSAL_STATE, TOTAL_TILES, TRAVERSAL_DIR_OFFSET, TRAVERSAL_DIRS };
