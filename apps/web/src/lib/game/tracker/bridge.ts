/* @layer bridge-wasm @kind logic */
/**
 * Connects WASM item/check notifications to the tracker.
 * Manages window.__onItemReceived callback and inventory state polling.
 * Polls room flags, overworld flags, and NPC progress flags for check completion.
 */

import { getModule } from '../wasm-bridge';
import { log } from '../../log-bus';
import { getItem, getItemByGameId } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import { parseInventoryBuffer, inventoryToItemSet, setsEqual } from './inventory';
import { readCompletedChecks } from './flag-polling';


/**
 * A delivered item, as its dataset id plus the native index the game reported.
 * The name is deliberately absent: a listener that wants to show one looks it up
 * from the id, so two consumers can never disagree about what an item is called.
 */
type ItemReceivedListener = (itemId: ItemId, nativeItemId: number, method: number) => void;
type InventoryChangedListener = (inventory: Set<ItemId>) => void;
type UnknownItemEntry = { id: number; method: number; timestamp: number };
type UnknownItemListener = (items: UnknownItemEntry[]) => void;
type CompletedChecksListener = (checks: Set<CheckId>) => void;


const itemListeners = new Set<ItemReceivedListener>();
const inventoryListeners = new Set<InventoryChangedListener>();
const unknownItemListeners = new Set<UnknownItemListener>();
const completedChecksListeners = new Set<CompletedChecksListener>();
let currentInventory = new Set<ItemId>();
let currentCompletedChecks = new Set<CheckId>();
let unknownItems: UnknownItemEntry[] = [];
let pollIntervalId: ReturnType<typeof setInterval> | null = null;


const onItemReceived = (fn: ItemReceivedListener): () => void => {
  itemListeners.add(fn);
  return () => itemListeners.delete(fn);
};

const onInventoryChanged = (fn: InventoryChangedListener): () => void => {
  inventoryListeners.add(fn);
  return () => inventoryListeners.delete(fn);
};

const getCurrentInventory = (): Set<ItemId> => {
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

const getCompletedChecks = (): Set<CheckId> => {
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
    // Progression events are CHECKS, not inventory: they arrive with the rest of
    // the completed set from the flag poll below, which reads the same progress
    // bytes this used to duplicate.
    const newInventory = inventoryToItemSet(raw);

    if (force || !setsEqual(currentInventory, newInventory)) {
      // Logged by name: a reader needs to recognise what the player picked up.
      log.app(`[Tracker] Inventory changed: ${[...newInventory].map((id) => getItem(id).randomizerName).join(', ') || '(empty)'}`);
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
    const item = getItemByGameId({ receiveItemId: itemId });
    if (item) {
      log.app(`[Tracker] Item received: ${item.id} ${item.randomizerName} (0x${itemId.toString(16)}, method=${method})`);
      for (const fn of itemListeners) {
        try { fn(item.id, itemId, method); } catch { /* ignore */ }
      }
    } else {
      log.app(`[Tracker] Unknown item id 0x${itemId.toString(16)} (method=${method})`);
      const entry: UnknownItemEntry = { id: itemId, method, timestamp: Date.now() };
      unknownItems = [...unknownItems, entry];
      for (const fn of unknownItemListeners) {
        try { fn(unknownItems); } catch { /* ignore */ }
      }
    }
    // Defer poll to next microtask to avoid re-entrant WASM calls
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
