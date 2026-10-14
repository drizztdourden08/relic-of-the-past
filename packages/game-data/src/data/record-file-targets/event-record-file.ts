/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import { EVENT_ID_BASE } from '../checks/event-id.constants';
import type { CheckHome, FileTarget } from './record-file-targets.type';
import { EVENT_NUMBER_BLOCKS } from './check-files.constants';

const dungeonEventFile = (dungeonId: string): FileTarget => {
  const dungeon = findOne('dungeon', d => d.id === dungeonId);
  if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
  return { relativePath: `checks/events/dungeons/${dungeon.fileStem}.ts` };
};

const numberedEventFile = (n: number): FileTarget | undefined => {
  const block = EVENT_NUMBER_BLOCKS.find(([from, to]) => n >= from && n <= to);
  if (block) return { relativePath: `checks/events/${block[2]}.ts` };
  if (n >= 0) return { relativePath: null, unresolved: `no events file owns number ${n}` };
  return undefined;
};

const eventRecordFile = (check: CheckHome): FileTarget => {
  const group = check.eventGroup;
  if (group === 'dungeon' && check.dungeonId) return dungeonEventFile(check.dungeonId);
  const n = check.id === undefined ? undefined : Number(check.id.slice('check-'.length)) - EVENT_ID_BASE;
  const numbered = n === undefined ? undefined : numberedEventFile(n);
  if (numbered) return numbered;
  if (group === 'story' || group === 'status') return { relativePath: 'checks/events/story.ts' };
  return {
    relativePath: null,
    unresolved: 'an event with no number yet, in a group that spans two files, is filed by hand',
  };
};

export { eventRecordFile };
