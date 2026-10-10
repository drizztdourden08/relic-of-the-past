/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { bodyCells } from './body-cells';
import { inGrid2x2 } from './in-grid-2x2';
import { isTraversalDirCompatible } from './is-traversal-dir-compatible';
import { LEDGE_STATE_MIN, REACH_BLOCKED } from './pathfinding.constants';
import type { StepDir } from './pathfinding.type';

const isValidMove2x2 = (next: GridPos, dir: StepDir, reachable: ReachState[][]): boolean => {
  const [dr, dc] = dir;
  if (!inGrid2x2(next.row, next.col)) return false;
  return bodyCells(reachable, next.row, next.col).every((cell) =>
    cell === undefined || (cell !== REACH_BLOCKED && (cell < LEDGE_STATE_MIN || isTraversalDirCompatible(cell, dr, dc))));
};

export { isValidMove2x2 };
