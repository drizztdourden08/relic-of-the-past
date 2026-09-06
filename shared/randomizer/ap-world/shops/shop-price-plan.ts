/* @layer shared-game @kind logic */
/**
 * Snapshot → price model, and the seeded roll that turns it into one price
 * per opened shelf.
 *
 * A roll is CLAMPED to what the profile can ever pay (shop-price-ceilings):
 * a price above the highest rung a family's ladder reaches could never be
 * afforded, and under full accessibility an unaffordable shelf would make
 * the seed ungeneratable rather than merely hard. Both ends of a range are
 * brought down to the ceiling, the minimum included — a range whose floor
 * stands above what the profile can hold rolls the ceiling itself rather
 * than dropping the currency the player ticked.
 *
 * With no currency ticked nothing is rolled and the caller keeps the shelf's
 * own vanilla price, so the baseline snapshot is the unmodified game — and a
 * percentage applied to nothing is still nothing.
 *
 * The reference's price percentage is folded in HERE, into each range, rather
 * than onto the amount a roll came back with. Scaling the ends and scaling
 * every price the ends can produce are the same set of prices, and doing it
 * once at the range keeps a single place where a price can be made dearer:
 * the clamp still has the last word, so a percentage turned all the way up
 * piles prices against what the profile can pay instead of past it, and the
 * access rules — which read the rolled price back off the placement — see
 * the scaled number with nothing to re-derive.
 *
 * Two refusals are made from the snapshot alone, whatever the rows say. A
 * bottle content is refused when the same snapshot has handed its cauldron
 * to the shuffle (potion-price/), and the arrows currency is refused when
 * retro bow has taken arrows out of the world (shop-price-currency-rule).
 * The panel already switches those rows off, so for a snapshot this app
 * wrote neither refusal changes anything — they are here for the one it did
 * not write, because a rolled price the file can never pay is unpayable and
 * the row is only a flag.
 */
import { REFERENCE_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { heartCapOfValues } from '../difficulty/difficulty-from-snapshot';
import {
  BOTTLE_CONTENTS, BOTTLE_KEY, CURRENCY_ROWS,
  SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
  SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
  bottleContentKeyOf, currencyKeyOf, currencyMaxKeyOf, currencyMinKeyOf,
} from './shop-price-options.data';
import { blockedContentsOfValues } from '../potion-price/potion-price-rule';
import { ceilingOf } from './shop-price-ceilings';
import { blockedCurrenciesOfValues } from './shop-price-currency-rule';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { ApOptionValue } from '../options.type';
import type { Rng } from '../../rng';
import type { ShopSlotLocation } from './shop-slots';
import type {
  ShopBottleContent, ShopCountedCurrency, ShopCurrencySetting, ShopPrice, ShopPricePlan, ShopPriceView,
} from './shop-price.type';

/** A heart price must leave the player alive, so it never asks for the last heart. */
const HEARTS_KEPT_ALIVE = 1;

type Values = Readonly<Record<string, ApOptionValue>>;

const numberAt = (values: Values, key: string, fallback: number): number =>
  (typeof values[key] === 'number' ? values[key] : fallback);

/**
 * The percentage every counted range is scaled by, read off the snapshot and
 * held inside the source's own bounds — a snapshot this app did not write
 * cannot widen them by storing a number outside them.
 */
const modifierOf = (values: Values): number => {
  const asked = numberAt(values, SHOP_PRICE_MODIFIER_KEY, SHOP_PRICE_MODIFIER_DEFAULT);
  return Math.min(SHOP_PRICE_MODIFIER_MAX, Math.max(SHOP_PRICE_MODIFIER_MIN, Math.round(asked)));
};

/** One end of a range, scaled. Whole currency only — half a rupee is not a price. */
const scaledBy = (amount: number, modifier: number): number => Math.floor((amount * modifier) / 100);

const settingOf = (
  values: Values, currency: ShopCountedCurrency, max: number, modifier: number, refused: boolean,
): ShopCurrencySetting => {
  const low = numberAt(values, currencyMinKeyOf(currency), 0);
  const high = numberAt(values, currencyMaxKeyOf(currency), max);
  return {
    enabled: values[currencyKeyOf(currency)] === true && !refused,
    min: scaledBy(Math.min(low, high), modifier),
    max: scaledBy(Math.max(low, high), modifier),
  };
};

const shopPricePlanOf = (values: Values): ShopPricePlan => {
  const modifier = modifierOf(values);
  const refused = new Set(blockedCurrenciesOfValues(values));
  const byCurrency = Object.fromEntries(
    CURRENCY_ROWS.map((row) =>
      [row.currency, settingOf(values, row.currency, row.max, modifier, refused.has(row.currency))]),
  ) as Record<ShopCountedCurrency, ShopCurrencySetting>;
  const unbuyable = new Set(blockedContentsOfValues(values));
  return {
    ...byCurrency,
    bottle: {
      enabled: values[BOTTLE_KEY] === true,
      contents: BOTTLE_CONTENTS
        .filter(({ content }) => values[bottleContentKeyOf(content)] !== false && !unbuyable.has(content))
        .map(({ content }) => content),
    },
    heartCeiling: heartCapOfValues(values) - HEARTS_KEPT_ALIVE,
  };
};

/** The currencies this plan may draw from — every ticked one, none dropped for its range. */
const drawableOf = (plan: ShopPricePlan): ShopCountedCurrency[] =>
  CURRENCY_ROWS.filter((row) => plan[row.currency].enabled).map((row) => row.currency);

/** Both ends brought down to the ceiling, so a floor above it rolls the ceiling itself. */
const rollCounted = (
  currency: ShopCountedCurrency, plan: ShopPricePlan, profile: CapacityProfile, rng: Rng,
): ShopPrice => {
  const { min, max } = plan[currency];
  const ceiling = ceilingOf(currency, plan, profile);
  const low = Math.min(min, ceiling);
  const high = Math.min(max, ceiling);
  return { currency, amount: low + rng.int(high - low + 1) };
};

const rollBottle = (contents: readonly ShopBottleContent[], rng: Rng): ShopPrice =>
  ({ currency: 'bottle', content: contents[rng.int(contents.length)] });

/**
 * One price per opened shelf. Every enabled currency is equally likely; a
 * bottle price counts as one more option alongside the counted ones.
 */
const rollShopPrices = (
  slots: readonly ShopSlotLocation[], plan: ShopPricePlan, rng: Rng,
  profile: CapacityProfile = REFERENCE_CAPACITY_PROFILE,
): ShopPriceView => {
  const counted = drawableOf(plan);
  const bottleUsable = plan.bottle.enabled && plan.bottle.contents.length > 0;
  const view: Record<string, ShopPrice> = {};
  if (counted.length === 0 && !bottleUsable) return view;
  for (const slot of slots) {
    const pick = rng.int(counted.length + (bottleUsable ? 1 : 0));
    view[slot.name] = pick < counted.length
      ? rollCounted(counted[pick], plan, profile, rng)
      : rollBottle(plan.bottle.contents, rng);
  }
  return view;
};

export { rollShopPrices, shopPricePlanOf };
