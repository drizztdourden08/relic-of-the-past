/* @layer bridge-wasm @kind logic */
/**
 * Flag Polling — reads WASM memory to determine which game checks are
 * completed. Pure computation: takes heap + pointers, returns a `Set<CheckId>`.
 *
 * Detection is driven by each `CheckRecord`'s own `gameId`, not by a
 * name-keyed table: every record in `all('check')` is tested against the
 * live heap using whichever of its own fields describe a detection mode
 * (chest slot, direct room mask, overworld mask, progress-buffer bit or
 * threshold) — see check-facts.ts. A record's id is its own identity from
 * the start, so nothing here ever resolves a name.
 */
import { all } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import { isOutOfBedFallbackMet, isOverworldFactMet, isProgressFactMet, isRoomFactMet, outOfBedCheckId } from './check-facts';

interface WasmModule {
  ccall(name: string, returnType: string, argTypes: string[], args: unknown[]): unknown;
  HEAPU8?: Uint8Array;
}

/** The room word, with the loaded room's live bits folded in. */
interface RoomWords {
  read: (roomId: number) => number;
}

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

const readCompletedChecks = (mod: WasmModule): Set<CheckId> | null => {
  const heap = mod.HEAPU8;
  if (!heap) return null;

  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;

  const words = roomPtr ? roomWordReader(heap, roomPtr, livePtr) : null;
  const readRoomWord = (roomId: number): number => (words ? words.read(roomId) : 0);
  const readOwByte = (owScreen: number): number => (owPtr ? heap[owPtr + owScreen] : 0);
  const readProgByte = (bufferIndex: number): number => (progPtr ? heap[progPtr + bufferIndex] : 0);

  const newCompleted = new Set<CheckId>();
  for (const check of all('check')) {
    const { gameId } = check;
    if (roomPtr && isRoomFactMet(gameId, readRoomWord)) {
      newCompleted.add(check.id);
    } else if (owPtr && isOverworldFactMet(gameId, readOwByte)) {
      newCompleted.add(check.id);
    } else if (progPtr && (isProgressFactMet(gameId, readProgByte) || isOutOfBedFallbackMet(gameId, readProgByte))) {
      newCompleted.add(check.id);
    }
  }

  // Direct read of the bed state, for the window before the progress buffer is
  // populated: save_dung_info sits at g_ram + 0xF000, so the base comes off it.
  if (roomPtr && heap[roomPtr - 0xf000 + 0x37c] >= 2) {
    const id = outOfBedCheckId();
    if (id) newCompleted.add(id);
  }

  return newCompleted;
};

export { readCompletedChecks };
