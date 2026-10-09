/* @layer shared-game @kind logic */
import { getScreen } from '../facade';
import type { DungeonRecord } from '../types';
import { worldFolder } from './world-folder';

const worldOfDungeon = (dungeon: Pick<DungeonRecord, 'roomScreenIds'>): string =>
  worldFolder(dungeon.roomScreenIds.length ? getScreen(dungeon.roomScreenIds[0]).world : 'light');

export { worldOfDungeon };
