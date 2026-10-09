/* @layer bridge-wasm @kind logic */
import { ROOM_BANK_MASK, STAIR_DOWN_BIT, STAIR_LAYER_BIT } from './room-doors.constants';
import type { RoomStairInfo } from './room-doors.type';

const stairDestInSameBank = (destByte: number, fromRoom: number): number => (fromRoom & ROOM_BANK_MASK) | destByte;

const decodeStairs = (heap: Uint8Array, o: number, fromRoom: number): RoomStairInfo => ({
  destRoom: stairDestInSameBank(heap[o + 0], fromRoom),
  row: heap[o + 1],
  col: heap[o + 2],
  direction: (heap[o + 3] & STAIR_DOWN_BIT) !== 0 ? 'down' : 'up',
  layer: (heap[o + 3] & STAIR_LAYER_BIT) as 0 | 1,
});

export { decodeStairs };
