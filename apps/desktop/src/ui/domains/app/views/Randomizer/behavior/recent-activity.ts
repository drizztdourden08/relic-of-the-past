/* @layer renderer-components @kind logic */
import type { LogRow } from '@drizztdourden08/tessera/composites';
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';
import { buildActivityRows } from './activity-feed';
import { isRoomEcho } from './is-room-echo';
import { KEPT_INFO, KEPT_KINDS, RECENT_LIMIT } from './recent-activity.constants';

const isKeptRoomLine = (line: RoomMessage): boolean =>
  line.kind === 'item' || line.kind === 'join' || (line.kind === 'server' && /goal/i.test(line.text));

const isKeptRow = (row: LogRow): boolean =>
  row.kind === 'ap' || KEPT_KINDS.has(row.kind) || (row.kind === 'info' && KEPT_INFO.test(row.message));

const recentActivityOf = (entries: readonly LogEntry[], lines: readonly RoomMessage[]): LogRow[] => {
  const ownWithoutEchoes = entries.filter((entry) => !isRoomEcho(entry, lines));
  const rows = buildActivityRows(ownWithoutEchoes, lines.filter(isKeptRoomLine)).filter(isKeptRow);
  return rows.slice(-RECENT_LIMIT).reverse();
};

export { recentActivityOf };
