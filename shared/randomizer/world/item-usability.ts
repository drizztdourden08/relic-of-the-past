/* @layer shared-game @kind logic */
/**
 * Whether an owned item can be USED under the world's capacity profile,
 * the one gate the collection state consults before answering has/hasAny.
 * An item whose record says every use spends the meter (`ItemRecord.spendsMeter`)
 * is usable only while the meter family stands above its empty rung; every other
 * item is always usable. Under the reference profile the meter never stands on
 * that rung, so every reference rule reads exactly as the source wrote it.
 */
import { find } from '@shared/game/data';
import { hasMeterCapacity } from './state-helpers-capacity';
import type { ItemId } from '@shared/game/data/types/ids';
import type { CollectionState, Holding } from './collection-state';

/** Read once: the registry is seeded before any rule runs and never changes under one. */
let meterItems: ReadonlySet<ItemId> | null = null;

const meterConsumingItems = (): ReadonlySet<ItemId> => {
  meterItems ??= new Set(find('item', (item) => item.spendsMeter === true).map((item) => item.id));
  return meterItems;
};

const isItemUsable = (state: CollectionState, item: Holding): boolean =>
  !meterConsumingItems().has(item as ItemId) || hasMeterCapacity(state);

export { isItemUsable, meterConsumingItems };
