/* @layer bridge-wasm @kind logic */
import type { getModule } from '@rotp/game-core';
import { liveRoomWordReader } from './live-room-word-reader';
import type { HeapReads } from './poll-heap-reads.type';

const buildHeapReads = (mod: NonNullable<ReturnType<typeof getModule>>): HeapReads | null => {
  const heap = mod.HEAPU8;
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []);
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []);
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []);
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []);
  if (!roomPtr) return null;
  return {
    roomWord: liveRoomWordReader(heap, roomPtr, livePtr),
    owByte: (owScreen) => (owPtr ? heap[owPtr + owScreen] ?? 0 : 0),
    progByte: (bufferIndex) => (progPtr ? heap[progPtr + bufferIndex] ?? 0 : 0),
  };
};

export { buildHeapReads };
