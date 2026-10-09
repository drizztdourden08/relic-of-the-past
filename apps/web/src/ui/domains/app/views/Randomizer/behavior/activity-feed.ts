/* @layer renderer-components @kind logic */
import type { LogRow } from '@ds/composites/LogPanel';
import type { LogEntry } from '../../../../../../lib/log-bus';
import { activityRowOf } from './activity-row';
import { formatTime } from './format-time';
import { isRoomEcho } from './is-room-echo';
import { AP_KIND, AP_TAG, NOTHING_HIDDEN } from './activity-feed.constants';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';
import type { ActivityItem } from './activity-feed.type';

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

const buildActivityRows = (
  entries: readonly LogEntry[], lines: readonly RoomMessage[], hidden: ReadonlySet<string> = NOTHING_HIDDEN,
): LogRow[] => {
  const own = entries
    .filter((entry) => !isRoomEcho(entry, lines))
    .map((entry) => ({ at: entry.timestamp, row: activityRowOf(entry) }));
  const room = lines.map((line) => ({ at: line.at, row: roomRowOf(line) }));
  const rows = mergeByTime(own, room).map((item) => item.row);
  return hidden.size > 0 ? rows.filter((row) => !hidden.has(row.kind)) : rows;
};

export { buildActivityRows };
