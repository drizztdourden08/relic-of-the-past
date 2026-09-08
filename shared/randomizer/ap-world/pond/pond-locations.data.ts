/* @layer shared-game @kind data */
/**
 * The pond's prize slots, in the order the pond hands them over.
 *
 * Every slot is numbered from one. The reference names its first two
 * "Capacity Upgrade Left" and "Capacity Upgrade Right", from its model of the
 * pond as a shop with two shelves, and this used to borrow those names for
 * prize 1 and prize 2. It described nothing: the pond has no shelves and no
 * sides, it asks a question and the player answers, and a randomized pond
 * hands over a pool item that has nothing to do with either capacity family.
 * A numbered ladder is what the pond actually is, so the numbering runs the
 * whole way and the two family names now belong to the two fairy slots that
 * really are per-family (capacity/capacity-spots.data.ts).
 *
 * REFERENCE_POND_SLOT_NAMES maps the old pair onto the first two rungs, for a
 * placement generated before this rename. Prize 3 and up are untouched: they
 * carried their own numbered name already, and it is the same number now.
 *
 * Why one queue and not one per side: the pond charges BEFORE the player
 * picks bombs or arrows (the price prompt is its own dialogue, the side
 * choice comes after the fairy rises), so a per-side price ladder cannot
 * exist. The side choice still decides which family climbs when a throw wins
 * no prize.
 */
import { POND_MAX_ITEMS } from './pond-ladder.data';

/** Prize 1 ... 20, one name per rung of the ladder. */
const POND_PRIZE_LOCATIONS: readonly string[] =
  Array.from({ length: POND_MAX_ITEMS }, (_, index) => `Capacity Upgrade Pond ${index + 1}`);

/**
 * The prize slots the reference does not name: all of them, and never present in the
 * legacy mode, where the pond's locations are the two fairy slots instead.
 */
const POND_EXTRA_LOCATIONS: readonly string[] = POND_PRIZE_LOCATIONS;

const POND_LOCATION_SET: ReadonlySet<string> = new Set(POND_PRIZE_LOCATIONS);

/** The reference's name for each of its two slots, mapped to the rung it is. */
const REFERENCE_POND_SLOT_NAMES: ReadonlyMap<string, string> = new Map([
  ['Capacity Upgrade Left', 'Capacity Upgrade Pond 1'],
  ['Capacity Upgrade Right', 'Capacity Upgrade Pond 2'],
]);

export {
  POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS, REFERENCE_POND_SLOT_NAMES,
};
