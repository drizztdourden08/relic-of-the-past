/* @layer shared-game @kind logic */
/**
 * How the engine names a location.
 *
 * A spot the unmodified game has is a check of the dataset, so it IS its record's id. Three
 * kinds of row are named another way:
 *
 *  - a SHOP purchase. Every purchase a shelf can sell is named after the shop, the shelf and
 *    the purchase: `kakariko-shop-shelf_left-slot_1` is the shelf's first stock and `slot_2`
 *    its first restock. The shelf's first stock still has a check record, and the key maps
 *    back to it (location-record.ts); the restocks, which the depth option adds, have none.
 *    The shop slugs and shelf sides are one table (shops/shop-location-keys.data.ts);
 *  - a pond RUNG above the pair. A pond sells a ladder as long as its setting asks for, and
 *    only the first two rungs are spots the game has, so a rung hangs off the pond's own id;
 *  - the capacity shop's event, below.
 *
 * A key is derived from data that owns the row, never from a display name, so a relabel
 * cannot reach it. What a row is CALLED is read back off the records when something is
 * displayed (display-names/location-display-name.ts), which is the only place a name is
 * wanted.
 */
import type { CheckId } from '@shared/game/data/types/ids';

/** A location with no record of its own: derived from the id that owns the row. */
type SlotKey = `slot-${string}`;

/** Which shelf of a shop a purchase comes off. */
type ShelfSide = 'left' | 'center' | 'right';

/** One purchase from one shelf: `<shop>-shelf_<side>-slot_<n>`, n counting from 1. */
type ShopLocationKey = `${string}-shelf_${ShelfSide}-slot_${number}`;

/** Every location of the world, under one type. */
type LocationKey = CheckId | SlotKey | ShopLocationKey;

/** Purchase |purchase| (1 is the first stock) of the |side| shelf of shop |shop|. */
const shopLocationKey = (shop: string, side: ShelfSide, purchase: number): ShopLocationKey =>
  `${shop}-shelf_${side}-slot_${purchase}`;

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

export { CAPACITY_SHOP_EVENT, isSlotKey, pondRungKey, shopLocationKey };
export type { LocationKey, ShelfSide, ShopLocationKey, SlotKey };
