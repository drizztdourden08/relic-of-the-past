/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { decodeWalkBoundary } from './decode-walk-boundary';
import type { RoomWalkBoundary } from './room-doors.type';

const wasmGetRoomWalkBoundaries = (): RoomWalkBoundary[] =>
  decodeTable('WasmGetRoomWalkBoundaries', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, decodeWalkBoundary);

export { wasmGetRoomWalkBoundaries };
