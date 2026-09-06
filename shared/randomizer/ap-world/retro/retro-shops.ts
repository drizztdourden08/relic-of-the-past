/* @layer shared-game @kind logic */
/**
 * The shelf retro takes over: the one the QUIVER is sold from, and what it
 * sells once the quiver is owned.
 *
 * The quiver is the one purchase retro keeps, and it is not ammunition: the
 * reference locks a single-arrow buy into a shelf at 80, pushes the same buy
 * into five more shops, skips it in every shop once it has been bought (Rom.py
 * 1451) and then asks for it beside the bow in its own reachability rule
 * (StateHelpers.py can_shoot_arrows). Bought once, it is what lets the bow
 * fire at all; every shot after it is paid for in rupees as it is fired.
 *
 * WHICH shelf is read from the shop dataset rather than named here, so a shop
 * added there brings its slot with it: every shelf that sold arrows in the
 * unmodified game is an arrow shelf, and the FIRST of them in canonical order
 * is the quiver's. In the unmodified game there is exactly one, the right
 * shelf of the shop that sells the rare shield, which is also the shelf the
 * reference locks its own purchase onto (Shops.py set_up_shops).
 *
 * TWO WAYS TO HAND IT OVER, by the profile's shop mode:
 *  - shops VANILLA: nothing is shuffled, so the quiver stays locked to its
 *    shelf and the stock is changed in the running game instead
 *    (core/game-hooks/retro_shelf.c): the shelf sells the quiver until it is
 *    owned and a refill after, at its own vanilla price.
 *  - shops SHUFFLED (sequential, random, custom): the quiver is a POOL item
 *    like any other, so the fill may put it anywhere it can reach, and the
 *    shelf it came from opens as an ordinary shuffled slot carrying whatever
 *    the fill gave it. The arrow shelves are opened whatever the mode drew,
 *    because under retro no shop may still be selling arrows.
 */
import { CANONICAL_SLOTS } from '../shops/shop-slots';
import { normalizeEnabled, openedSlotIndicesOf } from '../shops/shop-scope';
import { RETRO_ARROW_PICKUPS, RETRO_QUIVER_PRICE } from './retro-bow.data';
import { RETRO_REFILL_ITEM } from './retro-shelf.data';
import type { CanonicalShopSlot } from '../shops/shop-slots';
import type { ShopScope } from '../shops/shop-scope.type';
import type { RetroBowSetting } from './retro.type';

/** Canonical indices of every slot the unmodified game sells arrows from. */
const ARROW_SLOT_INDEXES: readonly number[] = CANONICAL_SLOTS
  .filter((canonical) => RETRO_ARROW_PICKUPS.includes(canonical.slot.vanillaItem))
  .map((canonical) => canonical.canonicalIndex);

/** The shelf the quiver belongs to: the first of them in canonical order. */
const RETRO_QUIVER_SLOT_INDEX: number = ARROW_SLOT_INDEXES[0];

/** Whether the shops are shuffled at all; vanilla changes stock in place instead. */
const shopsShuffled = (scope: ShopScope): boolean => scope.mode !== 'vanilla';

/**
 * Whether the quiver is a POOL item in this seed: retro on and the shops
 * shuffled. Off, it stays locked to its shelf and is bought there, which is
 * what the logic and the in-core stock both key on.
 */
const retroQuiverInPool = (scope: ShopScope | undefined, setting: RetroBowSetting | undefined): boolean =>
  setting?.enabled === true && scope !== undefined && shopsShuffled(scope);

/**
 * The scope a retro seed is really built from: the mode's own opened slots,
 * plus the arrow shelves, spelled as an explicit set so nothing downstream has
 * to re-run a draw to find out what opened. The shelves are opened because
 * under retro a shop may not still be selling arrows, not because the quiver
 * needs a home; the quiver is in the pool by then. A vanilla scope is left
 * exactly as it is: nothing is shuffled, so nothing opens.
 */
const withRetroArrowSlots = (scope: ShopScope, setting: RetroBowSetting): ShopScope => {
  if (!setting.enabled || !shopsShuffled(scope)) return scope;
  const opened = normalizeEnabled([...openedSlotIndicesOf(scope), ...ARROW_SLOT_INDEXES]);
  return { ...scope, mode: 'custom', enabled: opened, slotCount: opened.length };
};

/** The regions a retro seed can buy the quiver in, what the logic has to reach. */
const retroQuiverRegions = (): readonly string[] =>
  [CANONICAL_SLOTS[RETRO_QUIVER_SLOT_INDEX].shop.region];

/** One arrow shelf as the running game restocks it under retro with vanilla shops. */
interface RetroShelfStock extends CanonicalShopSlot {
  /** Sells the quiver first, or only ever the refill. */
  role: 'quiver' | 'refill';
  /** What the shelf sells once the quiver is owned, or always. */
  refillItem: string;
  /** The shelf's own vanilla price, which the refill keeps. */
  refillPrice: number;
  /** The reference's quiver price, or 0 for a shelf that never sells one. */
  quiverPrice: number;
}

/**
 * The shelves the core restocks in place: every arrow shelf, but only while
 * retro is on AND the shops are vanilla. A shuffled scope puts the quiver in
 * the pool and sells the shelf's own shuffled item instead, arming nothing here.
 */
const retroVanillaShelves = (scope: ShopScope, setting: RetroBowSetting): readonly RetroShelfStock[] => {
  if (!setting.enabled || shopsShuffled(scope)) return [];
  return ARROW_SLOT_INDEXES.map((index) => {
    const quiver = index === RETRO_QUIVER_SLOT_INDEX;
    return {
      ...CANONICAL_SLOTS[index],
      role: quiver ? 'quiver' : 'refill',
      refillItem: RETRO_REFILL_ITEM,
      refillPrice: CANONICAL_SLOTS[index].slot.price,
      quiverPrice: quiver ? RETRO_QUIVER_PRICE : 0,
    };
  });
};

export {
  ARROW_SLOT_INDEXES, RETRO_QUIVER_SLOT_INDEX, retroQuiverInPool, retroQuiverRegions,
  retroVanillaShelves, withRetroArrowSlots,
};
export type { RetroShelfStock };
