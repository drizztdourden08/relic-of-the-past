/**
 * Tracker Bridge — connects WASM item/check notifications to the tracker.
 * Manages window.__onItemReceived callback and inventory state polling.
 * Polls room flags, overworld flags, and NPC progress flags for check completion.
 */

import { getModule } from '../wasm-bridge';
import { log } from '../../log-bus';
import { ITEM_ID_TO_NAME } from '@shared/game/items/id-map';
import { parseInventoryBuffer, inventoryToItemSet, progressToEvents, setsEqual } from './inventory';
import { CHECK_ROOM_FLAGS, CHEST_OPEN_MASKS, DIRECT_ROOM_FLAGS } from '@shared/game/checks/flags/room';
import { CHECK_NPC_FLAGS } from '@shared/game/checks/flags/npc';
import { CHECK_OVERWORLD_FLAGS } from '@shared/game/checks/flags/overworld';
import { CHECK_EVENT_FLAGS } from '@shared/game/checks/flags/event';

// ─── Listener types ───

type ItemReceivedListener = (itemName: string, itemId: number, method: number) => void;
type InventoryChangedListener = (inventory: Set<string>) => void;
export type UnknownItemEntry = { id: number; method: number; timestamp: number };
type UnknownItemListener = (items: UnknownItemEntry[]) => void;
type CompletedChecksListener = (checks: Set<string>) => void;

// ─── Module state ───

const itemListeners = new Set<ItemReceivedListener>();
const inventoryListeners = new Set<InventoryChangedListener>();
const unknownItemListeners = new Set<UnknownItemListener>();
const completedChecksListeners = new Set<CompletedChecksListener>();
let currentInventory = new Set<string>();
let currentCompletedChecks = new Set<string>();
let unknownItems: UnknownItemEntry[] = [];
let pollIntervalId: ReturnType<typeof setInterval> | null = null;

// ─── Public API ───

export function onItemReceived(fn: ItemReceivedListener): () => void {
  itemListeners.add(fn);
  return () => itemListeners.delete(fn);
}

export function onInventoryChanged(fn: InventoryChangedListener): () => void {
  inventoryListeners.add(fn);
  return () => inventoryListeners.delete(fn);
}

export function getCurrentInventory(): Set<string> {
  return currentInventory;
}

export function onUnknownItem(fn: UnknownItemListener): () => void {
  unknownItemListeners.add(fn);
  return () => unknownItemListeners.delete(fn);
}

export function getUnknownItems(): UnknownItemEntry[] {
  return unknownItems;
}

export function loadUnknownItems(items: UnknownItemEntry[]): void {
  unknownItems = items;
  for (const fn of unknownItemListeners) {
    try { fn(unknownItems); } catch { /* ignore */ }
  }
}

export function onCompletedChecksChanged(fn: CompletedChecksListener): () => void {
  completedChecksListeners.add(fn);
  return () => completedChecksListeners.delete(fn);
}

export function getCompletedChecks(): Set<string> {
  return currentCompletedChecks;
}

/**
 * Poll WASM room flags (save_dung_info) to determine which chests are open.
 * Each room has a uint16; bits 8+ indicate individual chest-open states.
 */
export function pollRoomFlags(force = false): void {
  const mod = getModule();
  if (!mod) return;

  const heap = (mod as any).HEAPU8 as Uint8Array | undefined;
  if (!heap) return;

  try {
    const newCompleted = new Set<string>();

    // ── Chest-type checks via room flags (chestIndex → CHEST_OPEN_MASKS) ──
    const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
    // Get live room state (current room's unsaved flags)
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
        // save_dung_info is uint16[320], so each entry is 2 bytes (little-endian)
        const offset = roomPtr + roomId * 2;
        let flags = heap[offset] | (heap[offset + 1] << 8);
        // For the current room, OR in live flags that haven't been saved yet
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
        // For the current room, OR in live flags that haven't been saved yet
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

    if (force || !setsEqual(currentCompletedChecks, newCompleted)) {
      log.app(`[Tracker] Completed checks: ${newCompleted.size} (was ${currentCompletedChecks.size})`);
      currentCompletedChecks = newCompleted;
      for (const fn of completedChecksListeners) {
        try { fn(newCompleted); } catch { /* ignore */ }
      }
    }
  } catch {
    // Module may not be ready yet
  }
}

