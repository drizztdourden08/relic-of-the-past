/* @layer shared-game @kind data */
/**
 * The shop-price rows of the option catalog — synthetic, unlocked, group
 * 'shops'. One opt-in per currency plus the two ends of the range a roll is
 * drawn from, and the bottle set as an opt-in plus one row per content it
 * may demand. The panel renders each currency as ONE row (a checkbox and a
 * two-thumb range), the way the capacity families render their value rows,
 * so these keys stay out of the plain option list.
 *
 * Every currency and the bottle set are ticked for a fresh profile, over the
 * full range each one offers; a snapshot with none of the rows still reads
 * as nothing rolled (options-snapshot.ts), so every shelf it froze charges
 * what the unmodified game charges.
 *
 * The reference's own price percentage rides in the same block but not in the
 * same list — it is a source option, so it keeps its catalog place and only
 * its key and bounds are named at the foot of this file.
 */
import type { ApOptionDef } from '../options.type';
import type { ShopBottleContent, ShopCountedCurrency } from './shop-price.type';

type Seed = Omit<ApOptionDef, 'description'>;

interface CurrencyRow {
  currency: ShopCountedCurrency;
  label: string;
  max: number;
  /** Where the range opens for a newly ticked currency. */
  defaultMin: number;
  defaultMax: number;
}

const CURRENCY_ROWS: readonly CurrencyRow[] = [
  { currency: 'rupees', label: 'Rupees', max: 1000, defaultMin: 0, defaultMax: 1000 },
  { currency: 'arrows', label: 'Arrows', max: 10, defaultMin: 0, defaultMax: 10 },
  { currency: 'bombs', label: 'Bombs', max: 10, defaultMin: 0, defaultMax: 10 },
  { currency: 'hearts', label: 'Hearts', max: 10, defaultMin: 0, defaultMax: 10 },
];

const BOTTLE_CONTENTS: readonly { content: ShopBottleContent; label: string }[] = [
  { content: 'fairy', label: 'Fairy' },
  { content: 'bee', label: 'Bee' },
  { content: 'red-potion', label: 'Red Potion' },
  { content: 'blue-potion', label: 'Blue Potion' },
  { content: 'green-potion', label: 'Green Potion' },
];

const currencyKeyOf = (currency: ShopCountedCurrency): string => `shop_price_${currency}`;
const currencyMinKeyOf = (currency: ShopCountedCurrency): string => `shop_price_${currency}_min`;
const currencyMaxKeyOf = (currency: ShopCountedCurrency): string => `shop_price_${currency}_max`;
const BOTTLE_KEY = 'shop_price_bottle';
const bottleContentKeyOf = (content: ShopBottleContent): string =>
  `shop_price_bottle_${content.replace(/-/g, '_')}`;

/** A fresh profile rolls every currency; the row is still the player's to untick. */
const ROLLED_BY_DEFAULT = true;

const toggleSeed = (key: string, displayName: string, baseline: boolean): Seed => ({
  key, displayName, group: 'shops', kind: 'toggle', implementation: 'active',
  apDefault: baseline, baseline, locked: false, synthetic: true,
});

const rangeSeed = (key: string, displayName: string, max: number, baseline: number): Seed => ({
  key, displayName, group: 'shops', kind: 'range', implementation: 'active',
  range: { min: 0, max }, apDefault: baseline, baseline, locked: false, synthetic: true,
});

const SHOP_PRICE_OPTION_SEEDS: readonly Seed[] = [
  ...CURRENCY_ROWS.flatMap(({ currency, label, max, defaultMin, defaultMax }) => [
    toggleSeed(currencyKeyOf(currency), `${label} prices`, ROLLED_BY_DEFAULT),
    rangeSeed(currencyMinKeyOf(currency), `${label} price minimum`, max, defaultMin),
    rangeSeed(currencyMaxKeyOf(currency), `${label} price maximum`, max, defaultMax),
  ]),
  toggleSeed(BOTTLE_KEY, 'Bottle prices', ROLLED_BY_DEFAULT),
  ...BOTTLE_CONTENTS.map(({ content, label }) =>
    toggleSeed(bottleContentKeyOf(content), `${label} as a price`, true)),
];

/** Every synthetic key these rows own. */
const SHOP_PRICE_OPTION_KEYS: readonly string[] = SHOP_PRICE_OPTION_SEEDS.map((seed) => seed.key);

/**
 * The reference's own percentage on top of the rolled prices. It is NOT one of
 * the seeds above: it is a real source option and keeps its place in the
 * catalog's dataclass order, so only its key and its bounds are named here —
 * beside the rows it scales, because that is what reads it.
 */
const SHOP_PRICE_MODIFIER_KEY = 'shop_price_modifier';
const SHOP_PRICE_MODIFIER_MIN = 0;
const SHOP_PRICE_MODIFIER_MAX = 400;
/** A hundred per cent: the ranges above, exactly as they were set. */
const SHOP_PRICE_MODIFIER_DEFAULT = 100;

/** Every key the price block renders — the panel skips all of them in the plain list. */
const SHOP_PRICE_BLOCK_KEYS: readonly string[] = [...SHOP_PRICE_OPTION_KEYS, SHOP_PRICE_MODIFIER_KEY];

const isShopPriceOptionKey = (key: string): boolean => SHOP_PRICE_BLOCK_KEYS.includes(key);

export {
  BOTTLE_CONTENTS, BOTTLE_KEY, CURRENCY_ROWS,
  SHOP_PRICE_BLOCK_KEYS, SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
  SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
  SHOP_PRICE_OPTION_KEYS, SHOP_PRICE_OPTION_SEEDS,
  bottleContentKeyOf, currencyKeyOf, currencyMaxKeyOf, currencyMinKeyOf, isShopPriceOptionKey,
};
export type { CurrencyRow };
