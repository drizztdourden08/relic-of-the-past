/* @layer renderer-components @kind logic */
import { stopsFor } from './price-stops';
import { priceCeilingsOf } from '@rotp/randomizer';
import { blockedCurrencyKeysOfValues, blockedCurrencyNote } from '@rotp/randomizer';
import { shopPricePlanOf } from '@rotp/randomizer';
import type { CurrencyCatalogKeys, CurrencyRowModel, Values } from '../CurrencyPriceRow.type';
import type { CapacityProfile } from '@rotp/randomizer';
import type { CurrencyRow } from '@rotp/randomizer';

const numberAt = (values: Values, key: string, fallback: number): number =>
  (typeof values[key] === 'number' ? values[key] : fallback);

const nearestStop = (stops: readonly string[], amount: number, ceiling: number): number => {
  const clamped = Math.min(amount, ceiling);
  return stops.reduce((best, stop, index) =>
    (Math.abs(Number(stop) - clamped) < Math.abs(Number(stops[best]) - clamped) ? index : best), 0);
};

const currencyRowsOf = (
  values: Values, capacity: CapacityProfile,
  rows: readonly CurrencyRow[], keys: CurrencyCatalogKeys,
): readonly CurrencyRowModel[] => {
  const ceilings = priceCeilingsOf(shopPricePlanOf(values), capacity);
  const blockedKeys = blockedCurrencyKeysOfValues(values);
  return rows.map(({ currency, label, defaultMin, defaultMax }) => {
    const key = keys.keyOf(currency);
    const minKey = keys.minKeyOf(currency);
    const maxKey = keys.maxKeyOf(currency);
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
