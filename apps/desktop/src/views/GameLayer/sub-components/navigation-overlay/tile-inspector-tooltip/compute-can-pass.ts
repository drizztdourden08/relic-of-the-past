/* @layer renderer-components @kind logic */
import { HAMMER_INVENTORY_SLOT, POWER_GLOVE_LEVEL, TITANS_MITT_LEVEL } from './tile-inspector-tooltip.constants';
import type { PassEquipment } from './tile-inspector-tooltip.type';

const computeCanPass = (
  req: string | null,
  equipment: PassEquipment,
  inventoryItems: ArrayLike<number>,
): boolean | null => {
  let canPass: boolean | null = null;
  if (req) {
    switch (req) {
      case 'lift.1': canPass = true; break;
      case 'lift.2': canPass = equipment.gloves >= POWER_GLOVE_LEVEL; break;
      case 'lift.3': canPass = equipment.gloves >= TITANS_MITT_LEVEL; break;
      case 'hammer': canPass = (inventoryItems[HAMMER_INVENTORY_SLOT] ?? 0) >= 1; break;
      case 'boots': canPass = Boolean(equipment.boots); break;
      case 'flippers': canPass = Boolean(equipment.flippers); break;
    }
  }
  return canPass;
};

export { computeCanPass };
