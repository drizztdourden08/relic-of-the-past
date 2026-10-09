/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { DIR_NAMES } from './room-doors.constants';
import type { DoorBoundaryTile } from './room-doors.type';

const wasmGetRoomDoorBoundaryTiles = (): DoorBoundaryTile[] =>
  decodeTable('WasmGetRoomDoorBoundaryTiles', { countBytes: 1, dataStart: 2, stride: 5, maxCount: 16 }, (heap, o) => ({
    direction: DIR_NAMES[heap[o]] ?? 'north',
    col: heap[o + 1],
    row: heap[o + 2],
    doorType: heap[o + 3],
    isOpen: heap[o + 4] !== 0,
  }));

export { wasmGetRoomDoorBoundaryTiles };
