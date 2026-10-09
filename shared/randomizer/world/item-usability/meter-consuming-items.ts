/* @layer shared-game @kind logic */
import { find } from '@shared/game/data';
import type { ItemId } from '@shared/game/data/types/ids';

let meterItems: ReadonlySet<ItemId> | null = null;

const meterConsumingItems = (): ReadonlySet<ItemId> => {
  meterItems ??= new Set(find('item', (item) => item.spendsMeter === true).map((item) => item.id));
  return meterItems;
};

export { meterConsumingItems };
