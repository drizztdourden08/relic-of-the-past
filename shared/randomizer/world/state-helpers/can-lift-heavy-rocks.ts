/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import type { CollectionState } from '../collection-state.type';

const canLiftHeavyRocks = (state: CollectionState): boolean => state.has(ITEM.titansMitts);

export { canLiftHeavyRocks };
