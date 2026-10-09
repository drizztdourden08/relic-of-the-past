/* @layer shared-game @kind logic */
import type { GridPos, ReachState } from '@rotp/game-core';

const isReachable = (reach: ReachState[][], tile: GridPos): boolean =>
  (reach[tile.row]?.[tile.col] ?? 0) > 0;

export { isReachable };
