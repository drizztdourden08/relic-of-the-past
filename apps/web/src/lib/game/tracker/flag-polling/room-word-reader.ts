/* @layer bridge-wasm @kind logic */
import type { RoomWords } from './flag-polling.type';

const roomWordReader = (heap: Uint8Array, roomPtr: number, livePtr: number): RoomWords => {
  let liveRoomId = -1;
  let liveFlags = 0;
  if (livePtr) {
    liveRoomId = heap[livePtr] | (heap[livePtr + 1] << 8);
    liveFlags = heap[livePtr + 2] | (heap[livePtr + 3] << 8);
  }
  return {
    read: (roomId: number): number => {
      const offset = roomPtr + roomId * 2;
      const flags = heap[offset] | (heap[offset + 1] << 8);
      return roomId === liveRoomId ? flags | liveFlags : flags;
    },
  };
};

export { roomWordReader };
