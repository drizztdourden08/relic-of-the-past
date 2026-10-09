/* @layer renderer-hud @kind logic */
import { SLOT_SPRITES } from '../PauseItemSlot.constants';

const getSlotSprite = (saveSlotIndex: number, value: number): string | null => {
  if (value <= 0) return null;
  const slotMap = SLOT_SPRITES[saveSlotIndex];
  if (!slotMap) return null;
  return slotMap[value] ?? slotMap[1] ?? null;
};

export { getSlotSprite };
