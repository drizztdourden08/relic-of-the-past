/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { decodeStairs } from './decode-stairs';
import type { RoomStairInfo } from './room-doors.type';

const wasmGetRoomStairInfoFor = (roomId: number): RoomStairInfo[] =>
  decodeTable('WasmGetRoomStairInfoFor', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 },
    (heap, o) => decodeStairs(heap, o, roomId), { argTypes: ['number'], args: [roomId] });

export { wasmGetRoomStairInfoFor };
