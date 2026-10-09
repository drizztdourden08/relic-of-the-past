/* @layer renderer-widgets @kind types */
import type { ConnectionRecord, ConnectionTag, ScreenId, ScreenRecord } from '@rotp/game-data';
import type { ConnectionNavData } from '@shared/game/navigation';
import type { RoomStairInfo } from '../../../../lib/game';

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

type ScreenDataStatus = 'mapped' | 'incomplete' | 'missing';

interface DataCorrection {
  field: string;
  message: string;
  suggestedValue: unknown;
}

interface ScreenDataStatusResult {
  status: ScreenDataStatus;
  screen: ScreenRecord | null;
  issues: string[];
  corrections: DataCorrection[];
}

type ConnectionStatus = 'complete' | 'partial' | 'none';

interface ConnectionStatusResult {
  status: ConnectionStatus;
  missingCount: number;
  existingConnections: ConnectionRecord[];
  detectedConnections: DetectedConnection[];
  unmatched: DetectedConnection[];
}

export type {
  ConnectionDraft, ConnectionIssueInput, ConnectionStatus, ConnectionStatusResult, DataCorrection, DetectedConnection, DetectionInput,
  ScreenDataStatus, ScreenDataStatusResult,
};
