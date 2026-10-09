/* @layer renderer-hud @kind logic */
import type { EquipmentState, InventoryState } from '@rotp/game-data';
import { getSlotSprite } from '../../../composites/PauseItemSlot';
import { EQUIP_SPRITES } from '../../../composites/PauseEquipSlot';
import {
  BOMBS_SLOT, BOTTLE_CONTENTS_SLOT, BOTTLES, EQUIPMENT_AT, FIRST_BOTTLE, ITEM_SLOTS,
} from '../DialogView.constants';

const pickerItemSprite = (choice: number, inventory: InventoryState, equipment: EquipmentState): string | null => {
  if (choice < ITEM_SLOTS) {
    const value = inventory.items[choice] ?? 0;
    return getSlotSprite(choice, choice === BOMBS_SLOT && value > 0 ? 1 : value);
  }
  if (choice >= FIRST_BOTTLE && choice < FIRST_BOTTLE + BOTTLES) {
    return getSlotSprite(BOTTLE_CONTENTS_SLOT, inventory.bottles[choice - FIRST_BOTTLE] ?? 0);
  }
  const field = EQUIPMENT_AT[choice];
  if (!field) return null;
  const level = equipment[field];
  return level > 0 ? EQUIP_SPRITES[field]?.[level] ?? null : null;
};

export { pickerItemSprite };
