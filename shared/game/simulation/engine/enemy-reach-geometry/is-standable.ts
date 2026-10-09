/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';

const isStandable = (reached: boolean[][] | undefined, tile: GridPos): boolean =>
  !!reached
  && reached[tile.row]?.[tile.col] === true
  && reached[tile.row]?.[tile.col + 1] === true
  && reached[tile.row + 1]?.[tile.col] === true
  && reached[tile.row + 1]?.[tile.col + 1] === true;

export { isStandable };
