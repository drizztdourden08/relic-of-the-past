/* @layer bridge-wasm @kind logic */
import type { EdgeName } from '../exit-order';
import { OUTER_WALL_FAR, OUTER_WALL_NEAR } from './room-doorways.constants';

const outerWall = (edge: EdgeName, row: number, col: number): boolean =>
  (edge === 'north' && row < OUTER_WALL_NEAR) || (edge === 'south' && row >= OUTER_WALL_FAR) ||
  (edge === 'west' && col < OUTER_WALL_NEAR) || (edge === 'east' && col >= OUTER_WALL_FAR);

export { outerWall };
