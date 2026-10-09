/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { Reached } from '../discover-reach/discover-reach.type';

const isTileReachable = (reached: Reached, tile: GridPos): boolean =>
  !reached || reached[tile.row]?.[tile.col] === true;

export { isTileReachable };
