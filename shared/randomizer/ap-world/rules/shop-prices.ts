/* @layer shared-game @kind logic */
/**
 * Paying for a shelf is a requirement like any other. The wallet overlay
 * already gates a rupee price by the wallet that can HOLD it; these rules
 * extend the same idea to the other currencies, so a progression item behind
 * a price the file can never pay is out of logic and the fill puts
 * something else there.
 *
 * What each currency asks for:
 *   rupees:  a wallet rung that holds the price at once (rupees are farmable
 *             between purchases, so holding it once is the real constraint);
 *   arrows:  an arrow capacity that holds the price, which on the empty rung is none;
 *   bombs:   a bomb bag that holds the price, same reading;
 *   hearts:  enough heart containers to pay and still be alive, so the price
 *             plus one;
 *   bottle:  as MANY bottles as the demand counts, to carry the content in,
 *             AND, for a potion, the hut that sells it. A pond rung may ask
 *             for several at once (pond/pond-ask.type.ts) and they are handed
 *             over together, so one bottle does not pay a demand of four.
 *             Paying hands the content over, and a restocked shelf asks for it
 *             again, so a repeated price needs a repeatable source: a fairy
 *             and a bee are caught in the world wherever the player already
 *             is, but a potion is bought, from one hut, and a file that cannot
 *             reach it can pay such a price at most once. The scope rule
 *             (potion-price/) has already made sure the content is still on
 *             sale at all; this is the second half of the same reading, that
 *             the seller can be got to. The wallet reading stays a single
 *             cauldron price however many bottles are asked for, because they
 *             are filled one at a time and rupees are farmable between
 *             refills, which is the same reading the rupee rule makes.
 *   item:    the named item, in hand. It is shown and handed back, so there
 *             is no capacity to read and no stock to refill.
 */
import { ITEM, REGION_NAME } from '../item-names.data';
import { explosivesCapacity, projectilesCapacity, walletCapacity } from '../state-helpers-capacity';
import { bottleCount } from '../state-helpers';
import { BOTTLE_ITEMS } from '../item-names.data';
import { cauldronPriceOf } from '../potion-price/potion-cauldrons.data';
import type { CollectionState } from '../collection-state';
import type { Rule } from '../world.type';
import type { ShopPrice } from '../shops/shop-price.type';

/** Hearts a new file starts with, before any container or piece is collected. */
const STARTING_HEARTS = 3;
const PIECES_PER_HEART = 4;

const heartCapacity = (state: CollectionState): number =>
  STARTING_HEARTS
  + state.count(ITEM.bossHeartContainer)
  + state.count(ITEM.sanctuaryHeartContainer)
  + Math.floor(state.count(ITEM.pieceOfHeart) / PIECES_PER_HEART);

/** Any bottle will do: the shelf takes what is inside it, not a particular vessel. */
const hasAnyBottle = (state: CollectionState): boolean =>
  BOTTLE_ITEMS.some((name) => state.has(name));

/**
 * Bottles enough to hand that many over at once.
 *
 * WHAT THIS CAN SEE: `bottleCount` (state-helpers.ts), the same reading the
 * magic-meter rule already makes of how many bottles a file carries, held to
 * the four the game has slots for. There is no bottle capacity family and no
 * upgrade ladder for one, so the bottles themselves ARE the capacity, and four
 * is why the demand stops stop there (pond/pond-ask.data.ts).
 *
 * WHAT IT CANNOT SEE: whether a bottle is FULL. Nothing in the state tracks
 * contents, so this reads vessels, and the content half of the rule below is
 * what says the player can fill them.
 *
 * A demand of one reads exactly as it always has: holding a usable bottle
 * already means the count is at least one, so the second half decides nothing.
 */
const hasBottles = (state: CollectionState, count: number): boolean =>
  hasAnyBottle(state) && bottleCount(state) >= count;

/**
 * A bottle price: the vessel, plus, for a content that is BOUGHT and not
 * caught, the seller, reachable and affordable. Reaching the seller is the
 * same reading the meter rules already make of that region
 * (state-helpers.ts), so the two agree by construction; the wallet reading is
 * the same one every rupee price gets, since a cauldron charges rupees like
 * any other counter and a wallet too small to hold that is a wallet that
 * cannot refill the bottle.
 */
const ruleForBottle = (content: string, count: number): Rule => {
  const price = cauldronPriceOf(content);
  if (price === undefined) return (state) => hasBottles(state, count);
  return (state) => hasBottles(state, count)
    && state.canReachRegion(REGION_NAME.potionSeller)
    && walletCapacity(state) >= price;
};

const ruleForPrice = (price: ShopPrice): Rule => {
  // A price with no count of its own asks for one bottle, which is what every
  // shelf asks for and what every placement frozen before the count means.
  if (price.currency === 'bottle') return ruleForBottle(price.content, price.amount ?? 1);
  // Holding the named item is the WHOLE rule. Every other currency is spent,
  // so its rule asks what the player can hold and still afford again; this one
  // is shown and handed straight back, so there is nothing left to ask.
  //
  // The name is fixed before the world is built, because a price is rolled at
  // generation time and recorded on the placement. So by the time the rules
  // are registered the item is just another name in a requirement, and the
  // solver reads it as one: it fills the named item somewhere reachable first,
  // routes around this slot, or rerolls. The player owning the item when the
  // price was rolled has never been the question, because going and getting it
  // is the point.
  if (price.currency === 'item') return (state) => state.has(price.itemName);
  const { amount } = price;
  if (price.currency === 'rupees') return (state) => walletCapacity(state) >= amount;
  if (price.currency === 'arrows') return (state) => projectilesCapacity(state) >= amount;
  if (price.currency === 'bombs') return (state) => explosivesCapacity(state) >= amount;
  // Paying hearts must leave the player standing, so the price is never the last heart.
  return (state) => heartCapacity(state) > amount;
};

export { heartCapacity, ruleForPrice };
