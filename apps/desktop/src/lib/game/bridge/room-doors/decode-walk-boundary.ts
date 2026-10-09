/* @layer bridge-wasm @kind logic */
import { readU16 } from '../wasm-call';
import type { RoomWalkBoundary } from './room-doors.type';

const decodeWalkBoundary = (heap: Uint8Array, o: number): RoomWalkBoundary => ({
  destRoom: readU16(heap, o),
  row: heap[o + 2],
  col: heap[o + 3],
});

export { decodeWalkBoundary };
