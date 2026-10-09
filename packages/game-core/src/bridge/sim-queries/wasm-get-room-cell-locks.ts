/* @layer bridge-wasm @kind logic */
import { readU8, decodeGatedTable } from '../wasm-call';
import { roomArg } from './room-arg';
import type { SimCellLock } from './sim-queries.type';

const wasmGetRoomCellLocks = (roomId: number): SimCellLock[] | null =>
  decodeGatedTable('WasmGetRoomCellLocks', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 6 }, (heap, o) => ({
    slot: readU8(heap, o + 0),
    row: readU8(heap, o + 1),
    col: readU8(heap, o + 2),
    opened: heap[o + 3] !== 0,
  }), roomArg(roomId));

export { wasmGetRoomCellLocks };
