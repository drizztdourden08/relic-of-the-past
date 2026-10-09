/* @layer shared-game @kind logic */
import { REGION } from '../region-ids.constants';
import { meterUsesMultiplier } from '../state-helpers-capacity';
import { bottleCount } from './bottle-count';
import { MAGIC_UNITS_AT_FULL_COST } from './state-helpers.constants';
import type { CollectionState } from '../collection-state.type';

const canExtendMagic = (state: CollectionState, smallmagic = 16): boolean => {
  let basemagic = MAGIC_UNITS_AT_FULL_COST * meterUsesMultiplier(state);
  if (state.canReachRegion(REGION.potionSeller)) {
    basemagic += basemagic * bottleCount(state);
  }
  return basemagic >= smallmagic;
};

export { canExtendMagic };