/**
 * Poll the WASM module for current inventory state and update the tracker.
 * When `force` is true, always notify listeners even if unchanged (e.g. after save state load).
 */
export function pollInventoryState(force = false): void {
  const mod = getModule();
  if (!mod) return;

  const heap = (mod as any).HEAPU8 as Uint8Array | undefined;
  if (!heap) return;

  try {
    const ptr = mod.ccall('WasmGetInventoryState', 'number', [], []) as number;
    if (!ptr) return;

    const raw = parseInventoryBuffer(heap, ptr);
    const newInventory = inventoryToItemSet(raw);

    // Merge progression events from progress flags
    try {
      const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
      if (progPtr) {
        for (const event of progressToEvents(heap, progPtr)) {
          newInventory.add(event);
        }
      }
      // Direct memory read: player_sleep_in_bed_state = g_ram[0x37C]
      // Derive g_ram base from WasmGetRoomFlags (save_dung_info = g_ram + 0xF000)
      const roomFlagsPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
      if (roomFlagsPtr) {
        const gramBase = roomFlagsPtr - 0xF000;
        const sleepState = heap[gramBase + 0x37C];
        if (sleepState >= 2) newInventory.add('Link Wakes Up');
      }
    } catch { /* module may not be ready */ }

    if (force || !setsEqual(currentInventory, newInventory)) {
      log.app(`[Tracker] Inventory changed: ${[...newInventory].join(', ') || '(empty)'}`);
      currentInventory = newInventory;
      for (const fn of inventoryListeners) {
        try { fn(newInventory); } catch { /* ignore */ }
      }
    }
  } catch {
    // Module may not be ready yet
  }

  // Always poll room flags alongside inventory (even if inventory read failed)
  try {
    pollRoomFlags(force);
  } catch {
    // Module may not be ready yet
  }
}

/**
 * Initialize the tracker bridge. Sets up the item received callback
 * and starts polling inventory state.
 */
export function initTrackerBridge(): void {
  log.app('Initializing tracker bridge');

  (window as any).__onItemReceived = (itemId: number, method: number) => {
    const itemName = ITEM_ID_TO_NAME[itemId];
    if (itemName) {
      log.app(`[Tracker] Item received: ${itemName} (0x${itemId.toString(16)}, method=${method})`);
      for (const fn of itemListeners) {
        try { fn(itemName, itemId, method); } catch { /* ignore */ }
      }
    } else {
      log.app(`[Tracker] Unknown item id 0x${itemId.toString(16)} (method=${method})`);
      const entry: UnknownItemEntry = { id: itemId, method, timestamp: Date.now() };
      unknownItems = [...unknownItems, entry];
      for (const fn of unknownItemListeners) {
        try { fn(unknownItems); } catch { /* ignore */ }
      }
    }
    // Poll inventory immediately after receiving an item
    pollInventoryState();
  };

  // Reset unknown items on fresh game start
  unknownItems = [];
  for (const fn of unknownItemListeners) {
    try { fn(unknownItems); } catch { /* ignore */ }
  }

  if (pollIntervalId !== null) clearInterval(pollIntervalId);
  pollIntervalId = setInterval(pollInventoryState, 2000);
  // Force-poll so tracker immediately reflects current game state
  pollInventoryState(true);
}

/**
 * Clean up the tracker bridge.
 * Only clears polling and window callback — listeners persist across
 * bridge re-initializations so components don't need to re-register.
 */
export function destroyTrackerBridge(): void {
  if (pollIntervalId !== null) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  (window as any).__onItemReceived = null;
  currentInventory = new Set();
  currentCompletedChecks = new Set();
}
