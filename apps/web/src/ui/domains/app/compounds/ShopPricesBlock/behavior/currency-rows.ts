/* @layer renderer-components @kind logic */
/**
 * The counted-currency rows the price block draws: one per currency a shelf
 * may charge, each already matched against the two things the rest of the
 * panel decides for it.
 *
 * THE CEILING. A price can never exceed what the profile can pay, so a row's
 * range stops where its currency does: the top rung the capacity profile
 * reaches for rupees, arrows and bombs, and the heart ceiling less one for
 * hearts. The ladder of stops is rebuilt from that ceiling on every render,
 * so shrinking the wallet on the capacity tab shortens the rupee range here
 * at once, and a stored end above the new ceiling reads as the ceiling.
 *
 * THE RULE. A currency the seed has nothing of (shop-price-currency-rule)
 * shows unticked and greyed with the reason on its own row, while the stored
 * tick is left alone so it comes straight back when the rule lets go.
 */
import { stopsFor } from './price-stops';
import {
  CURRENCY_ROWS, currencyKeyOf, currencyMaxKeyOf, currencyMinKeyOf,
} from '@shared/randomizer/ap-world/shops/shop-price-options.data';
import { priceCeilingsOf } from '@shared/randomizer/ap-world/shops/shop-price-ceilings';
import {
  blockedCurrencyKeysOfValues, blockedCurrencyNote,
} from '@shared/randomizer/ap-world/shops/shop-price-currency-rule';
import { shopPricePlanOf } from '@shared/randomizer/ap-world/shops/shop-price-plan';
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import type { ShopCountedCurrency } from '@shared/randomizer/ap-world/shops/shop-price.type';

type Values = Readonly<Record<string, ApOptionValue>>;

interface CurrencyRowModel {
  currency: ShopCountedCurrency;
  /** The currency in the player's own words. */
  label: string;
  /** Its opt-in key, and the two ends of its range: what an edit writes. */
  key: string;
  minKey: string;
  maxKey: string;
  /** Shown ticked: the stored tick, unless a rule holds the currency off. */
  checked: boolean;
  /** The seed has nothing of this currency: the row is greyed and cannot be ticked. */
  blocked: boolean;
  /** Why this row is greyed; empty while it is not. */
  note: string;
  /** The most a price in this currency may ask for right now. */
  ceiling: number;
  /** The amounts the two thumbs may sit on, up to the ceiling. */
  stops: readonly string[];
  /** [low, high] indexes into `stops`; a stored end above the ceiling reads as the ceiling. */
  range: readonly [number, number];
}

const numberAt = (values: Values, key: string, fallback: number): number =>
  (typeof values[key] === 'number' ? values[key] : fallback);

/** The stop nearest an amount, the amount first held under the ceiling. */
const nearestStop = (stops: readonly string[], amount: number, ceiling: number): number => {
  const clamped = Math.min(amount, ceiling);
  return stops.reduce((best, stop, index) =>
    (Math.abs(Number(stop) - clamped) < Math.abs(Number(stops[best]) - clamped) ? index : best), 0);
};

const currencyRowsOf = (values: Values, capacity: CapacityProfile): readonly CurrencyRowModel[] => {
  const ceilings = priceCeilingsOf(shopPricePlanOf(values), capacity);
  const blockedKeys = blockedCurrencyKeysOfValues(values);
  return CURRENCY_ROWS.map(({ currency, label, defaultMin, defaultMax }) => {
    const key = currencyKeyOf(currency);
    const minKey = currencyMinKeyOf(currency);
    const maxKey = currencyMaxKeyOf(currency);
    const ceiling = ceilings[currency];
    const stops = stopsFor(ceiling);
    const blocked = blockedKeys.has(key);
    return {
      currency, label, key, minKey, maxKey, blocked, ceiling, stops,
      checked: values[key] === true && !blocked,
      note: blocked ? blockedCurrencyNote(currency) : '',
      range: [
        nearestStop(stops, numberAt(values, minKey, defaultMin), ceiling),
        nearestStop(stops, numberAt(values, maxKey, defaultMax), ceiling),
      ],
    };
  });
};

export { currencyRowsOf };
export type { CurrencyRowModel };
