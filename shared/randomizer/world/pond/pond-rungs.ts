/* @layer shared-game @kind logic */
/**
 * Each pond's prize slots, in the order that pond hands them over.
 *
 * Every slot is a rung numbered from one. Only the first two rungs are spots the unmodified
 * game has, so those two are the pond's own check records and every rung above them hangs off
 * the pond's id (location-key.ts).
 *
 * A WISH pond's own pair IS rungs 1 and 2 of its ladder, so those two keys mean her grant while
 * she keeps her native economy and prize 1 or 2 once she sells a ladder. The capacity pond
 * answers in two NAMED ladders instead, so its pair sits outside the plain numbered series and
 * every one of its rungs is a slot key.
 *
 * Why one queue per pond and not one per side: a pond charges BEFORE the player picks which
 * of its two grants to take (the price prompt is its own dialogue, the choice comes after the
 * fairy rises), so a per-side price ladder cannot exist. The side choice still decides which
 * family climbs when a throw wins no prize.
 */
import { POND_INSTANCES } from './pond-instances';
import { POND_MAX_ITEMS } from './pond-ladder.data';
import { pondRungKey } from '../location-key';
import type { LocationKey } from '../location-key';
import type { PondId, PondInstance } from './pond-instance.type';

/** The pond's own check for rung |rung|, when that rung is a spot the game has. */
const recordedRung = (pond: PondInstance, rung: number): LocationKey | undefined =>
  pond.slots.find((slot) => slot.ladder === undefined && slot.rung === rung)?.key;

/** Rung 1 ... 20 of one pond, as keys. */
const pondRungsOf = (pond: PondInstance): readonly LocationKey[] =>
  Array.from({ length: POND_MAX_ITEMS }, (_unused, index) =>
    recordedRung(pond, index + 1) ?? pondRungKey(pond.id, index + 1));

const POND_RUNGS_BY_ID: Readonly<Record<PondId, readonly LocationKey[]>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pondRungsOf(pond)]),
) as Readonly<Record<PondId, readonly LocationKey[]>>;

/** The capacity pond's rungs: the only ones the world graph carries today. */
const POND_PRIZE_LOCATIONS: readonly LocationKey[] = POND_RUNGS_BY_ID.capacity;

/** Every pond's whole ladder, prize rungs and a wish pond's own pair alike. */
const POND_EXTRA_LOCATIONS: readonly LocationKey[] = POND_INSTANCES
  .flatMap((pond) => POND_RUNGS_BY_ID[pond.id]);

const POND_LOCATION_SET: ReadonlySet<LocationKey> = new Set(POND_EXTRA_LOCATIONS);

export {
  POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS, POND_RUNGS_BY_ID, pondRungsOf,
};
