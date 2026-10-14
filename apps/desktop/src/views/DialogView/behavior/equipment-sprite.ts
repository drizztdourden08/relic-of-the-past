/* @layer renderer-hud @kind logic */
import type { EquipmentState } from '@rotp/game-data';
import { EQUIP_SPRITES } from '../../../composites/PauseEquipSlot';
import { EQUIPMENT_AT } from '../DialogView.constants';

const equipmentSprite = (choice: number, equipment: EquipmentState): string | null => {
  const field = EQUIPMENT_AT[choice];
  if (!field) return null;
  const level = equipment[field];
  return level > 0 ? EQUIP_SPRITES[field]?.[level] ?? null : null;
};

export { equipmentSprite };
