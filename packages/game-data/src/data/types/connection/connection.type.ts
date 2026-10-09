/* @layer shared-game @kind types */
import type { ActorId, ConnectionId, DungeonId, ScreenId, TagId } from '../ids';
import type { Requirement } from '../check';
import type { ConnectionNavData } from '../../../pathfinding/nav-data.types';
import type { ReviewMark } from '../review';
import type { ConnectionKind, ConnectionSide } from '../../enumeration/enumeration.generated.type';

interface ConnectionGameId {
  entranceId?: number;
  stairIndex?: number;
  exitId?: number;
  holeIndex?: number;
}

type ConnectionForm = 'border' | 'area';

interface ConnectionTile {
  x: number;
  y: number;
}

interface ConnectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ConnectionPlacement {
  form: ConnectionForm;
  side?: ConnectionSide;
  rect: ConnectionRect;
  tiles: readonly ConnectionTile[];
  layer?: 0 | 1;
}

interface ConnectionRecord {
  id: ConnectionId;
  screenId: ScreenId;
  toConnectionId: ConnectionId;
  kind: ConnectionKind;
  placement: ConnectionPlacement;
  canExit: boolean;
  gameId?: ConnectionGameId;
  dungeonId?: DungeonId;
  gatedBy?: ActorId;
  requirements?: Requirement;
  name?: string;
  tags: readonly TagId[];
  nav?: ConnectionNavData;
  review?: ReviewMark;
}

export type {
  ConnectionForm, ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTile,
};
