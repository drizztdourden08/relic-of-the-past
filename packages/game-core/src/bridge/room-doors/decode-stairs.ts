/* @layer bridge-wasm @kind logic */
import { readU8 } from '../wasm-call';
import { ROOM_BANK_MASK, STAIR_DOWN_BIT, STAIR_LAYER_BIT } from './room-doors.constants';
import type { RoomStairInfo } from './room-doors.type';

const stairDestInSameBank = (destByte: number, fromRoom: number): number => (fromRoom & ROOM_BANK_MASK) | destByte;

const decodeStairs = (heap: Uint8Array, o: number, fromRoom: number): RoomStairInfo => ({
  destRoom: stairDestInSameBank(readU8(heap, o + 0), fromRoom),
  row: readU8(heap, o + 1),
  col: readU8(heap, o + 2),
  direction: ((heap[o + 3] ?? 0) & STAIR_DOWN_BIT) !== 0 ? 'down' : 'up',
  layer: ((heap[o + 3] ?? 0) & STAIR_LAYER_BIT) as 0 | 1,
});

export { decodeStairs };
