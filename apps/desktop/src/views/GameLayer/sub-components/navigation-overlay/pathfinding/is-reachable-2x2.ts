/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import { bodyCells } from './body-cells';
import { inGrid2x2 } from './in-grid-2x2';
import { REACH_BLOCKED } from './pathfinding.constants';

const isReachable2x2 = (row: number, col: number, reachable: ReachState[][]): boolean =>
  inGrid2x2(row, col) && bodyCells(reachable, row, col).every((cell) => cell !== REACH_BLOCKED);

export { isReachable2x2 };
