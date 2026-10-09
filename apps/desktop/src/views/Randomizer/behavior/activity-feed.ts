/* @layer renderer-components @kind logic */
import type { LogRow } from '@drizztdourden08/tessera/composites';
import type { LogEntry } from '../../../log-bus';
import { activityRowOf } from './activity-row';
import { formatTime } from './format-time';
import { isRoomEcho } from './is-room-echo';
import { AP_KIND, AP_TAG } from './activity-feed.constants';
import type { RoomMessage } from '../../../game/randomizer-client';
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

const buildActivityRows = (entries: readonly LogEntry[], lines: readonly RoomMessage[]): LogRow[] => {
  const own = entries
    .filter((entry) => !isRoomEcho(entry, lines))
    .map((entry) => ({ at: entry.timestamp, row: activityRowOf(entry) }));
  const room = lines.map((line) => ({ at: line.at, row: roomRowOf(line) }));
  return mergeByTime(own, room).map((item) => item.row);
};

export { buildActivityRows };
