/* @layer renderer-hud @kind logic */
import type { PauseMenuData } from '../../../hooks/hooks.type';
import { BOTTLE_ITEM_SLOT } from '../PauseMenuView.constants';

const displayItemsOf = (data: PauseMenuData, bottleSlot: number): number[] => {
  const displayItems = [...data.items];
  if (bottleSlot > 0) {
    displayItems[BOTTLE_ITEM_SLOT] = data.bottles[bottleSlot - 1] ?? 0;
  }
  return displayItems;
};

export { displayItemsOf };
