/* @layer renderer-hud @kind logic */
import type { InventoryState } from '@rotp/game-data';
import { getSlotSprite } from '../../../composites/PauseItemSlot';
import { BOTTLE_CONTENTS_SLOT, FIRST_BOTTLE } from '../DialogView.constants';

const bottleSprite = (choice: number, inventory: InventoryState): string | null =>
  getSlotSprite(BOTTLE_CONTENTS_SLOT, inventory.bottles[choice - FIRST_BOTTLE] ?? 0);

export { bottleSprite };
