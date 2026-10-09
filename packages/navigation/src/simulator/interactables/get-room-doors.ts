/* @layer bridge-wasm @kind logic */
import type { SimDoor } from '../../simulation';
import { wasmGetRoomDoorInfo, wasmGetRoomCellLocks } from '@rotp/game-core';
import { DOOR_DIRS, DOOR_KINDS } from './interactables.constants';

const getRoomDoors = (roomId: number): SimDoor[] => [
  ...(wasmGetRoomDoorInfo(roomId) ?? []).map((d, index) => ({
    roomId,
    index,
    tiles: [{ row: d.row, col: d.col }],
    direction: DOOR_DIRS[d.direction],
    kind: DOOR_KINDS[d.kind] ?? 'normal',
    opened: d.isOpen,
    nativeType: d.nativeType,
    layer: d.layer,
  })),
  ...(wasmGetRoomCellLocks(roomId) ?? []).map((l) => ({
    roomId,
    index: l.slot,
    tiles: [{ row: l.row, col: l.col }],
    direction: 'n' as const,
    kind: 'big-key' as const,
    opened: l.opened,
    cellLock: true,
  })),
];

export { getRoomDoors };
