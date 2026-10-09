/* @layer bridge-wasm @kind logic */
import { readU8, readU16 } from '../wasm-call';
import type { RoomWalkBoundary } from './room-doors.type';

const decodeWalkBoundary = (heap: Uint8Array, o: number): RoomWalkBoundary => ({
  destRoom: readU16(heap, o),
  row: readU8(heap, o + 2),
  col: readU8(heap, o + 3),
});

export { decodeWalkBoundary };
