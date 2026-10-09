/* @layer bridge-wasm @kind logic */
import { wasmGetRoomDoorInfo } from '../../../';
import { outerWall, ROOM_EDGE_ADJ } from '../../../simulator/room-doorways';
import { WARP_DOOR } from './indoor-doors.constants';
import { positionOn } from './position-on';
import type { DoorwayCandidate } from './indoor-doors.type';

const ownDoorways = (roomIndex: number): DoorwayCandidate[] => {
  const out: DoorwayCandidate[] = [];
  for (const door of wasmGetRoomDoorInfo(roomIndex) ?? []) {
    if (door.nativeType === WARP_DOOR) continue;
    if (!(door.kind === 0 || door.isOpen)) continue;
    if (!outerWall(door.direction, door.row, door.col)) continue;
    const adj = ROOM_EDGE_ADJ[door.direction](roomIndex);
    if (adj === null) continue;
    out.push({
      edge: door.direction, pos: positionOn(door.direction, door),
      tile: { row: door.row, col: door.col }, adj, nativeType: door.nativeType,
    });
  }
  return out;
};

export { ownDoorways };
