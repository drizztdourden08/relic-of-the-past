/* @layer renderer-hud @kind logic */
import type { InventoryState } from '@rotp/game-data';
import { getSlotSprite } from '../../../composites/PauseItemSlot';
import { BOMBS_SLOT } from '../DialogView.constants';

const itemSlotSprite = (choice: number, inventory: InventoryState): string | null => {
  const value = inventory.items[choice] ?? 0;
  return getSlotSprite(choice, choice === BOMBS_SLOT && value > 0 ? 1 : value);
};

export { itemSlotSprite };
