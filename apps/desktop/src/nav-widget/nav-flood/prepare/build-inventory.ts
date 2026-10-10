/* @layer renderer-widgets @kind logic */
import { LIFT_BUSHES, LIFT_POWER_GLOVE, LIFT_TITANS_MITT } from '../nav-flood.constants';
import type { InventoryEquipment } from '../nav-flood.type';

const buildInventory = (equipment: InventoryEquipment, inventoryItems: ArrayLike<number>): string[] => {
  const items: string[] = [LIFT_BUSHES];
  if (equipment.gloves >= 1) items.push(LIFT_POWER_GLOVE);
  if (equipment.gloves >= 2) items.push(LIFT_TITANS_MITT);
  if (equipment.boots) items.push('boots');
  if (equipment.flippers) items.push('flippers');
  if ((inventoryItems[2] ?? 0) >= 1) items.push('hookshot');
  if ((inventoryItems[3] ?? 0) >= 1) items.push('bombs');
  if ((inventoryItems[11] ?? 0) >= 1) items.push('hammer');
  return items;
};

export { buildInventory };
