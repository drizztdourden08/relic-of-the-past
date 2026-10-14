/* @layer renderer-hooks @kind logic */
import { POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_BOTTLE_ROW } from '@rotp/randomizer';
import { itemAt } from '@app/checked-access';
import type { PondAskModel, PondAskRowModel } from '@app/compounds/WishingPondRow';
import type { PondAskModelParams } from './pond-ask-rows.type';

const nearestStop = (stops: readonly number[], amount: number): number =>
  stops.reduce((best, stop, index) =>
    (Math.abs(stop - amount) < Math.abs(itemAt(stops, best) - amount) ? index : best), 0);

const stopsUnder = (stops: readonly number[], ceiling: number): readonly number[] => {
  const kept = stops.filter((stop) => stop <= ceiling);
  return kept.length > 0 ? kept : stops.slice(0, 1);
};

const rangeOnStops = (
  stops: readonly number[], setting: { min: number; max: number },
): readonly [number, number] => [nearestStop(stops, setting.min), nearestStop(stops, setting.max)];

const countedRowOf = (row: (typeof POND_ASK_ROWS)[number], params: PondAskModelParams): PondAskRowModel => {
  const { ask, priceStops, priceRange, hasLadder, ceilings } = params;
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

const pondAskModelOf = (params: PondAskModelParams): PondAskModel => {
  const { ask } = params;
  return {
    counted: POND_ASK_ROWS.map((row) => countedRowOf(row, params)),
    bottleChecked: ask.bottle.enabled,
    bottleStops: POND_BOTTLE_ROW.stops.map(String),
    bottleRange: rangeOnStops(POND_BOTTLE_ROW.stops, ask.bottle),
    bottleRows: POND_ASK_BOTTLE_CONTENTS.map(({ content, label }) => ({
      content, label, checked: ask.bottle.contents.includes(content),
    })),
    itemChecked: ask.item.enabled,
  };
};

export { pondAskModelOf };
