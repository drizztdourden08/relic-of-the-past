/* @layer shared-game @kind logic */
import type { DungeonRecord } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { DUNGEON_FLOORS, SPLIT_BY_HALF } from './layout.constants';

const dungeonFloorFile = (dungeon: DungeonRecord, floor: number | undefined): FileTarget => {
  const stem = dungeon.fileStem;
  const halves = SPLIT_BY_HALF[stem];
  if (halves) {
    return {
      relativePath: null,
      unresolved: `${stem} files one floor in two halves (${halves.join(', ')}); name the file yourself`,
    };
  }
  const floors = DUNGEON_FLOORS[stem];
  if (!floors) return { relativePath: null, unresolved: `no floor layout is declared for ${stem}` };
  if (floor === undefined) return { relativePath: null, unresolved: 'the room names no floor' };
  const group = floors.find(([, set]) => set.includes(floor));
  if (!group) return { relativePath: null, unresolved: `${stem} files no floor ${floor}` };
  return { relativePath: `${stem}/${group[0]}` };
};

export { dungeonFloorFile };
