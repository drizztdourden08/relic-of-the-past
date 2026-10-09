/* @layer shared-game @kind logic */
import { BOTTLE_ITEMS } from '../../item-groups';
import {
  ALWAYS_ITEMS, ARMOR_ITEMS, BASE_ITEMS, BOTTLE_COUNT, BOW_ITEMS, EXTRA_ITEMS,
  GLOVE_ITEMS, LEGACY_INSANITY_ITEMS, SHIELD_ITEMS, SWORD_ITEMS,
  TOTAL_ITEMS_TO_PLACE,
} from '../pool-tables.constants';
import type { ItemKey } from '../../item-ids';
import type { BottlePicker } from '../pool.type';

const baselinePoolOf = (pickBottle: BottlePicker, magicRow: readonly ItemKey[]): ItemKey[] => {
  const pool: ItemKey[] = [
    ...ALWAYS_ITEMS,
    ...GLOVE_ITEMS,
    ...LEGACY_INSANITY_ITEMS,
    ...BASE_ITEMS,
  ];
  for (let index = 0; index < BOTTLE_COUNT; index += 1) pool.push(pickBottle(BOTTLE_ITEMS));
  pool.push(...SHIELD_ITEMS, ...ARMOR_ITEMS, ...magicRow, ...BOW_ITEMS, ...SWORD_ITEMS, ...EXTRA_ITEMS);
  if (pool.length !== TOTAL_ITEMS_TO_PLACE) {
    throw new Error(`pool size ${pool.length} != ${TOTAL_ITEMS_TO_PLACE}`);
  }
  return pool;
};

export { baselinePoolOf };
