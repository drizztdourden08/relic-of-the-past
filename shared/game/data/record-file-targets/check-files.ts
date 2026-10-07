/* @layer shared-game @kind logic */
/**
 * Where a check is filed. A dungeon check lives with its dungeon, any other with its
 * screen's area, and an event by the number block its id sits in. A check with none of
 * those comes back unresolved, never guessed.
 */
import { findOne } from '../facade';
import type { CheckId, CheckKind, DungeonId, EventGroup, ScreenId } from '../types';
import { AREA_FOLDERS, worldFolder } from './layout';
import type { FileTarget } from './layout';
import { worldOfDungeon } from './screen-files';

/** The subset of a check record that decides where it lives. */
interface CheckHome {
  /** Absent for a record whose id has not been allocated yet. */
  id?: CheckId;
  screenId?: ScreenId;
  dungeonId?: DungeonId;
  kind?: CheckKind;
  eventGroup?: EventGroup;
}

/** The events' id range starts here, so a record's number is its id minus this. */
const EVENT_ID_BASE = 300;

/**
 * The blocks the events' own numbering is written in: the story and its statuses first, then
 * a block of ten per dungeon, then the world rows, then the overworld acts. Each file owns a
 * block, which is what makes a number enough to name the file.
 */
const EVENT_NUMBER_BLOCKS: readonly (readonly [number, number, string])[] = [
  [0, 59, 'story'],
  [200, 309, 'world'],
  [310, 399, 'acts'],
];

/**
 * A dungeon's stage events file with that dungeon. Every other event files by the block its
 * number sits in. A record with no number yet falls back to its group, and the groups that
 * span two blocks are refused instead of guessed.
 */
const eventRecordFile = (check: CheckHome): FileTarget => {
  const group = check.eventGroup;
  if (group === 'dungeon' && check.dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === check.dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${check.dungeonId}` };
    return { relativePath: `checks/events/dungeons/${dungeon.fileStem}.ts` };
  }
  const n = check.id === undefined ? undefined : Number(check.id.slice('check-'.length)) - EVENT_ID_BASE;
  const block = n === undefined ? undefined : EVENT_NUMBER_BLOCKS.find(([from, to]) => n >= from && n <= to);
  if (block) return { relativePath: `checks/events/${block[2]}.ts` };
  if (n !== undefined && n >= 0) {
    return { relativePath: null, unresolved: `no events file owns number ${n}` };
  }
  if (group === 'story' || group === 'status') return { relativePath: 'checks/events/story.ts' };
  return {
    relativePath: null,
    unresolved: 'an event with no number yet, in a group that spans two files, is filed by hand',
  };
};

const checkRecordFile = (check: CheckHome): FileTarget => {
  if (check.kind === 'event') return eventRecordFile(check);
  const dungeonId = check.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    return { relativePath: `checks/${worldOfDungeon(dungeon)}/${dungeon.fileStem}.ts` };
  }
  const screenId = check.screenId;
  if (!screenId) return { relativePath: null, unresolved: 'check names neither a dungeon nor a screen' };
  const screen = findOne('screen', s => s.id === screenId);
  if (!screen) return { relativePath: null, unresolved: `unknown screen ${screenId}` };
  const folder = AREA_FOLDERS[screen.areaId];
  if (!folder) return { relativePath: null, unresolved: `no area folder exists for ${screen.areaId}` };
  return { relativePath: `checks/${worldFolder(screen.world)}/overworld/${folder}.ts` };
};

export { checkRecordFile };
export type { CheckHome };
