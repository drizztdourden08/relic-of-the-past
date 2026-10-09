/* @layer bridge-wasm @kind logic */
import type { getModule } from '../../wasm-bridge';
import type { HeapReads } from './poll-heap-reads.type';

const buildHeapReads = (mod: NonNullable<ReturnType<typeof getModule>>): HeapReads | null => {
  const heap = (mod as unknown as { HEAPU8?: Uint8Array }).HEAPU8;
  if (!heap) return null;
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  if (!roomPtr) return null;
  let liveRoomId = -1;
  let liveFlags = 0;
  if (livePtr) {
    liveRoomId = heap[livePtr] | (heap[livePtr + 1] << 8);
    liveFlags = heap[livePtr + 2] | (heap[livePtr + 3] << 8);
  }
  return {
    roomWord: (roomId) => {
      const offset = roomPtr + roomId * 2;
      const flags = heap[offset] | (heap[offset + 1] << 8);
      return roomId === liveRoomId ? flags | liveFlags : flags;
    },
    owByte: (owScreen) => (owPtr ? heap[owPtr + owScreen] : 0),
    progByte: (bufferIndex) => (progPtr ? heap[progPtr + bufferIndex] : 0),
  };
};

export { buildHeapReads };
