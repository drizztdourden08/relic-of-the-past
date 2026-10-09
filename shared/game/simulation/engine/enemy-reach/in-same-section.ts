/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { RoomSectionSplit } from '../../types';
import { SECTION_SPLIT_LINE } from './enemy-reach.constants';

const inSameSection = (tile: GridPos, split: RoomSectionSplit | undefined): boolean => {
  if (!split || (!split.splitX && !split.splitY)) return true;
  const spriteSectionX = split.splitX && tile.col >= SECTION_SPLIT_LINE ? 1 : 0;
  const spriteSectionY = split.splitY && tile.row >= SECTION_SPLIT_LINE ? 1 : 0;
  return spriteSectionX === split.playerSectionX && spriteSectionY === split.playerSectionY;
};

export { inSameSection };
