/* @layer bridge-wasm @kind logic */
import { buildPresenceState } from '@shared/game/simulation/presence/state';
import { computeEventStatus } from '../event-status';
import type { CheckId, ItemId } from '@rotp/game-data';
import { OW_EVENT_BYTES, PROGRESS_BYTES, ROOM_WORDS, STORY_STATUS_BYTES } from './flag-polling.constants';
import type { WasmModule } from './flag-polling.type';

const readEventStatus = (mod: WasmModule, inventory: ReadonlySet<ItemId>): Map<CheckId, boolean> | null => {
  const heap = mod.HEAPU8;
  if (!heap) return null;
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  if (!roomPtr || !owPtr || !progPtr) return null;
  const roomState = new Uint16Array(heap.buffer, heap.byteOffset + roomPtr, ROOM_WORDS);
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

export { readEventStatus };
