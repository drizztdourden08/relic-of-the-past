/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import type { CollectionState } from '../collection-state.type';

const canLiftRocks = (state: CollectionState): boolean =>
  state.has(ITEM.powerGlove) || state.has(ITEM.titansMitts);

export { canLiftRocks };
