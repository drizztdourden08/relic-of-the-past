/* @layer bridge-wasm @kind logic */
import { getItem } from '@rotp/game-data';
import { getModule } from '../../wasm-bridge';
import { log } from '../../../log-bus';
import { inventoryToItemSet, parseInventoryBuffer, setsEqual } from '../inventory';
import { pollRoomFlags } from './poll-room-flags';
import { trackerState } from './tracker-state';
import type { EmscriptenModule } from '../../types';

const readInventory = (heap: Uint8Array, ptr: number, force: boolean): void => {
  const newInventory = inventoryToItemSet(parseInventoryBuffer(heap, ptr));
  if (!force && setsEqual(trackerState.currentInventory, newInventory)) return;
  log.app(`[Tracker] Inventory changed: ${[...newInventory].map((id) => getItem(id).name).join(', ') || '(empty)'}`);
  trackerState.currentInventory = newInventory;
  for (const fn of trackerState.inventoryListeners) {
    try { fn(newInventory); } catch { continue; }
  }
};

const pollInventory = (mod: EmscriptenModule, heap: Uint8Array, force: boolean): boolean => {
  try {
    const ptr = mod.ccall('WasmGetInventoryState', 'number', [], []) as number;
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

  const heap: Uint8Array | undefined = mod.HEAPU8;
  if (!heap) return;

  if (!pollInventory(mod, heap, force)) return;

  try {
    pollRoomFlags(force);
  } catch {
    return;
  }
};

export { pollInventoryState };
