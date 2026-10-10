/* @layer bridge-wasm @kind logic */
import type { getModule } from '@rotp/game-core';
import type { HeapReads } from './poll-heap-reads.type';

const buildHeapReads = (mod: NonNullable<ReturnType<typeof getModule>>): HeapReads | null => {
  const heap = mod.HEAPU8;
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []);
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []);
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []);
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []);
  if (!roomPtr) return null;
  let liveRoomId = -1;
  let liveFlags = 0;
  if (livePtr) {
    liveRoomId = (heap[livePtr] ?? 0) | ((heap[livePtr + 1] ?? 0) << 8);
    liveFlags = (heap[livePtr + 2] ?? 0) | ((heap[livePtr + 3] ?? 0) << 8);
  }
  return {
    roomWord: (roomId) => {
      const offset = roomPtr + roomId * 2;
      const flags = (heap[offset] ?? 0) | ((heap[offset + 1] ?? 0) << 8);
      return roomId === liveRoomId ? flags | liveFlags : flags;
    },
    owByte: (owScreen) => (owPtr ? heap[owPtr + owScreen] ?? 0 : 0),
    progByte: (bufferIndex) => (progPtr ? heap[progPtr + bufferIndex] ?? 0 : 0),
  };
};

export { buildHeapReads };
