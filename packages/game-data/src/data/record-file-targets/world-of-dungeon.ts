/* @layer shared-game @kind logic */
import { getScreen } from '../facade';
import type { DungeonRecord } from '../types';
import { worldFolder } from './world-folder';

const worldOfDungeon = (dungeon: Pick<DungeonRecord, 'roomScreenIds'>): string => {
  const [firstRoom] = dungeon.roomScreenIds;
  return worldFolder(firstRoom === undefined ? 'light' : getScreen(firstRoom).world);
};

export { worldOfDungeon };
