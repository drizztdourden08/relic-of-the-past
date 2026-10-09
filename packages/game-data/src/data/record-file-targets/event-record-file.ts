/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import { EVENT_ID_BASE } from '../checks/event-id.constants';
import type { CheckHome, FileTarget } from './record-file-targets.type';
import { EVENT_NUMBER_BLOCKS } from './check-files.constants';

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

export { eventRecordFile };
