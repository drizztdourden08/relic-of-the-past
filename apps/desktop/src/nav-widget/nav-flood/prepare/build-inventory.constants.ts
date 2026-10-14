/* @layer renderer-widgets @kind constants */
import { LIFT_POWER_GLOVE, LIFT_TITANS_MITT } from '../nav-flood.constants';
import type { InventoryEquipment } from '../nav-flood.type';

const EQUIPMENT_ITEMS: ReadonlyArray<{ item: string; has: (equipment: InventoryEquipment) => boolean }> = [
  { item: LIFT_POWER_GLOVE, has: (equipment) => equipment.gloves >= 1 },
  { item: LIFT_TITANS_MITT, has: (equipment) => equipment.gloves >= 2 },
  { item: 'boots', has: (equipment) => Boolean(equipment.boots) },
  { item: 'flippers', has: (equipment) => Boolean(equipment.flippers) },
];

const SLOT_ITEMS: ReadonlyArray<{ slot: number; item: string }> = [
  { slot: 2, item: 'hookshot' },
  { slot: 3, item: 'bombs' },
  { slot: 11, item: 'hammer' },
];

export { EQUIPMENT_ITEMS, SLOT_ITEMS };
