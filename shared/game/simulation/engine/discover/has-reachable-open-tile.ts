/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';
import type { Reached } from '../discover-reach/discover-reach.type';
import { CHEST_OPEN_ROW_OFFSET } from './discover.constants';

const hasReachableOpenTile = (reached: Reached, tile: GridPos): boolean => {
  if (!reached) return true;
  const openRow = tile.row + CHEST_OPEN_ROW_OFFSET;
  return reached[openRow]?.[tile.col] === true || reached[openRow]?.[tile.col + 1] === true;
};

export { hasReachableOpenTile };
