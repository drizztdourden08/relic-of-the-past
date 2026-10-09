/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { readMapState } from '../../simulator/read-game-state';
import { decodeStairs } from './decode-stairs';
import type { RoomStairInfo } from './room-doors.type';

const wasmGetRoomStairInfo = (): RoomStairInfo[] => {
  const here = readMapState()?.roomIndex ?? 0;
  return decodeTable('WasmGetRoomStairInfo', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 },
    (heap, o) => decodeStairs(heap, o, here));
};

export { wasmGetRoomStairInfo };
