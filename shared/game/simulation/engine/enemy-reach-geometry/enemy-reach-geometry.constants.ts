/* @layer shared-game @kind constants */
import type { GridPos } from '../../../navigation/types';

const MAX_SEARCH_STEPS = 64;

const ORTHOGONAL_DIRECTIONS: readonly GridPos[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const PROJECTILE_BLOCKED = 1;

export { MAX_SEARCH_STEPS, ORTHOGONAL_DIRECTIONS, PROJECTILE_BLOCKED };
