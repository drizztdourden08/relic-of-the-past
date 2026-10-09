/* @layer shared-game @kind logic */
import { canAffordQuiverAndShots } from './can-afford-quiver-and-shots';
import { canReachQuiverShelf } from './can-reach-quiver-shelf';
import type { CollectionState } from '../../collection-state';
import type { RetroBowSetting } from '../retro.type';

const canBuyQuiver = (state: CollectionState, setting: RetroBowSetting): boolean =>
  canReachQuiverShelf(state) && canAffordQuiverAndShots(state, setting);

export { canBuyQuiver };
