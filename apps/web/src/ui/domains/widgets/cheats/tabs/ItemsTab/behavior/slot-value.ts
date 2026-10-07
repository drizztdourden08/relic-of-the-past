/* @layer renderer-widgets @kind logic */
/** The raw byte a slot holds right now, read from the store's inventory and equipment. */
import { CheatSlot } from '@app/lib/game';

type EquipmentBytes = {
  sword: number; shield: number; armor: number;
  gloves: number; boots: number; flippers: number; moonPearl: number;
};

const EQUIPMENT_KEY: Record<number, keyof EquipmentBytes> = {
  [CheatSlot.Gloves]: 'gloves', [CheatSlot.Boots]: 'boots', [CheatSlot.Flippers]: 'flippers',
  [CheatSlot.MoonPearl]: 'moonPearl', [CheatSlot.Sword]: 'sword', [CheatSlot.Shield]: 'shield',
  [CheatSlot.Armor]: 'armor',
};

const slotValueOf = (slot: number, items: number[], equipment: EquipmentBytes): number => {
  if (slot < items.length) return items[slot] ?? 0;
  const key = EQUIPMENT_KEY[slot];
  return key ? equipment[key] : 0;
};

/** Armor always draws a mail, so it reads as owned at zero; every other slot is owned above zero. */
const isSlotOwned = (slot: number, value: number): boolean => value > 0 || slot === CheatSlot.Armor;

export { isSlotOwned, slotValueOf };
export type { EquipmentBytes };
