/* @layer shared-game @kind logic */
import { retroQuiverRegions } from '../retro-shops';
import type { CollectionState } from '../../collection-state';

const canReachQuiverShelf = (state: CollectionState): boolean =>
  retroQuiverRegions().some((region) => state.canReachRegion(region));

export { canReachQuiverShelf };
