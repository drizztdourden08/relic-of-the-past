/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import type { CollectionState } from '../collection-state.type';

const canBootsClipDw = (state: CollectionState): boolean =>
  state.has(ITEM.pegasusBoots) && state.has(ITEM.moonPearl);

export { canBootsClipDw };
