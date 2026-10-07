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
import { readCompletedChecks, readEventStatus } from './flag-polling';
import { eventStatusEqual } from './event-status';
import { createListenerSet } from './listener-set';

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

const itemListeners = createListenerSet<Parameters<ItemReceivedListener>>();
const inventoryListeners = createListenerSet<Parameters<InventoryChangedListener>>();
const unknownItemListeners = createListenerSet<Parameters<UnknownItemListener>>();
const completedChecksListeners = createListenerSet<Parameters<CompletedChecksListener>>();
let currentInventory = new Set<ItemId>();
let currentCompletedChecks = new Set<CheckId>();
let unknownItems: UnknownItemEntry[] = [];
let pollIntervalId: ReturnType<typeof setInterval> | null = null;

const onItemReceived = (fn: ItemReceivedListener): () => void => itemListeners.add(fn);
const onInventoryChanged = (fn: InventoryChangedListener): () => void => inventoryListeners.add(fn);
const onUnknownItem = (fn: UnknownItemListener): () => void => unknownItemListeners.add(fn);
const onCompletedChecksChanged = (fn: CompletedChecksListener): () => void => completedChecksListeners.add(fn);

const getCurrentInventory = (): Set<ItemId> => currentInventory;
const getCompletedChecks = (): Set<CheckId> => currentCompletedChecks;
const getUnknownItems = (): UnknownItemEntry[] => unknownItems;

const loadUnknownItems = (items: UnknownItemEntry[]): void => {
  unknownItems = items;
  unknownItemListeners.notify(unknownItems);
};

/**
 * A widget in its own window has no core to poll: the main window sends it the
 * sets instead, and these feed them to the same listeners the poll feeds.
 */
const applyRelayedInventory = (ids: readonly ItemId[]): void => {
  currentInventory = new Set(ids);
  inventoryListeners.notify(currentInventory);
};

const applyRelayedCompletedChecks = (ids: readonly CheckId[]): void => {
  currentCompletedChecks = new Set(ids);
  completedChecksListeners.notify(currentCompletedChecks);
};

let currentEventStatus: Map<CheckId, boolean> = new Map();
const eventStatusListeners = createListenerSet<[ReadonlyMap<CheckId, boolean>]>();

const onEventStatusChanged = (fn: (status: ReadonlyMap<CheckId, boolean>) => void): () => void =>
  eventStatusListeners.add(fn);

const getEventStatus = (): ReadonlyMap<CheckId, boolean> => currentEventStatus;

/** The live side of the reversible events, polled beside the completed set. */
const pollEventStatus = (mod: Parameters<typeof readEventStatus>[0]): void => {
  const next = readEventStatus(mod, currentInventory);
  if (!next || eventStatusEqual(currentEventStatus, next)) return;
  currentEventStatus = next;
  eventStatusListeners.notify(next);
};

const pollRoomFlags = (force = false): void => {
  const mod = getModule();
  if (!mod) return;

  try {
    const newCompleted = readCompletedChecks(mod as any, currentInventory);
    if (!newCompleted) return;
    pollEventStatus(mod as any);

    if (force || !setsEqual(currentCompletedChecks, newCompleted)) {
      log.app(`[Tracker] Completed checks: ${newCompleted.size} (was ${currentCompletedChecks.size})`);
      currentCompletedChecks = newCompleted;
      completedChecksListeners.notify(newCompleted);
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
      log.app(`[Tracker] Inventory changed: ${[...newInventory].map((id) => getItem(id).name).join(', ') || '(empty)'}`);
      currentInventory = newInventory;
      inventoryListeners.notify(newInventory);
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
      log.app(`[Tracker] Item received: ${item.id} ${item.name} (0x${itemId.toString(16)}, method=${method})`);
      itemListeners.notify(item.id, itemId, method);
    } else {
      log.app(`[Tracker] Unknown item id 0x${itemId.toString(16)} (method=${method})`);
      const entry: UnknownItemEntry = { id: itemId, method, timestamp: Date.now() };
      unknownItems = [...unknownItems, entry];
      unknownItemListeners.notify(unknownItems);
    }
    // Defer poll to next microtask to avoid re-entrant WASM calls
    // (this callback fires via EM_ASM while WasmCheatGiveItem is still on the WASM stack)
    queueMicrotask(() => pollInventoryState());
  };

  // Reset unknown items on fresh game start
  unknownItems = [];
  unknownItemListeners.notify(unknownItems);

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
  applyRelayedCompletedChecks,
  applyRelayedInventory,
  destroyTrackerBridge,
  getCompletedChecks,
  getCurrentInventory,
  getEventStatus,
  onEventStatusChanged,
  getUnknownItems,
  initTrackerBridge,
  loadUnknownItems,
  onCompletedChecksChanged,
  onInventoryChanged,
  onItemReceived,
  onUnknownItem,
  pollInventoryState,
  pollRoomFlags,
};
export type { UnknownItemEntry };
