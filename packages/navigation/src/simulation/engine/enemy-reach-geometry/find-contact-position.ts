/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import { isStandable } from './is-standable';

const findContactPosition = (target: GridPos, reached: boolean[][] | undefined, radius: number): GridPos | undefined => {
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const pos = { row: target.row + dr, col: target.col + dc };
      if (isStandable(reached, pos)) return pos;
    }
  }
  return undefined;
};

export { findContactPosition };
