/* @layer bridge-wasm @kind logic */
import { readU8, decodeGatedTable } from '../wasm-call';
import { roomArg } from './room-arg';
import { DIR_NAMES } from './sim-queries.constants';
import type { SimDoorRaw } from './sim-queries.type';

const wasmGetRoomDoorInfo = (roomId: number): SimDoorRaw[] | null =>
  decodeGatedTable('WasmGetRoomDoorInfo', { countBytes: 1, dataStart: 2, stride: 7, maxCount: 16 }, (heap, o) => ({
    direction: DIR_NAMES[readU8(heap, o + 0)] ?? 'north',
    col: readU8(heap, o + 1),
    row: readU8(heap, o + 2),
    kind: readU8(heap, o + 3),
    nativeType: readU8(heap, o + 4),
    isOpen: heap[o + 5] !== 0,
    layer: heap[o + 6] === 1 ? 1 : 0,
  }), roomArg(roomId));

export { wasmGetRoomDoorInfo };
