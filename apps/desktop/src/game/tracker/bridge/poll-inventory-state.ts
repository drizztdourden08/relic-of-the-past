/* @layer bridge-wasm @kind logic */
import { getItem } from '@rotp/game-data';
import { getModule } from '@rotp/game-core';
import { log } from '../../../log-bus';
import { inventoryToItemSet, parseInventoryBuffer, setsEqual, trackerState } from '@rotp/navigation';
import { heapOf } from './heap-of';
import { notifyListeners } from './notify-listeners';
import { pollRoomFlags } from './poll-room-flags';
import type { EmscriptenModule } from '@rotp/game-core';

const ignoreRoomFlagFailure = (): void => undefined;

const readInventory = (heap: Uint8Array, ptr: number, force: boolean): void => {
  const newInventory = inventoryToItemSet(parseInventoryBuffer(heap, ptr));
  if (!force && setsEqual(trackerState.currentInventory, newInventory)) return;
  log.app(`[Tracker] Inventory changed: ${[...newInventory].map((id) => getItem(id).name).join(', ') || '(empty)'}`);
  trackerState.currentInventory = newInventory;
  notifyListeners(trackerState.inventoryListeners, newInventory);
};

const pollInventory = (mod: EmscriptenModule, heap: Uint8Array, force: boolean): boolean => {
  try {
    const ptr = mod.ccall('WasmGetInventoryState', 'number', [], []);
    if (!ptr) return false;
    readInventory(heap, ptr, force);
  } catch {
    return true;
  }
  return true;
};

const pollInventoryState = (force = false): void => {
  const mod = getModule();
  if (!mod) return;

  const heap = heapOf(mod);
  if (!heap) return;

  if (!pollInventory(mod, heap, force)) return;

  try {
    pollRoomFlags(force);
  } catch {
    ignoreRoomFlagFailure();
  }
};

export { pollInventoryState };
