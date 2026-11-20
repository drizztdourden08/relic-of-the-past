/* @layer renderer-app @kind logic */
import type { InventorySlot as BrockSlot } from '@drizztdourden08/brock-randomizer';
import type { InventorySlot as RotpSlot } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';

const toInventorySlot = (slot: RotpSlot): BrockSlot => {
  const tiers = [...slot.trackerItemIds].reverse();
  return {
    id: tiers[0] ?? slot.sprite,
    get label() {
      return textOf(slot.displayName);
    },
    tiers,
  };
};

export { toInventorySlot };
