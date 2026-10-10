/* @layer renderer-hud @kind logic */
import { SLOT_RECORD_IDS } from '../PauseMenuView.constants';
import type { ItemNameKey } from '../PauseMenuView.type';

const itemNameKeyForSlot = (saveIdx: number, items: number[]): ItemNameKey | null => {
  const recordId = SLOT_RECORD_IDS[saveIdx];
  if (recordId === undefined) return null;
  const value = items[saveIdx];
  if (!value) return null;
  if (saveIdx === 0 && value >= 4) return { recordId: 'item-012', tier: 2 };
  if (saveIdx === 4 && value >= 2) return { recordId: 'item-014', tier: 1 };
  if (saveIdx === 12 && value >= 2) return { recordId: 'item-021', tier: 1 };
  return { recordId, tier: 1 };
};

export { itemNameKeyForSlot };
