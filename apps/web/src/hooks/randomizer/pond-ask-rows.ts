/* @layer renderer-hooks @kind logic */
/**
 * The ask block, derived: one pond's demand setting to the rows the panel
 * draws for it. The rows are the shop's own currency rows in shape, because
 * they are drawn by the same component (CurrencyPriceRow), so a demand and a
 * shelf price read alike wherever they appear.
 *
 * The rupee row is the odd one: its two thumbs are the pond's own price
 * ladder, so it carries the ladder's stops and the row state's range, and an
 * edit on it moves the ladder itself. Bombs and arrows carry their own stops
 * and write their own amounts, their stops cut at what this profile's bag and
 * quiver reach (pond-ceilings.ts). Only the Custom mode cuts a ladder, so in every
 * other mode the rupee row is a tick with no range beside it.
 *
 * The bottle row counts too: how many bottles of the contents under it she may
 * name, over the four slots a file has.
 */
import {
  POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_BOTTLE_ROW,
} from '@shared/randomizer/ap-world/pond/pond-ask.data';
import type { PondAskSetting } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondCeilings } from '@shared/randomizer/ap-world/pond/pond-ceilings';
import type { PondAskModel, PondAskRowModel } from '@domains/app/compounds/WishingPondRow';

/** The stop nearest an amount, so a stored amount off the ladder still shows a thumb. */
const nearestStop = (stops: readonly number[], amount: number): number =>
  stops.reduce((best, stop, index) =>
    (Math.abs(stop - amount) < Math.abs(stops[best] - amount) ? index : best), 0);

/** The stops up to a ceiling, the first one kept so a tiny reach still has a thumb. */
const stopsUnder = (stops: readonly number[], ceiling: number): readonly number[] => {
  const kept = stops.filter((stop) => stop <= ceiling);
  return kept.length > 0 ? kept : stops.slice(0, 1);
};

/** Both thumbs of one row, as indexes into its own stops. */
const rangeOnStops = (
  stops: readonly number[], setting: { min: number; max: number },
): readonly [number, number] => [nearestStop(stops, setting.min), nearestStop(stops, setting.max)];

const countedRowOf = (
  row: (typeof POND_ASK_ROWS)[number], ask: PondAskSetting,
  priceStops: readonly string[], priceRange: readonly [number, number], hasLadder: boolean,
  ceilings: PondCeilings,
): PondAskRowModel => {
  const { currency, label } = row;
  const checked = ask[currency].enabled;
  if (currency === 'rupees') {
    return hasLadder
      ? { currency, label, checked, stops: priceStops, range: priceRange }
      : { currency, label, checked };
  }
  const stops = stopsUnder(row.stops, ceilings[currency]);
  return { currency, label, checked, stops: stops.map(String), range: rangeOnStops(stops, ask[currency]) };
};

/** Everything the ask block draws for one pond. */
const pondAskModelOf = (
  ask: PondAskSetting, priceStops: readonly string[], priceRange: readonly [number, number], hasLadder: boolean,
  ceilings: PondCeilings,
): PondAskModel => ({
  counted: POND_ASK_ROWS.map((row) => countedRowOf(row, ask, priceStops, priceRange, hasLadder, ceilings)),
  bottleChecked: ask.bottle.enabled,
  bottleStops: POND_BOTTLE_ROW.stops.map(String),
  bottleRange: rangeOnStops(POND_BOTTLE_ROW.stops, ask.bottle),
  bottleRows: POND_ASK_BOTTLE_CONTENTS.map(({ content, label }) => ({
    content, label, checked: ask.bottle.contents.includes(content),
  })),
  itemChecked: ask.item.enabled,
});

export { pondAskModelOf };
