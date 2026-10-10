/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import { inventoryToItemSet } from '../tracker/inventory/inventory-to-item-set';
import { parseInventoryBuffer } from '../tracker/inventory/parse-inventory-buffer';
import { slotBlockOffset, INVENTORY_OFFSETS } from '@rotp/game-core';

const offlineInventory = (sram: Uint8Array, slot: number): Set<ItemId> | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  const buffer = Uint8Array.from(INVENTORY_OFFSETS, (offset) => sram[base + offset] ?? 0);
  return inventoryToItemSet(parseInventoryBuffer(buffer, 0));
};

export { offlineInventory };
