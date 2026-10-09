/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import { canUseBombs } from '../state-helpers';
import { isNotBunny } from './is-not-bunny';
import type { Region } from '../region.type';
import type { CollectionState } from '../collection-state.type';

const canBombClip = (state: CollectionState, region: Region): boolean =>
  canUseBombs(state) && isNotBunny(state, region) && state.has(ITEM.pegasusBoots);

export { canBombClip };
