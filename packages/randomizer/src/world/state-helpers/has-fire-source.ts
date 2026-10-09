/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import type { CollectionState } from '../collection-state.type';

const hasFireSource = (state: CollectionState): boolean =>
  state.has(ITEM.fireRod) || state.has(ITEM.lamp);

export { hasFireSource };
