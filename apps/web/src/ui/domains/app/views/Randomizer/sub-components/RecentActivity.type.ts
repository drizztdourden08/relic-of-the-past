/* @layer renderer-components @kind types */
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { RoomMessage } from '../../../../../../lib/game/randomizer-client';
import type { PanelPlacement } from '../Randomizer.type';

interface RecentActivityProps {
  placement: PanelPlacement;
  entries: LogEntry[];
  roomLines: readonly RoomMessage[];
  onOpenLog: () => void;
}

export type { RecentActivityProps };
