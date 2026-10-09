/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import { inventoryToItemSet, parseInventoryBuffer } from '../tracker';
import { slotBlockOffset } from '@rotp/game-core';
import { INVENTORY_OFFSETS } from '@rotp/game-core';

const offlineInventory = (sram: Uint8Array, slot: number): Set<ItemId> | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  const buffer = Uint8Array.from(INVENTORY_OFFSETS, (offset) => sram[base + offset]);
  return inventoryToItemSet(parseInventoryBuffer(buffer, 0));
};

export { offlineInventory };
