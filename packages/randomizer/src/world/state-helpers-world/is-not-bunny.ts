/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import type { Region } from '../region.type';
import type { CollectionState } from '../collection-state.type';

const isNotBunny = (state: CollectionState, region: Region): boolean =>
  state.has(ITEM.moonPearl) || region.isLightWorld;

export { isNotBunny };
