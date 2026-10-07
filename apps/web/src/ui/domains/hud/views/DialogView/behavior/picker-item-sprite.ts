/* @layer renderer-hud @kind logic */
/**
 * The sprite of the item the throw picker has selected. The picker index walks the save block from
 * the Bow on: 0-19 are the item slots, 20-23 the Power Glove, Pegasus Boots, Flippers and Moon Pearl,
 * 25-27 the sword, shield and mail, and 28-31 the four bottles by their contents. Index 24 is a byte
 * the game never fills. Bombs hold a count, so any count shows the one bomb sprite.
 */
import type { EquipmentState, InventoryState } from '@shared/game/types/game-state';
import { getSlotSprite } from '../../../composites/PauseItemSlot';
import { EQUIP_SPRITES } from '../../../composites/PauseEquipSlot';

const ITEM_SLOTS = 20;
const BOMBS_SLOT = 3;
const BOTTLE_CONTENTS_SLOT = 15;
const FIRST_BOTTLE = 28;
const BOTTLES = 4;

const EQUIPMENT_AT: Record<number, keyof EquipmentState> = {
  20: 'gloves',
  21: 'boots',
  22: 'flippers',
  23: 'moonPearl',
  25: 'sword',
  26: 'shield',
  27: 'armor',
};

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
