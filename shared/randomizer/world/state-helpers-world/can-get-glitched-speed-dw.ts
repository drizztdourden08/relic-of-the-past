/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { hasSword } from '../state-helpers';
import type { CollectionState } from '../collection-state.type';

const canGetGlitchedSpeedDw = (state: CollectionState): boolean =>
  state.has(ITEM.pegasusBoots)
  && (state.has(ITEM.hookshot) || hasSword(state))
  && state.has(ITEM.moonPearl);

export { canGetGlitchedSpeedDw };
