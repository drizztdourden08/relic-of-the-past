/* @layer shared-game @kind logic */
import { CANONICAL_SLOTS } from '../../shops/shop-slot-facts';
import { RETRO_QUIVER_SLOT_INDEX } from './retro-shops.constants';
import type { RegionId } from '@shared/game/data/types/ids';

const retroQuiverRegions = (): readonly RegionId[] =>
  [CANONICAL_SLOTS[RETRO_QUIVER_SLOT_INDEX].region];

export { retroQuiverRegions };
