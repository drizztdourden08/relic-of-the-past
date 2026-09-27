/* @layer renderer-components @kind logic */
/**
 * The activity feed as one time-ordered list: the app's own log entries and
 * the Archipelago room's messages (chat, item sends, joins), each room line
 * tagged AP. Both inputs arrive oldest first, so a single merge pass keeps the
 * order; on a tie the app's own entry goes first.
 */
import type { LogRow } from '@ds/composites/LogPanel';
import type { LogEntry } from '../../../../../../lib/log-bus';
import { activityRowOf, formatTime } from './randomizer-log-style';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';

const AP_KIND = 'ap';
const AP_TAG = 'AP';

interface ActivityItem {
  at: number;
  row: LogRow;
}

const roomRowOf = (line: RoomMessage): LogRow => ({
  id: `ap-${line.id}`,
  gutter: formatTime(line.at),
  tag: AP_TAG,
  kind: AP_KIND,
  message: line.text,
});

const mergeByTime = (first: ActivityItem[], second: ActivityItem[]): ActivityItem[] => {
  const merged: ActivityItem[] = [];
  let i = 0;
  let j = 0;
  while (i < first.length && j < second.length) {
    merged.push(first[i].at <= second[j].at ? first[i++] : second[j++]);
  }
  return merged.concat(first.slice(i), second.slice(j));
};

/** The session logs each room message to the bus as well (online-messages.ts); the room row stands for it. */
const ROOM_ECHO_PREFIX = '[AP] ';

const isRoomEcho = (entry: LogEntry, lines: readonly RoomMessage[]): boolean =>
  lines.length > 0 && entry.message.startsWith(ROOM_ECHO_PREFIX);

/** Every row of the feed, oldest first, minus the kinds the viewer has hidden. */
const buildActivityRows = (
  entries: readonly LogEntry[], lines: readonly RoomMessage[], hidden: ReadonlySet<string>,
): LogRow[] => {
  const own = entries
    .filter((entry) => !isRoomEcho(entry, lines))
    .map((entry) => ({ at: entry.timestamp, row: activityRowOf(entry) }));
  const room = lines.map((line) => ({ at: line.at, row: roomRowOf(line) }));
  const rows = mergeByTime(own, room).map((item) => item.row);
  return hidden.size > 0 ? rows.filter((row) => !hidden.has(row.kind)) : rows;
};

export { buildActivityRows };
