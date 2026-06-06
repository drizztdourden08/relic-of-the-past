/**
 * Tracker Bridge — connects WASM item/check notifications to the tracker.
 * Manages window.__onItemReceived callback and inventory state polling.
 * Polls room flags, overworld flags, and NPC progress flags for check completion.
 */

import { getModule } from '../wasm-bridge';
import { log } from '../../log-bus';
import { ITEM_ID_TO_NAME } from '@shared/game/items/id-map';
import { parseInventoryBuffer, inventoryToItemSet, progressToEvents, setsEqual } from './inventory';
import { readCompletedChecks } from './flag-polling';

// ─── Listener types ───

type ItemReceivedListener = (itemName: string, itemId: number, method: number) => void;
type InventoryChangedListener = (inventory: Set<string>) => void;
type UnknownItemEntry = { id: number; method: number; timestamp: number };
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

const onItemReceived = (fn: ItemReceivedListener): () => void => {
  itemListeners.add(fn);
  return () => itemListeners.delete(fn);
};

const onInventoryChanged = (fn: InventoryChangedListener): () => void => {
  inventoryListeners.add(fn);
  return () => inventoryListeners.delete(fn);
};

const getCurrentInventory = (): Set<string> => {
  return currentInventory;
};

const onUnknownItem = (fn: UnknownItemListener): () => void => {
  unknownItemListeners.add(fn);
  return () => unknownItemListeners.delete(fn);
};

const getUnknownItems = (): UnknownItemEntry[] => {
  return unknownItems;
};

const loadUnknownItems = (items: UnknownItemEntry[]): void => {
  unknownItems = items;
  for (const fn of unknownItemListeners) {
    try { fn(unknownItems); } catch { /* ignore */ }
  }
};

const onCompletedChecksChanged = (fn: CompletedChecksListener): () => void => {
  completedChecksListeners.add(fn);
  return () => completedChecksListeners.delete(fn);
};

const getCompletedChecks = (): Set<string> => {
  return currentCompletedChecks;
};

const pollRoomFlags = (force = false): void => {
  const mod = getModule();
  if (!mod) return;

  try {
    const newCompleted = readCompletedChecks(mod as any);
    if (!newCompleted) return;

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
};

const pollInventoryState = (force = false): void => {
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
};

const initTrackerBridge = (): void => {
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
    // Defer poll to next microtask — avoids re-entrant WASM calls
    // (this callback fires via EM_ASM while WasmCheatGiveItem is still on the WASM stack)
    queueMicrotask(() => pollInventoryState());
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
};

const destroyTrackerBridge = (): void => {
  if (pollIntervalId !== null) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  (window as any).__onItemReceived = null;
  currentInventory = new Set();
  currentCompletedChecks = new Set();
};

export {
  destroyTrackerBridge,
  getCompletedChecks,
  getCurrentInventory,
  getUnknownItems,
  initTrackerBridge,
  loadUnknownItems,
  onCompletedChecksChanged,
  onInventoryChanged,
  onItemReceived,
  onUnknownItem,
  pollInventoryState,
  pollRoomFlags
};
export type { UnknownItemEntry };
