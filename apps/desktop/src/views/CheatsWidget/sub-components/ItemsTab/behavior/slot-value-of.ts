/* @layer renderer-widgets @kind logic */
import { EQUIPMENT_KEY } from '../ItemsTab.constants';
import type { EquipmentBytes } from '../ItemsTab.type';

const slotValueOf = (slot: number, items: number[], equipment: EquipmentBytes): number => {
  if (slot < items.length) return items[slot] ?? 0;
  const key = EQUIPMENT_KEY[slot];
  return key ? equipment[key] : 0;
};

export { slotValueOf };
