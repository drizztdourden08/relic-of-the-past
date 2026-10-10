/* @layer shared-game @kind logic */
import type { GridPos, ReachState } from '@rotp/game-core';
import { GRID_SIZE } from '../../types/grid.constants';
import { cellAt } from '../../../checked-access';

const collectHookTargets = (reachable: ReachState[][], hookSet: ReadonlySet<number>, rawAttrs: readonly number[][][]): GridPos[] => {
  const hookTargets: GridPos[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const isTarget = cellAt(reachable, r, c) !== 0 && rawAttrs.some((attrs) => hookSet.has(cellAt(attrs, r, c)));
      if (isTarget) hookTargets.push({ row: r, col: c });
    }
  }
  return hookTargets;
};

export { collectHookTargets };
