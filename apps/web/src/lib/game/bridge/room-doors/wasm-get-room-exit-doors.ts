/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { DIR_NAMES } from './room-doors.constants';
import type { RoomExitDoor } from './room-doors.type';

const wasmGetRoomExitDoors = (): RoomExitDoor[] =>
  decodeTable('WasmGetRoomExitDoors', { countBytes: 1, dataStart: 2, stride: 3, maxCount: 8 }, (heap, o) => ({
    col: heap[o + 0],
    row: heap[o + 1],
    direction: DIR_NAMES[heap[o + 2]] ?? 'south',
  }));

export { wasmGetRoomExitDoors };
