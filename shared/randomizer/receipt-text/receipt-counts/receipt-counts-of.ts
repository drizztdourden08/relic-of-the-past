/* @layer shared-game @kind logic */
import { KEY_DROP_LOCATIONS } from '../../world/scope-tables';
import { countClassOf } from './count-class-of';
import type { LocationKey } from '../../world/location-key';
import type { ReceiptCount, ReceiptCountOf, ReceiptCountSource } from './receipt-counts.type';

const receiptCountsOf = (source: ReceiptCountSource): ReceiptCountOf => {
  const { locations, keyDropShuffle, completed, triforceRequired } = source;
  const classByLocation = new Map<LocationKey, string>();
  const totals = new Map<string, number>();
  const found = new Map<string, number>();
  for (const [where, item] of Object.entries(locations)) {
    const location = where as LocationKey;
    if (!keyDropShuffle && KEY_DROP_LOCATIONS.has(location)) continue;
    const countClass = countClassOf(item);
    if (countClass === undefined) continue;
    classByLocation.set(location, countClass);
    totals.set(countClass, (totals.get(countClass) ?? 0) + 1);
    if (completed.has(location)) found.set(countClass, (found.get(countClass) ?? 0) + 1);
  }
  return (location) => {
    const countClass = classByLocation.get(location);
    if (countClass === undefined) return undefined;
    const others = (found.get(countClass) ?? 0) - (completed.has(location) ? 1 : 0);
    const count: ReceiptCount = { ordinal: others + 1, total: totals.get(countClass) ?? 0 };
    return countClass === 'triforce' && triforceRequired !== undefined ? { ...count, required: triforceRequired } : count;
  };
};

export { receiptCountsOf };
