/* @layer shared-game @kind logic */
import type { LedgeStep } from './indoor-ledge-dirs.type';
import { GRID_SIZE } from '../types';
import {
  HORIZ_LEDGE_ATTRS, STEP_EAST, STEP_NORTH, STEP_SOUTH, STEP_WEST, VERT_LEDGE_ATTRS, WALL_SEARCH_RANGE,
} from './indoor-ledge-dirs.constants';

const inferAxisDir = (wallAt: (d: number) => boolean, negDir: LedgeStep, posDir: LedgeStep): LedgeStep => {
  const hasWallNeg = wallAt(-1);
  const hasWallPos = wallAt(1);
  if (hasWallPos && !hasWallNeg) return posDir;
  if (hasWallNeg && !hasWallPos) return negDir;

  let neg = 0, pos = 0;
  for (let d = 1; d <= WALL_SEARCH_RANGE; d++) {
    if (wallAt(d)) pos++;
    if (wallAt(-d)) neg++;
  }
  if (neg > pos) return negDir;
  return posDir;
};

const computeIndoorLedgeDirs = (rawAttr: number[][], cliffWall: ReadonlySet<number>): Map<number, LedgeStep> => {
  const dirs = new Map<number, LedgeStep>();
  const wall = (r: number, c: number) =>
    r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && cliffWall.has(rawAttr[r][c]);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      if (HORIZ_LEDGE_ATTRS.has(attr)) {
        dirs.set(row * GRID_SIZE + col, inferAxisDir((d) => wall(row, col + d), STEP_WEST, STEP_EAST));
      } else if (VERT_LEDGE_ATTRS.has(attr)) {
        dirs.set(row * GRID_SIZE + col, inferAxisDir((d) => wall(row + d, col), STEP_NORTH, STEP_SOUTH));
      }
    }
  }
  return dirs;
};

export { computeIndoorLedgeDirs };
export type { LedgeStep } from './indoor-ledge-dirs.type';
