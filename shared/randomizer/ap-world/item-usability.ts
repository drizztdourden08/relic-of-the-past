/* @layer shared-game @kind logic */
/**
 * Whether an owned item can be USED under the world's capacity profile —
 * the one gate the collection state consults before answering has/hasAny.
 * A meter-consuming item (magic-items.data.ts) is usable only while the
 * meter family stands above its empty rung; every other item is always
 * usable. Under the reference profile the meter never stands on that rung,
 * so every reference rule reads exactly as the source wrote it.
 */
import { METER_CONSUMING_ITEMS } from './magic-items.data';
import { hasMeterCapacity } from './state-helpers-capacity';
import type { CollectionState } from './collection-state';

const isItemUsable = (state: CollectionState, itemName: string): boolean =>
  !METER_CONSUMING_ITEMS.has(itemName) || hasMeterCapacity(state);

export { isItemUsable };
