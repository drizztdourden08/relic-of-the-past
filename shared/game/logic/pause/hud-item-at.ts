/* @layer shared-game @kind logic */
import { BOTTLE_COUNT, FIRST_BOTTLE_HUD_ITEM, ITEM_SLOT_COUNT } from './item-cells.constants';

const hudItemAt = (section: 'items' | 'bottles', cursor: number): number | null => {
  if (!Number.isInteger(cursor) || cursor < 0) return null;
  if (section === 'items') return cursor < ITEM_SLOT_COUNT ? cursor + 1 : null;
  return cursor < BOTTLE_COUNT ? FIRST_BOTTLE_HUD_ITEM + cursor : null;
};

export { hudItemAt };
