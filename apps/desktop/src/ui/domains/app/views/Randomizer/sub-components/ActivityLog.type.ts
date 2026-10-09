/* @layer renderer-components @kind types */
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';

interface ActivityLogProps {
  entries: LogEntry[];
  roomLines: readonly RoomMessage[];
}

export type { ActivityLogProps };
