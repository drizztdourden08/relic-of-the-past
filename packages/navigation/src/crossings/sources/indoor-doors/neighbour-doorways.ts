/* @layer bridge-wasm @kind logic */
import { wasmGetRoomDoorInfo } from '@rotp/game-core';
import { exitDoorAt, outerWall, OPPOSITE, ROOM_EDGE_ADJ } from '../../../simulator/room-doorways';
import { exitFromEdge } from '../../../simulator/exit-order';
import { WARP_DOOR } from './indoor-doors.constants';
import { positionOn } from './position-on';
import type { DoorwayCandidate } from './indoor-doors.type';

const neighbourDoorways = (roomIndex: number): DoorwayCandidate[] => {
  const out: DoorwayCandidate[] = [];
  for (const edge of ['north', 'south', 'west', 'east'] as const) {
    const adj = ROOM_EDGE_ADJ[edge](roomIndex);
    if (adj === null) continue;
    for (const door of wasmGetRoomDoorInfo(adj) ?? []) {
      if (door.nativeType === WARP_DOOR) continue;
      if (!(door.kind === 0 || door.isOpen)) continue;
      if (door.direction !== OPPOSITE[edge]) continue;
      if (!outerWall(door.direction, door.row, door.col)) continue;
      const pos = positionOn(edge, door);
      const isNeighbourOverworldExit = exitDoorAt(adj, door.direction, pos);
      if (isNeighbourOverworldExit) continue;
      out.push({ edge, pos, tile: exitFromEdge(edge, pos), adj, nativeType: door.nativeType });
    }
  }
  return out;
};

export { neighbourDoorways };
