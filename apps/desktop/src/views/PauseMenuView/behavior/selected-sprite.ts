/* @layer renderer-hud @kind logic */
import { getSlotSprite } from '../../../composites/PauseItemSlot';
import type { PauseMenuData } from '../../../hooks/hooks.type';

const selectedSpriteOf = (data: PauseMenuData, selectedSaveIdx: number, isBottleSelected: boolean, bottleSlot: number): string | null => {
  if (selectedSaveIdx < 0) return null;
  const value = isBottleSelected ? (data.bottles[bottleSlot - 1] ?? 0) : (data.items[selectedSaveIdx] ?? 0);
  return getSlotSprite(selectedSaveIdx, value);
};

export { selectedSpriteOf };
