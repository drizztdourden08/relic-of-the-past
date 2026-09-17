/* @layer shared-game @kind types */
/**
 * What the fairy may ASK FOR. A pond used to charge one thing, rupees, and a
 * setting said how many: the ladder's two ends. This is that question opened
 * up, so a rung can ask for bombs, for arrows, for bottles of something, or
 * for one pool item held up and handed straight back.
 *
 * Every row reuses the shop's own price types, because a demand and a shelf
 * price are the same question asked in two rooms: the same roll, the same
 * access rule (rules/shop-prices.ts), and the same row component on the panel.
 *
 * EVERY COUNTED ROW IS THE SAME SHAPE: a tick and two ends. The curve cuts the
 * throw sequence once and each of them reads the same position into its own
 * two ends (pond-demand-ramp.ts), so a rung halfway down the sequence asks for
 * about half of whichever currency it drew. The bottle is a counted row too:
 * its amount is how MANY bottles of the content she names.
 *
 * The rupee row's two ends ARE the pond's ladder ends. One key pair carries
 * them (pond-ask-keys.ts) and a Custom setting reads the same pair for its
 * start and its final price, so the ladder a player cuts and the amounts the
 * fairy asks for can never disagree.
 *
 * The item row is the one demand with no number at all: she names one thing
 * and wants to see it, so there is nothing to ramp.
 *
 * Hearts are deliberately missing. A rung sits behind the rung before it, so
 * a heart cost compounds down the ladder into a file that cannot survive its
 * own pond.
 */
import type { ShopBottleContent, ShopCurrencySetting, ShopPrice } from '../shops/shop-price.type';

/** The demands carrying an amount, each drawn from its own range. */
type PondAskCurrency = 'rupees' | 'bombs' | 'arrows';

/** How many bottles she wants, and which contents she may name. */
interface PondBottleAsk extends ShopCurrencySetting {
  contents: readonly ShopBottleContent[];
}

/** Every kind that carries a number, which is every kind but the item. */
type PondAskAmountKind = PondAskCurrency | 'bottle';

interface PondAskSetting {
  /** Rupees, over the pond's own price ladder: its two ends are the ladder's. */
  rupees: ShopCurrencySetting;
  bombs: ShopCurrencySetting;
  arrows: ShopCurrencySetting;
  bottle: PondBottleAsk;
  /** One pool item, named and shown; she sees it and hands it back, so no amount. */
  item: { enabled: boolean };
}

/** Rung location name → the demand that rung was rolled with, for one seed. */
type PondDemandView = Readonly<Record<string, ShopPrice>>;

export type { PondAskAmountKind, PondAskCurrency, PondAskSetting, PondBottleAsk, PondDemandView };
