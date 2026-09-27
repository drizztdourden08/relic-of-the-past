/* @layer shared-game @kind logic */
/**
 * How the engine names a location.
 *
 * A spot the unmodified game has is a check of the dataset, so it IS its record's id. That
 * covers all but two kinds of row, and both are spots a setting invents instead of places
 * the game holds:
 *
 *  - a shelf's RESTOCK. The depth option lets one shelf be bought several times, and only the
 *    first purchase is a spot the game has, so the restocks hang off the first one's id;
 *  - a pond RUNG above the pair. A pond sells a ladder as long as its setting asks for, and
 *    only the first two rungs are spots the game has, so a rung hangs off the pond's own id.
 *
 * A key like that is derived from the id that does own the row, never from a name, so a
 * relabel cannot reach it. What a row is CALLED is read back off the record when something is
 * displayed (display-names/location-display-name.ts), which is the only place a name is
 * wanted.
 */
import type { CheckId } from '@shared/game/data/types/ids';

/** A location with no record of its own: derived from the id that owns the row. */
type SlotKey = `slot-${string}`;

/** Every location of the world, under one type. */
type LocationKey = CheckId | SlotKey;

/** The Nth purchase from one shelf, past the first. |ordinal| counts from 2. */
const restockKey = (checkId: CheckId, ordinal: number): SlotKey => `slot-${checkId}-${ordinal}`;

/** Rung |rung| of one pond's ladder, counting from 1. */
const pondRungKey = (pondId: string, rung: number): SlotKey => `slot-pond-${pondId}-${rung}`;

/**
 * The capacity shop's own event: the one location no record answers for, because it stands
 * for no act of the player and the game writes no flag for it. It fires on reaching the
 * pond's room and only tells the solver that a vanilla counter family can be bought up from
 * there. Reported with step 10c; a record would make it an ordinary `CheckId`.
 */
const CAPACITY_SHOP_EVENT: SlotKey = 'slot-capacity-shop';

const isSlotKey = (key: string): key is SlotKey => key.startsWith('slot-');

export { CAPACITY_SHOP_EVENT, isSlotKey, pondRungKey, restockKey };
export type { LocationKey, SlotKey };
