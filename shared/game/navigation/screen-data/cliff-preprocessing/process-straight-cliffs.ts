/* @layer shared-game @kind logic */
import type { TilePassability, LedgeTraversal } from '@rotp/game-core';
import type { LedgeStep } from '../indoor-ledge-dirs.type';
import { GRID_SIZE } from '../../types/grid.constants';
import { inBounds } from '../../core/in-bounds';
import { computeIndoorLedgeDirs } from '../indoor-ledge-dirs';
import { HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS } from '../indoor-ledge-dirs.constants';
import {
  CLIFF_TRIGGER_ATTRS, INDOOR_CLIFF_DIRS, INDOOR_CLIFF_WALL, OUTDOOR_CLIFF_DIRS, OUTDOOR_CLIFF_WALL,
} from './cliff-preprocessing.constants';

const hasPairedTrigger = (indoorDirs: Map<number, LedgeStep>, rawAttr: number[][], cliffWall: ReadonlySet<number>, row: number, col: number, step: LedgeStep): boolean => {
  const { dr, dc, dir } = step;
  const [pr, pc] = dr !== 0 ? [0, 1] : [1, 0];
  const pairs = (r2: number, c2: number): boolean => {
    if (indoorDirs.get(r2 * GRID_SIZE + c2)?.dir !== dir) return false;
    const ar = r2 - dr, ac = c2 - dc;
    return inBounds(ar, ac) && !cliffWall.has(rawAttr[ar][ac]);
  };
  return pairs(row - pr, col - pc) || pairs(row + pr, col + pc);
};

const hasTwoWideBand = (rawAttr: number[][], cliffWall: ReadonlySet<number>, row: number, col: number, dr: number): boolean => {
  const banded = (r: number, c: number): boolean => CLIFF_TRIGGER_ATTRS.has(rawAttr[r][c]) || cliffWall.has(rawAttr[r][c]);
  if (dr !== 0) return (col > 0 && banded(row, col - 1)) || (col < GRID_SIZE - 1 && banded(row, col + 1));
  return (row > 0 && banded(row - 1, col)) || (row < GRID_SIZE - 1 && banded(row + 1, col));
};

const processStraightCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[], isIndoors = false): void => {
  const cliffDirs = isIndoors ? INDOOR_CLIFF_DIRS : OUTDOOR_CLIFF_DIRS;
  const cliffWall = isIndoors ? INDOOR_CLIFF_WALL : OUTDOOR_CLIFF_WALL;
  const indoorDirs = isIndoors ? computeIndoorLedgeDirs(rawAttr, cliffWall) : null;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      if (!CLIFF_TRIGGER_ATTRS.has(attr)) continue;

      let step: LedgeStep;
      if (indoorDirs && (HORIZ_LEDGE_ATTRS.has(attr) || VERT_LEDGE_ATTRS.has(attr))) {
        step = indoorDirs.get(row * GRID_SIZE + col)!;
        if (!hasPairedTrigger(indoorDirs, rawAttr, cliffWall, row, col, step)) continue;
      } else {
        const fixed = cliffDirs[attr];
        if (!fixed) continue;
        step = fixed;
      }
      const { dr, dc, dir } = step;

      if (!hasTwoWideBand(rawAttr, cliffWall, row, col, dr) && !isIndoors) continue;

      grid[row][col] = { type: 'ledge', dir };
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c) && cliffWall.has(rawAttr[r][c])) {
        grid[r][c] = { type: 'ledge', dir };
        r += dr;
        c += dc;
      }
      ledges.push({ startRow: row, startCol: col, endRow: r, endCol: c });
    }
  }
};

export { processStraightCliffs };
