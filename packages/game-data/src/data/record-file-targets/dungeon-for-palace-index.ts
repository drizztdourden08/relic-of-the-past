/* @layer shared-game @kind logic */
import { findOne, getScreen } from '../facade';
import type { DungeonRecord } from '../types';

const dungeonForPalaceIndex = (palaceIndex: number): DungeonRecord | undefined =>
  findOne('dungeon', d => d.gameId.palaceIndex === palaceIndex)
  ?? findOne('dungeon', d => d.roomScreenIds.some(id => getScreen(id).gameId.palaceIndex === palaceIndex));

export { dungeonForPalaceIndex };
