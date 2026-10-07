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

/**
 * The native form of a price, or null when it has none. An item price is
 * SHOWN and handed back, so nothing is deducted and no counter is compared:
 * there is no tag for it and no number to send, and the caller drops the
 * override instead of shipping a price the core would read as something else.
 */
const nativePriceOf = (price: ShopPrice): NativePrice | null => {
  if (price.currency === 'item') return null;
  if (price.currency === 'bottle') {
    return { currency: NATIVE_CURRENCY.bottle, amount: NATIVE_BOTTLE_CONTENT[price.content] };
  }
  return { currency: NATIVE_CURRENCY[price.currency], amount: price.amount };
};

/** Human wording for a price, for the spoiler and the plan log. */
const priceLabelOf = (price: ShopPrice): string => {
  if (price.currency === 'bottle') return `a bottled ${price.content.replace(/-/g, ' ')}`;
  // The only label that names a thing instead of counting one, because this
  // price is shown and kept.
  if (price.currency === 'item') return `the ${price.itemName}, shown`;
  const { amount, currency } = price;
  if (currency === 'hearts') return `${amount} heart${amount === 1 ? '' : 's'}`;
  return `${amount} ${currency}`;
};

export { NATIVE_BOTTLE_CONTENT, NATIVE_CURRENCY, nativePriceOf, priceLabelOf };
export type { NativePrice };
