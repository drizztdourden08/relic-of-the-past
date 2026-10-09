/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';
import type { Reached } from './discover-reach.type';
import { SPRITE_TALK_RADIUS } from './discover-reach.constants';

const hasReachableNeighbor = (reached: Reached, tile: GridPos, radius: number = SPRITE_TALK_RADIUS): boolean => {
  if (!reached) return true;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (reached[tile.row + dr]?.[tile.col + dc] === true) return true;
    }
  }
  return false;
};

export { hasReachableNeighbor };
