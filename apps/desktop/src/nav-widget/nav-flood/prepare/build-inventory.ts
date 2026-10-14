/* @layer renderer-widgets @kind logic */
import { LIFT_BUSHES } from '../nav-flood.constants';
import type { InventoryEquipment } from '../nav-flood.type';
import { EQUIPMENT_ITEMS, SLOT_ITEMS } from './build-inventory.constants';

const buildInventory = (equipment: InventoryEquipment, inventoryItems: ArrayLike<number>): string[] => [
  LIFT_BUSHES,
  ...EQUIPMENT_ITEMS.filter((rule) => rule.has(equipment)).map((rule) => rule.item),
  ...SLOT_ITEMS.filter((rule) => (inventoryItems[rule.slot] ?? 0) >= 1).map((rule) => rule.item),
];

export { buildInventory };
