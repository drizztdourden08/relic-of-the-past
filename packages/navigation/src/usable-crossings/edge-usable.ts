/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, ScreenCrossing } from '@rotp/game-core';
import type { BlockedSpot, CrossingFilterScope } from './usable-crossings.type';
import type { EdgeName } from '../simulator/exit-order';
import { wasmGetExitScreenMap } from '@rotp/game-core';
import { doorwayLandingOpen, exitDoorAt, ROOM_EDGE_ADJ } from '../simulator/room-doorways';
import { usesCachedEntrance } from '../simulator/screen-resolve/uses-cached-entrance';
import { midOf } from './mid-of';
import { BLOCKED_SPREAD, MAX_DOORWAY_SPAN } from './usable-crossings.constants';

const isStandaloneInterior = (roomIndex: number): boolean =>
  usesCachedEntrance(roomIndex) || wasmGetExitScreenMap().has(roomIndex);

const isExitSpot = (roomIndex: number, blocked: BlockedSpot[], edge: EdgeName, pos: number): boolean =>
  blocked.some((spot) => spot.edge === edge && Math.abs(spot.pos - pos) <= BLOCKED_SPREAD)
  || exitDoorAt(roomIndex, edge, pos);

const indoorEdgeUsable = (
  connection: ConnectionInfo,
  roomIndex: number,
  blocked: BlockedSpot[],
): boolean => {
  if (connection.positions.length > MAX_DOORWAY_SPAN) return false;
  const adj = ROOM_EDGE_ADJ[connection.edge](roomIndex);
  if (adj === null) return false;
  if (isStandaloneInterior(roomIndex) && isStandaloneInterior(adj)) return false;
  const mid = midOf(connection.positions);
  if (isExitSpot(roomIndex, blocked, connection.edge, mid)) return false;
  return doorwayLandingOpen(adj, connection.edge, mid);
};

const edgeUsable = (
  crossing: ScreenCrossing,
  bundles: Map<string, ConnectionInfo>,
  scope: CrossingFilterScope,
  blocked: BlockedSpot[],
): boolean => {
  if (crossing.isIntraRoom) return false;
  const connection = bundles.get(crossing.id);
  if (!connection) return false;
  if (!scope.isIndoors) return connection.freeTileCount > 0;
  return indoorEdgeUsable(connection, scope.roomIndex, blocked);
};

export { edgeUsable };
