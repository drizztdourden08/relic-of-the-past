/* @layer shared-game @kind logic */
import { MAGIC_ITEMS } from './pool-tables.constants';
import type { ItemKey } from '../item-ids';
import type { MeterPoolItems } from './pool.type';

const meterPoolItemsOf = (meterItems: readonly ItemKey[], meterSpotLocked: boolean): MeterPoolItems => {
  const [vanillaItem, padding] = MAGIC_ITEMS;
  const items = [...meterItems];
  if (meterSpotLocked && !items.includes(vanillaItem)) items.push(vanillaItem);
  const magicRow = items.slice(0, MAGIC_ITEMS.length);
  while (magicRow.length < MAGIC_ITEMS.length) magicRow.push(padding);
  return { magicRow, overflow: items.slice(MAGIC_ITEMS.length) };
};

export { meterPoolItemsOf };
