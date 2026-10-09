/* @layer shared-game @kind constants */
import { CANONICAL_SLOTS } from '../../shops/shop-slot-facts';
import { RETRO_ARROW_PICKUPS } from '../retro-bow.data';

const ARROW_SLOT_INDEXES: readonly number[] = CANONICAL_SLOTS
  .filter((slot) => slot.vanillaItem !== undefined && RETRO_ARROW_PICKUPS.includes(slot.vanillaItem))
  .map((slot) => slot.canonicalIndex);

const RETRO_QUIVER_SLOT_INDEX: number = ARROW_SLOT_INDEXES[0];

export { ARROW_SLOT_INDEXES, RETRO_QUIVER_SLOT_INDEX };
