/* @layer bridge-wasm @kind logic */
import { wasmGetRoomDoorInfo } from '@rotp/game-core';
import type { SimDoorRaw } from '@rotp/game-core';
import { exitDoorAt, outerWall, OPPOSITE, ROOM_EDGE_ADJ } from '../../../simulator/room-doorways';
import { exitFromEdge } from '../../../simulator/exit-order';
import type { EdgeName } from '../../../simulator/exit-order';
import { WARP_DOOR } from './indoor-doors.constants';
import { positionOn } from './position-on';
import type { DoorwayCandidate } from './indoor-doors.type';

const isPassableFacingDoor = (door: SimDoorRaw, edge: EdgeName): boolean =>
  door.nativeType !== WARP_DOOR
  && (door.kind === 0 || door.isOpen)
  && door.direction === OPPOSITE[edge]
  && outerWall(door.direction, door.row, door.col);

const neighbourDoorways = (roomIndex: number): DoorwayCandidate[] => {
  const out: DoorwayCandidate[] = [];
  for (const edge of ['north', 'south', 'west', 'east'] as const) {
    const adj = ROOM_EDGE_ADJ[edge](roomIndex);
    if (adj === null) continue;
    for (const door of wasmGetRoomDoorInfo(adj) ?? []) {
      if (!isPassableFacingDoor(door, edge)) continue;
      const pos = positionOn(edge, door);
      const isNeighbourOverworldExit = exitDoorAt(adj, door.direction, pos);
      if (isNeighbourOverworldExit) continue;
      out.push({ edge, pos, tile: exitFromEdge(edge, pos), adj, nativeType: door.nativeType });
    }
  }
  return out;
};

export { neighbourDoorways };
