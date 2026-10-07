/* @layer shared-game @kind types */
/**
 * What a shelf charges. A price is rolled once, at generation time, from the
 * seed's own rng and recorded on the placement, so the spoiler, the access
 * rules and the running game all read the same number, since a price is part of
 * the seed, never re-derived later.
 *
 * Four counted currencies carry an amount; a bottle price carries a content,
 * and a count only where the room asking for it counts bottles, which the
 * ponds do and the shelves do not. An item price carries a name and no amount
 * at all, because what it asks for is one item, held up and handed back.
 */

type ShopCountedCurrency = 'rupees' | 'arrows' | 'bombs' | 'hearts';

/** The bottle contents a shelf may demand as its price. */
type ShopBottleContent = 'fairy' | 'bee' | 'red-potion' | 'blue-potion' | 'green-potion';

type ShopCurrency = ShopCountedCurrency | 'bottle' | 'item';

interface ShopCountedPrice {
  currency: ShopCountedCurrency;
  /** Rupees, arrows, bombs, or WHOLE hearts. */
  amount: number;
}

interface ShopBottlePrice {
  currency: 'bottle';
  content: ShopBottleContent;
  /**
   * How many bottles of it, for a demand that counts them (pond/). A shelf
   * charges one bottle and writes no amount, and so did every pond demand
   * frozen before the count existed, so an absent amount is one bottle.
   */
  amount?: number;
}

/**
 * A price paid by SHOWING: the holder names one pool item, the player has to
 * be holding it, and it goes straight back into the pack. Every other currency
 * is spent, so this one carries no amount and takes nothing away.
 */
interface ShopItemPrice {
  currency: 'item';
  /** The pool item this price names. Always a real item; never blank. */
  itemName: string;
}

type ShopPrice = ShopCountedPrice | ShopBottlePrice | ShopItemPrice;

/** One counted currency's opt-in and the range a roll is drawn from. */
interface ShopCurrencySetting {
  enabled: boolean;
  min: number;
  max: number;
}

/**
 * The price model a snapshot asks for. With every currency off, prices stay
 * exactly as the unmodified game charges them and nothing is rolled.
 */
interface ShopPricePlan {
  rupees: ShopCurrencySetting;
  arrows: ShopCurrencySetting;
  bombs: ShopCurrencySetting;
  hearts: ShopCurrencySetting;
  /** Bottle prices carry no range, only which contents a shelf may demand. */
  bottle: { enabled: boolean; contents: readonly ShopBottleContent[] };
  /**
   * The most hearts a price may ask for: the seed's own heart ceiling less
   * the one heart a payment must leave standing. The other three ceilings
   * come from the capacity profile at roll time; this one is a snapshot row,
   * so the plan carries it.
   */
  heartCeiling: number;
}

/** Location name → the price that location's shelf charges. */
type ShopPriceView = Readonly<Record<string, ShopPrice>>;

export type {
  ShopBottleContent, ShopBottlePrice, ShopCountedCurrency, ShopCountedPrice,
  ShopCurrency, ShopCurrencySetting, ShopItemPrice, ShopPrice, ShopPricePlan,
  ShopPriceView,
};
