/* @layer bridge-wasm @kind logic */
import { wasmGetRoomLayoutInfo } from '@rotp/game-core';
import { floodOneScreen } from '../../flood/flood-area/flood-one-screen';
import { roomEntrances } from '../../flood/room-entrances/room-entrances';
import type { GridPos } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import { readMapState } from '@rotp/game-core';
import type { RoomFloodRun } from './flood-room.type';

const liveIntraEdges = (roomId: number) => {
  const live = readMapState();
  return live?.isIndoors && live.roomIndex === roomId ? (wasmGetRoomLayoutInfo()?.intraEdges ?? []) : [];
};

const floodRoomRun = (roomId: number, items: TileReq[], startPos?: GridPos): RoomFloodRun | null => {
  const entrances = roomEntrances(roomId);
  const intraEdges = liveIntraEdges(roomId);
  const runFrom = (from?: GridPos) => floodOneScreen(
    { isIndoors: true, roomId, owScreenIndex: 0 },
    { items, ...(from ? { startPos: from } : {}), entrances, intraEdges },
  );
  const seeded = runFrom(startPos);
  if (!seeded) return null;
  const spawnOutsideFloor = startPos && seeded.result.reachableCount === 0;
  const run = spawnOutsideFloor ? runFrom(undefined) ?? seeded : seeded;
  return { result: run.result, connections: run.connections, entrances };
};

export { floodRoomRun };
