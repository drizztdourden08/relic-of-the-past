/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { decodeWalkBoundary } from './decode-walk-boundary';
import type { RoomWalkBoundary } from './room-doors.type';

const wasmGetRoomWalkBoundariesFor = (roomId: number): RoomWalkBoundary[] =>
  decodeTable('WasmGetRoomWalkBoundariesFor', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, decodeWalkBoundary, { argTypes: ['number'], args: [roomId] });

export { wasmGetRoomWalkBoundariesFor };
