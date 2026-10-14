/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@rotp/navigation';

const isReachableAt = (reachable: number[][], r: number, c: number): boolean => (
  r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && reachable[r]?.[c] === 1
);

const touchesReachableTile = (reachable: number[][], r: number, c: number): boolean => {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (isReachableAt(reachable, r + dr, c + dc)) return true;
    }
  }
  return false;
};

export { touchesReachableTile };
