/* @layer shared-game @kind logic */
import type { DungeonRecord } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { worldOfDungeon } from './world-of-dungeon';

const dungeonRecordFile = (dungeon: Pick<DungeonRecord, 'fileStem' | 'roomScreenIds'>): FileTarget => {
  if (!dungeon.fileStem) return { relativePath: null, unresolved: 'the dungeon names no file stem' };
  return { relativePath: `dungeons/${worldOfDungeon(dungeon)}/${dungeon.fileStem}.ts` };
};

export { dungeonRecordFile };
