/* @layer shared-game @kind logic */
import { hasMeterCapacity } from '../state-helpers-capacity';
import { meterConsumingItems } from './meter-consuming-items';
import type { ItemId } from '@shared/game/data/types/ids';
import type { CollectionState, Holding } from '../collection-state.type';

const isItemUsable = (state: CollectionState, item: Holding): boolean =>
  !meterConsumingItems().has(item as ItemId) || hasMeterCapacity(state);

export { isItemUsable };
