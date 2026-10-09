/* @layer bridge-wasm @kind logic */
import { decodeGatedTable } from '../wasm-call';
import { roomArg } from './room-arg';
import type { SimCellLock } from './sim-queries.type';

const wasmGetRoomCellLocks = (roomId: number): SimCellLock[] | null =>
  decodeGatedTable('WasmGetRoomCellLocks', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 6 }, (heap, o) => ({
    slot: heap[o + 0],
    row: heap[o + 1],
    col: heap[o + 2],
    opened: heap[o + 3] !== 0,
  }), roomArg(roomId));

export { wasmGetRoomCellLocks };
