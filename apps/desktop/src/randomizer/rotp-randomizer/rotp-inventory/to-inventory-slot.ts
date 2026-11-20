/* @layer renderer-app @kind logic */
import type { InventorySlot as BrockSlot } from '@drizztdourden08/brock-randomizer';
import type { InventorySlot as RotpSlot } from '@rotp/game-data';
import { inventoryTextOf } from './inventory-text-of';
import { INVENTORY_SLOT_TEXT } from './rotp-inventory-text.constants';

const toInventorySlot = (slot: RotpSlot): BrockSlot => {
  const tiers = [...slot.trackerItemIds].reverse();
  return {
    id: tiers[0] ?? slot.sprite,
    get label() {
      return inventoryTextOf(INVENTORY_SLOT_TEXT, slot.displayName);
    },
    tiers,
  };
};

export { toInventorySlot };
