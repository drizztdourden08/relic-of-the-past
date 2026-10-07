/* @layer renderer-components @kind logic */
/**
 * The Run tab's short list of what happened last: the activity feed's own rows, kept to the
 * ones a player cares about. Checks found, items received and sent, the session starting and
 * stopping, the connection coming and going, the goal, deaths, warnings and errors stay; the
 * arm-time plan, the overrides, the receipt text, room chat, hints and plain info go to the
 * Logs tab. Newest first.
 */
import type { LogRow } from '@ds/composites/LogPanel';
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';
import { buildActivityRows, isRoomEcho } from './activity-feed';
import type { ActivityKind } from './randomizer-log-style';

const RECENT_LIMIT = 8;

const KEPT_KINDS: ReadonlySet<string> = new Set<ActivityKind>(['session', 'check', 'deliver', 'online', 'warn', 'error']);

/** An info line kept for what it says: an item received, a death, the goal. */
const KEPT_INFO = /Received:|DeathLink|goal/i;

/** The room's item sends and its players joining or leaving; a server line only when it is about a goal. */
const isKeptRoomLine = (line: RoomMessage): boolean =>
  line.kind === 'item' || line.kind === 'join' || (line.kind === 'server' && /goal/i.test(line.text));

const isKeptRow = (row: LogRow): boolean =>
  row.kind === 'ap' || KEPT_KINDS.has(row.kind) || (row.kind === 'info' && KEPT_INFO.test(row.message));

/** The last few rows that matter, newest first. */
const recentActivityOf = (entries: readonly LogEntry[], lines: readonly RoomMessage[]): LogRow[] => {
  // The echo test needs every room line: the room lines kept below stand for none of the dropped ones.
  const own = entries.filter((entry) => !isRoomEcho(entry, lines));
  const rows = buildActivityRows(own, lines.filter(isKeptRoomLine)).filter(isKeptRow);
  return rows.slice(-RECENT_LIMIT).reverse();
};

export { RECENT_LIMIT, recentActivityOf };
