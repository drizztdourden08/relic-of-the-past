/* @layer bridge-wasm @kind logic */
/**
 * Flag Polling: reads WASM memory to determine which game checks are
 * completed. Pure computation: takes heap + pointers, returns a `Set<CheckId>`.
 *
 * Detection is driven by each `CheckRecord`'s own `gameId`, not by a
 * name-keyed table: this module only builds the live heap readers (with the
 * loaded room's live bits folded in) and hands them to the shared sweep
 * (completed-checks-core.ts), which the offline battery-save reader feeds
 * with file-backed readers of the same shape.
 */
import { buildPresenceState } from '@shared/game/simulation/presence/state';
import { isCheckPhysicallyArmed } from '../randomizer-client/override-fire-registry';
import { computeCompletedChecks } from './completed-checks-core';
import { computeEventStatus } from './event-status';
import { outOfBedCheckId } from './check-facts';
import type { CheckId, ItemId } from '@shared/game/data';

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

const readCompletedChecks = (mod: WasmModule, inventory: ReadonlySet<ItemId> | null = null): Set<CheckId> | null => {
  const heap = mod.HEAPU8;
  if (!heap) return null;

  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  // The event ledger, guarded: a core built before it has no export to call.
  let eventPtr = 0;
  try { eventPtr = mod.ccall('WasmGetEventBytes', 'number', [], []) as number; } catch { eventPtr = 0; }

  const words = roomPtr ? roomWordReader(heap, roomPtr, livePtr) : null;
  const newCompleted = computeCompletedChecks({
    readRoomWord: words ? words.read : null,
    readOwByte: owPtr ? (owScreen: number): number => heap[owPtr + owScreen] : null,
    readProgByte: progPtr ? (bufferIndex: number): number => heap[progPtr + bufferIndex] : null,
    readEventByte: eventPtr ? (byteIndex: number): number => heap[eventPtr + byteIndex] : null,
    inventory,
  }, isCheckPhysicallyArmed);

  // Direct read of the bed state, for the window before the progress buffer is
  // populated: save_dung_info sits at g_ram + 0xF000, so the base comes off it.
  if (roomPtr && heap[roomPtr - 0xf000 + 0x37c] >= 2) {
    const id = outOfBedCheckId();
    if (id) newCompleted.add(id);
  }

  return newCompleted;
};

/** How many progress bytes, overworld event bytes and room words the exports expose. */
const PROGRESS_BYTES = 32;
const OW_EVENT_BYTES = 0x82;
const ROOM_WORDS = 0x140;
const STORY_STATUS_BYTES = 4;

/** The live status of every reversible event, from the same pointers the sweep reads. */
const readEventStatus = (mod: WasmModule, inventory: ReadonlySet<ItemId>): Map<CheckId, boolean> | null => {
  const heap = mod.HEAPU8;
  if (!heap) return null;
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  if (!roomPtr || !owPtr || !progPtr) return null;
  const roomState = new Uint16Array(heap.buffer, heap.byteOffset + roomPtr, ROOM_WORDS);
  // The live status bytes, guarded like the ledger: a core built before them has no export.
  let statusPtr = 0;
  try { statusPtr = mod.ccall('WasmGetStoryStatusBytes', 'number', [], []) as number; } catch { statusPtr = 0; }
  const state = buildPresenceState({
    progress: heap.subarray(progPtr, progPtr + PROGRESS_BYTES),
    owEventInfo: heap.subarray(owPtr, owPtr + OW_EVENT_BYTES),
    roomState,
    inventory,
    ...(statusPtr ? { statusBytes: heap.subarray(statusPtr, statusPtr + STORY_STATUS_BYTES) } : {}),
  });
  return computeEventStatus(state);
};

export { readCompletedChecks, readEventStatus };
