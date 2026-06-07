/* @layer bridge-wasm @kind logic */
/**
 * Flag Polling — reads WASM memory to determine which game checks are completed.
 * Pure computation: takes heap + pointers, returns a set of completed check IDs.
 */

import { CHECK_ROOM_FLAGS, CHEST_OPEN_MASKS, DIRECT_ROOM_FLAGS } from '@shared/game/checks/flags/room';
import { CHECK_NPC_FLAGS } from '@shared/game/checks/flags/npc';
import { CHECK_OVERWORLD_FLAGS } from '@shared/game/checks/flags/overworld';
import { CHECK_EVENT_FLAGS } from '@shared/game/checks/flags/event';

interface WasmModule {
  ccall(name: string, returnType: string, argTypes: string[], args: unknown[]): unknown;
  HEAPU8?: Uint8Array;
}

const readCompletedChecks = (mod: WasmModule): Set<string> | null => {
  const heap = (mod as any).HEAPU8 as Uint8Array | undefined;
  if (!heap) return null;

  const newCompleted = new Set<string>();

  // ── Chest-type checks via room flags (chestIndex → CHEST_OPEN_MASKS) ──
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  let liveRoomId = -1;
  let liveFlags = 0;
  if (livePtr) {
    liveRoomId = heap[livePtr] | (heap[livePtr + 1] << 8);
    liveFlags = heap[livePtr + 2] | (heap[livePtr + 3] << 8);
  }
  if (roomPtr) {
    for (const checkId of Object.keys(CHECK_ROOM_FLAGS)) {
      const { roomId, chestIndex } = CHECK_ROOM_FLAGS[checkId];
      const offset = roomPtr + roomId * 2;
      let flags = heap[offset] | (heap[offset + 1] << 8);
      if (roomId === liveRoomId) flags |= liveFlags;
      const mask = CHEST_OPEN_MASKS[chestIndex];
      if (flags & mask) {
        newCompleted.add(checkId);
      }
    }

    // ── Direct-mask room flag checks (key drops, bosses, prizes, standing) ──
    for (const checkId of Object.keys(DIRECT_ROOM_FLAGS)) {
      const { roomId, mask } = DIRECT_ROOM_FLAGS[checkId];
      const offset = roomPtr + roomId * 2;
      let flags = heap[offset] | (heap[offset + 1] << 8);
      if (roomId === liveRoomId) flags |= liveFlags;
      if (flags & mask) {
        newCompleted.add(checkId);
      }
    }
  }

  // ── Overworld event flags (standing items, dig spots, events) ──
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  if (owPtr) {
    for (const checkId of Object.keys(CHECK_OVERWORLD_FLAGS)) {
      const { screen, mask } = CHECK_OVERWORLD_FLAGS[checkId];
      if (heap[owPtr + screen] & mask) {
        newCompleted.add(checkId);
      }
    }
  }

  // ── NPC-type checks via progress flags ──
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  if (progPtr) {
    for (const checkId of Object.keys(CHECK_NPC_FLAGS)) {
      const { bufferIndex, mask } = CHECK_NPC_FLAGS[checkId];
      if (heap[progPtr + bufferIndex] & mask) {
        newCompleted.add(checkId);
      }
    }

    // ── Event checks via progress flags (threshold/equality comparisons) ──
    for (const checkId of Object.keys(CHECK_EVENT_FLAGS)) {
      const entry = CHECK_EVENT_FLAGS[checkId];
      const val = heap[progPtr + entry.bufferIndex];
      let completed = false;
      if (entry.compare === 'gte') {
        completed = val >= (entry.value as number);
      } else if (entry.compare === 'eq') {
        completed = val === (entry.value as number);
      } else if (entry.compare === 'any-of') {
        completed = (entry.value as number[]).includes(val);
      }
      if (completed) newCompleted.add(checkId);
    }
    // Fallback: if progress_indicator >= 1, Link has definitely woken up
    if (heap[progPtr] >= 1) newCompleted.add('event-link-wakes-up');
    // Direct memory read fallback: player_sleep_in_bed_state >= 2
    const roomFlagsPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
    if (roomFlagsPtr) {
      const gramBase = roomFlagsPtr - 0xF000;
      if (heap[gramBase + 0x37C] >= 2) newCompleted.add('event-link-wakes-up');
    }
  }

  return newCompleted;
};

export { readCompletedChecks };
