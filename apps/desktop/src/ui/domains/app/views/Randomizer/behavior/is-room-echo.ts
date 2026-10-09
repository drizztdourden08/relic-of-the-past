/* @layer renderer-components @kind logic */
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';
import { ROOM_ECHO_PREFIX } from './activity-feed.constants';

const isRoomEcho = (entry: LogEntry, lines: readonly RoomMessage[]): boolean =>
  lines.length > 0 && entry.message.startsWith(ROOM_ECHO_PREFIX);

export { isRoomEcho };
