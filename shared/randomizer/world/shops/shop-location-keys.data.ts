/* @layer shared-game @kind data */
/**
 * The name every canonical shop slot's locations are keyed under, by canonical index.
 *
 * SHOP SLUG. The shop's real name in lowercase, its words joined by '-', parentheses
 * dropped: "Cave Shop (Lake Hylia)" is `cave-shop-lake-hylia`.
 *
 * SHELF SIDE. The side of the counter the slot stands on, as its check record places it. A
 * shop that sells from one spot only (the bomb counter) has no neighbour to be left or right
 * of, so it takes `center`.
 *
 * A location key is `<shop>-shelf_<side>-slot_<n>` (location-key.ts), where slot 1 is the
 * shelf's first stock and slot n its n-th purchase. The table is APPEND-ONLY with the
 * canonical order it is indexed by (shop-slot-facts.ts), and a key handed out never changes:
 * the Archipelago id tables and every stored placement name slots by it.
 */
import type { ShelfSide } from '../location-key';

interface ShopSlotKeyRow {
  shop: string;
  side: ShelfSide;
}

const row = (shop: string, side: ShelfSide): ShopSlotKeyRow => ({ shop, side });

/** Indexed by canonical slot index. */
const SHOP_SLOT_KEY_ROWS: readonly ShopSlotKeyRow[] = [
  row('cave-shop-dark-death-mountain', 'left'),
  row('cave-shop-dark-death-mountain', 'center'),
  row('cave-shop-dark-death-mountain', 'right'),
  row('red-shield-shop', 'left'),
  row('red-shield-shop', 'center'),
  row('red-shield-shop', 'right'),
  row('dark-lake-hylia-shop', 'left'),
  row('dark-lake-hylia-shop', 'center'),
  row('dark-lake-hylia-shop', 'right'),
  row('light-world-death-mountain-shop', 'left'),
  row('light-world-death-mountain-shop', 'center'),
  row('light-world-death-mountain-shop', 'right'),
  row('kakariko-shop', 'left'),
  row('kakariko-shop', 'center'),
  row('kakariko-shop', 'right'),
  row('cave-shop-lake-hylia', 'left'),
  row('cave-shop-lake-hylia', 'center'),
  row('cave-shop-lake-hylia', 'right'),
  row('dark-world-lumberjack-shop', 'left'),
  row('dark-world-lumberjack-shop', 'center'),
  row('dark-world-lumberjack-shop', 'right'),
  row('village-of-outcasts-shop', 'left'),
  row('village-of-outcasts-shop', 'center'),
  row('village-of-outcasts-shop', 'right'),
  row('dark-world-potion-shop', 'left'),
  row('dark-world-potion-shop', 'center'),
  row('dark-world-potion-shop', 'right'),
  row('potion-shop', 'left'),
  row('potion-shop', 'center'),
  row('potion-shop', 'right'),
  row('big-bomb-shop', 'center'),
];

export { SHOP_SLOT_KEY_ROWS };
export type { ShopSlotKeyRow };
