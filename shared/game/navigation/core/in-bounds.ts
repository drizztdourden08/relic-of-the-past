/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../types/grid.constants';

const inBounds = (row: number, col: number): boolean => row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;

export { inBounds };
