/* @layer shared-game @kind logic */
import type { ItemKey } from '../world/item-ids';

const countsOf = (items: Iterable<ItemKey>): Map<ItemKey, number> => {
  const counts = new Map<ItemKey, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return counts;
};

export { countsOf };
