/* @layer shared-game @kind logic */
/**
 * A price in the terms the running game understands: a currency tag and one
 * number. The counted currencies pass their amount straight through, and hearts
 * in WHOLE hearts, which the core multiplies by the eight units a heart is
 * worth. A bottle price passes the byte the game itself stores in a bottle
 * slot, so the core compares against the player's own bottles with no table
 * of its own.
 */
import type { ShopBottleContent, ShopPrice } from './shop-price.type';

/** Currency tags, shared with core/game-hooks/shop_overrides.c. */
const NATIVE_CURRENCY = {
  rupees: 0,
  arrows: 1,
  bombs: 2,
  hearts: 3,
  bottle: 4,
} as const;

/** The values the game stores in a bottle slot (2 is an empty bottle). */
const NATIVE_BOTTLE_CONTENT: Readonly<Record<ShopBottleContent, number>> = {
  'red-potion': 3,
  'green-potion': 4,
  'blue-potion': 5,
  fairy: 6,
  bee: 7,
};

interface NativePrice {
  currency: number;
  /** The amount, or the bottle-slot value a bottle price demands. */
  amount: number;
}

const nativePriceOf = (price: ShopPrice): NativePrice =>
  (price.currency === 'bottle'
    ? { currency: NATIVE_CURRENCY.bottle, amount: NATIVE_BOTTLE_CONTENT[price.content] }
    : { currency: NATIVE_CURRENCY[price.currency], amount: price.amount });

/** Human wording for a price, for the spoiler and the plan log. */
const priceLabelOf = (price: ShopPrice): string => {
  if (price.currency === 'bottle') return `a bottled ${price.content.replace(/-/g, ' ')}`;
  const { amount, currency } = price;
  if (currency === 'hearts') return `${amount} heart${amount === 1 ? '' : 's'}`;
  return `${amount} ${currency}`;
};

export { NATIVE_BOTTLE_CONTENT, NATIVE_CURRENCY, nativePriceOf, priceLabelOf };
export type { NativePrice };
