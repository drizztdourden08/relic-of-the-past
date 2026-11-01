/* @layer bridge-wasm @kind logic */
import { liveRoomWordReader } from '@rotp/randomizer';
import type { RoomWords } from './flag-polling.type';

const roomWordReader = (heap: Uint8Array, roomPtr: number, livePtr: number): RoomWords => ({
  read: liveRoomWordReader(heap, roomPtr, livePtr),
});

export { roomWordReader };
