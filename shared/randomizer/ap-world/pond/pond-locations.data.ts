/* @layer shared-game @kind data */
/**
 * Each pond's prize slots, in the order that pond hands them over.
 *
 * Every slot is numbered from one, under the pond's own name
 * (pond-instances.data.ts): Hylia Fairy 1, Hylia Fairy 2, and on up. A pond
 * has no shelves and no sides, it asks a question and the player answers, and
 * a randomized pond hands over a pool item that has nothing to do with either
 * capacity family. A numbered ladder is what a pond actually is, so the
 * numbering runs the whole way.
 *
 * Two migration tables sit here, for the two spellings a stored placement can
 * carry. LEGACY_POND_RUNG_NAMES holds the rungs as they were spelled when
 * each pond was named after what it does (Capacity Upgrade Pond, Wishing
 * Pond, Cursed Pond). REFERENCE_POND_SLOT_NAMES maps each pond's Archipelago
 * pair onto its first two rungs, for a placement frozen while a custom pond
 * borrowed those two names for prizes 1 and 2.
 *
 * Why one queue per pond and not one per side: a pond charges BEFORE the
 * player picks which of its two grants to take (the price prompt is its own
 * dialogue, the choice comes after the fairy rises), so a per-side price
 * ladder cannot exist. The side choice still decides which family climbs when
 * a throw wins no prize.
 */
import { POND_INSTANCES, CAPACITY_POND } from './pond-instances.data';
import { POND_MAX_ITEMS } from './pond-ladder.data';
import type { PondId, PondInstance } from './pond-instance.type';

/** Prize 1 ... 20 of one pond, one name per rung of its ladder. */
const pondRungsOf = (pond: PondInstance): readonly string[] =>
  Array.from({ length: POND_MAX_ITEMS }, (_, index) => `${pond.label} ${index + 1}`);

const POND_RUNGS_BY_ID: Readonly<Record<PondId, readonly string[]>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pondRungsOf(pond)]),
) as Readonly<Record<PondId, readonly string[]>>;

/** The capacity pond's rungs: the only ones the world graph carries today. */
const POND_PRIZE_LOCATIONS: readonly string[] = POND_RUNGS_BY_ID.capacity;

/**
 * The prize slots the reference does not name: every pond's whole ladder, and
 * never present in the legacy mode, where a pond's locations are its two
 * vanilla slots instead.
 */
const POND_EXTRA_LOCATIONS: readonly string[] = POND_INSTANCES.flatMap((pond) => POND_RUNGS_BY_ID[pond.id]);

const POND_LOCATION_SET: ReadonlySet<string> = new Set(POND_EXTRA_LOCATIONS);

/** The stem each pond's rungs used to be numbered under. */
const LEGACY_RUNG_STEMS: Readonly<Record<PondId, string>> = {
  capacity: 'Capacity Upgrade Pond',
  wishing: 'Wishing Pond',
  cursed: 'Cursed Pond',
};

/** Every rung under its old stem, mapped to the rung it is now. */
const LEGACY_POND_RUNG_NAMES: ReadonlyMap<string, string> = new Map(
  POND_INSTANCES.flatMap((pond) => POND_RUNGS_BY_ID[pond.id].map(
    (rung, index) => [`${LEGACY_RUNG_STEMS[pond.id]} ${index + 1}`, rung] as [string, string],
  )),
);

/** One pond's Archipelago slot names, each mapped to the rung it is. */
const pondSlotRenamesOf = (pond: PondInstance): ReadonlyMap<string, string> =>
  new Map(pond.slots.map((slot, index) => [slot.location, POND_RUNGS_BY_ID[pond.id][index]]));

/** The Archipelago name for all six pond slots, each mapped to the rung it is. */
const REFERENCE_POND_SLOT_NAMES: ReadonlyMap<string, string> = new Map(
  POND_INSTANCES.flatMap((pond) => [...pondSlotRenamesOf(pond)]),
);

/** The capacity pond's pair, which is the one a stored placement can carry. */
const REFERENCE_CAPACITY_POND_SLOT_NAMES: ReadonlyMap<string, string> = pondSlotRenamesOf(CAPACITY_POND);

export {
  LEGACY_POND_RUNG_NAMES, POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS, POND_RUNGS_BY_ID,
  REFERENCE_CAPACITY_POND_SLOT_NAMES, REFERENCE_POND_SLOT_NAMES, pondRungsOf, pondSlotRenamesOf,
};
