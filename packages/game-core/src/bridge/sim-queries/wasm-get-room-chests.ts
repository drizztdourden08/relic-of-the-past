/* @layer bridge-wasm @kind logic */
import { readU8, decodeGatedTable } from '../wasm-call';
import { roomArg } from './room-arg';
import type { SimChestRaw } from './sim-queries.type';

const wasmGetRoomChests = (roomId: number): SimChestRaw[] | null =>
  decodeGatedTable('WasmGetRoomChests', { countBytes: 1, dataStart: 2, stride: 7, maxCount: 6 }, (heap, o) => ({
    chestIndex: readU8(heap, o + 0),
    isBig: heap[o + 1] !== 0,
    itemId: readU8(heap, o + 2),
    isOpen: heap[o + 3] !== 0,
    posKnown: heap[o + 4] !== 0,
    col: readU8(heap, o + 5),
    row: readU8(heap, o + 6),
  }), roomArg(roomId));

export { wasmGetRoomChests };
