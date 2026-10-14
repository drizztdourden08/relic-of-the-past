/* @layer shared-game @kind logic */
import { createAssumedState } from './create-assumed-state';
import { MAX_SWAPS_PER_ITEM } from './fill.constants';
import type { ItemKey } from '../item-ids';
import type { SwapRun } from './fill.type';

const trySwap = (run: SwapRun, item: ItemKey, checkAccess: boolean): boolean => {
  const { world, items, assumedItems, placedHere, swapCounts, fits } = run;
  for (const spot of placedHere) {
    const displaced = world.placedItems.get(spot);
    if (displaced === undefined || (swapCounts.get(displaced) ?? 0) >= MAX_SWAPS_PER_ITEM) continue;
    world.placedItems.delete(spot);
    const swapState = createAssumedState(world, [...assumedItems, ...items]);
    if (fits(swapState.state, item, spot, checkAccess)) {
      world.placedItems.set(spot, item);
      swapCounts.set(displaced, (swapCounts.get(displaced) ?? 0) + 1);
      items.unshift(displaced);
      return true;
    }
    world.placedItems.set(spot, displaced);
  }
  return false;
};

export { trySwap };
