/* @layer shared-game @kind constants */
import { GRID_SIZE } from '../../types/grid.constants';

const DOORWAY_MAX_WIDTH = 6;

const OPEN_ATTR = 0x00;
const SOLID_ATTR = 0x01;

const GRID_EDGES: ReadonlyArray<(i: number) => [number, number]> = [
  (i) => [0, i],
  (i) => [GRID_SIZE - 1, i],
  (i) => [i, 0],
  (i) => [i, GRID_SIZE - 1],
];

export { DOORWAY_MAX_WIDTH, GRID_EDGES, OPEN_ATTR, SOLID_ATTR };
