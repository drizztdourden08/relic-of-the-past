/* @layer shared-game @kind logic */
/**
 * Paying for a shelf is a requirement like any other. The wallet overlay
 * already gates a rupee price by the wallet that can HOLD it; these rules
 * extend the same idea to the other currencies, so a progression item behind
 * a price the file can never pay is simply out of logic and the fill puts
 * something else there.
 *
 * What each currency asks for:
 *   rupees  — a wallet rung that holds the price at once (rupees are farmable
 *             between purchases, so holding it once is the real constraint);
 *   arrows  — an arrow capacity that holds the price, which on the empty rung is none;
 *   bombs   — a bomb bag that holds the price, same reading;
 *   hearts  — enough heart containers to pay and still be alive, so the price
 *             plus one;
 *   bottle  — a bottle to carry the demanded content in, AND, for a potion,
 *             the hut that sells it. Paying hands the content over, and a
 *             restocked shelf asks for it again, so a repeated price needs a
 *             repeatable source: a fairy and a bee are caught in the world
 *             wherever the player already is, but a potion is bought, from
 *             one hut, and a file that cannot reach it can pay such a price
 *             at most once. The scope rule (potion-price/) has already made
 *             sure the content is still on sale at all; this is the second
 *             half of the same reading — that the seller can be got to.
 */
import { ITEM, REGION_NAME } from '../item-names.data';
import { explosivesCapacity, projectilesCapacity, walletCapacity } from '../state-helpers-capacity';
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
 * A bottle price: the vessel, plus — for a content that is BOUGHT rather than
 * caught — the seller, reachable and affordable. Reaching the seller is the
 * same reading the meter rules already make of that region
 * (state-helpers.ts), so the two agree by construction; the wallet reading is
 * the same one every rupee price gets, since a cauldron charges rupees like
 * any other counter and a wallet too small to hold that is a wallet that
 * cannot refill the bottle.
 */
const ruleForBottle = (content: string): Rule => {
  const price = cauldronPriceOf(content);
  if (price === undefined) return hasAnyBottle;
  return (state) => hasAnyBottle(state)
    && state.canReachRegion(REGION_NAME.potionSeller)
    && walletCapacity(state) >= price;
};

const ruleForPrice = (price: ShopPrice): Rule => {
  if (price.currency === 'bottle') return ruleForBottle(price.content);
  const { amount } = price;
  if (price.currency === 'rupees') return (state) => walletCapacity(state) >= amount;
  if (price.currency === 'arrows') return (state) => projectilesCapacity(state) >= amount;
  if (price.currency === 'bombs') return (state) => explosivesCapacity(state) >= amount;
  // Paying hearts must leave the player standing, so the price is never the last heart.
  return (state) => heartCapacity(state) > amount;
};

export { heartCapacity, ruleForPrice };
