/* @layer renderer-widgets @kind types */
import type { ConnectionRecord, ConnectionTag, ScreenId, ConnectionNavData } from '@rotp/game-data';
import type { RoomStairInfo } from '../../game';

interface ConnectionDraft {
  screenId: string;
  toScreenId: string;
  tags: readonly ConnectionTag[];
  nav?: ConnectionNavData;
}

interface ConnectionIssueInput {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
}

interface DetectedConnection {
  type: 'entrance' | 'stair' | 'edge' | 'hole';
  targetRoomOrScreen: number;
  toScreenId: ScreenId | null;
  isExit: boolean;
  label: string;
}

interface DetectionInput {
  detectedEntranceScreens: number[];
  detectedStairs: RoomStairInfo[];
  exitScreen: number | null;
  detectedFallHoleRooms: number[];
}

type ConnectionStatus = 'complete' | 'partial' | 'none';

interface ConnectionStatusResult {
  status: ConnectionStatus;
  missingCount: number;
  existingConnections: ConnectionRecord[];
  detectedConnections: DetectedConnection[];
  unmatched: DetectedConnection[];
}

interface PositionSpan {
  first: number;
  last: number;
}

export type {
  ConnectionDraft, ConnectionIssueInput, ConnectionStatus, ConnectionStatusResult, DetectedConnection, DetectionInput,
  PositionSpan,
};
