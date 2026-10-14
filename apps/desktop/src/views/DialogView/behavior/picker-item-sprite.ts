/* @layer renderer-hud @kind logic */
import type { EquipmentState, InventoryState } from '@rotp/game-data';
import { BOTTLES, FIRST_BOTTLE, ITEM_SLOTS } from '../DialogView.constants';
import { bottleSprite } from './bottle-sprite';
import { equipmentSprite } from './equipment-sprite';
import { itemSlotSprite } from './item-slot-sprite';

const pickerItemSprite = (choice: number, inventory: InventoryState, equipment: EquipmentState): string | null => {
  if (choice < ITEM_SLOTS) return itemSlotSprite(choice, inventory);
  if (choice >= FIRST_BOTTLE && choice < FIRST_BOTTLE + BOTTLES) return bottleSprite(choice, inventory);
  return equipmentSprite(choice, equipment);
};

export { pickerItemSprite };
