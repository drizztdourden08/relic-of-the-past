/* @layer bridge-wasm @kind logic */
/**
 * Offline inventory read for one battery-save file: rebuilds the 34-byte
 * buffer WasmGetInventoryState fills (core/game-hooks/state_queries.c) from
 * the slot block, so the live and offline paths share one parser and agree
 * on what the player owns. Offsets are the vanilla variables.h addresses
 * minus the save-block base (0xF000). Keep in lockstep with the C buffer.
 */
import type { ItemId } from '@shared/game/data';
import { inventoryToItemSet, parseInventoryBuffer } from '../tracker';
import { slotBlockOffset } from './sram-slots';

/** Buffer index → byte offset inside one save-file block. */
const INVENTORY_OFFSETS: readonly number[] = [
  0x340, 0x341, 0x342, 0x343, 0x344, 0x345, 0x346, 0x347, // bow .. bombos
  0x348, 0x349, 0x34a, 0x34b, 0x34c, 0x34d, 0x34e, // ether .. book (0x34f is the bottle cursor)
  0x350, 0x351, 0x352, 0x353, 0x354, 0x355, 0x356, 0x357, // somaria .. moon pearl
  0x359, 0x35a, 0x35b, // sword, shield, armor
  0x35c, 0x35d, 0x35e, 0x35f, // bottles
  0x374, 0x37a, // pendants, crystals
  0x36b, 0x36c, // heart pieces, health capacity
];

/** The items owned in one battery-save slot, or null when the slot holds no valid game. */
const offlineInventory = (sram: Uint8Array, slot: number): Set<ItemId> | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  const buffer = Uint8Array.from(INVENTORY_OFFSETS, (offset) => sram[base + offset]);
  return inventoryToItemSet(parseInventoryBuffer(buffer, 0));
};

export { offlineInventory };
