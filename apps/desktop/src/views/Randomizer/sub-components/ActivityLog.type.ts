/* @layer renderer-components @kind types */
import type { LogEntry } from '../../../log-bus';
import type { RoomMessage } from '../../../game/randomizer-client';

interface ActivityLogProps {
  entries: LogEntry[];
  roomLines: readonly RoomMessage[];
}

export type { ActivityLogProps };
