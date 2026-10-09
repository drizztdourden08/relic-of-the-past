/* @layer shared-game @kind logic */
import { canFillLocation } from './can-fill-location';
import { createAssumedState } from './create-assumed-state';
import { FillError } from './fill-error';
import { MAX_SWAPS_PER_ITEM } from './fill.constants';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { CollectionState } from '../collection-state';
import type { FillRestrictiveInput } from './fill.type';

const fillRestrictive = (input: FillRestrictiveInput): void => {
  const { world, items, locations, assumedItems = [], allowedAt, relaxWhenBeatable = false } = input;
  const placedHere: LocationKey[] = [];
  const swapCounts = new Map<ItemKey, number>();
  const fits = (
    state: CollectionState, item: ItemKey, location: LocationKey, checkAccess: boolean,
  ): boolean =>
    (allowedAt === undefined || allowedAt(item, location))
      && canFillLocation(state, location, item, checkAccess);
  while (items.length > 0) {
    const item = items.pop() as ItemKey;
    const assumed = createAssumedState(world, [...assumedItems, ...items]);
    const checkAccess = !relaxWhenBeatable || !world.isBeaten(assumed.state);
    const spotIndex = locations.findIndex((key) => fits(assumed.state, item, key, checkAccess));
    if (spotIndex >= 0) {
      const spot = locations.splice(spotIndex, 1)[0];
      world.placedItems.set(spot, item);
      placedHere.push(spot);
      continue;
    }
    let swapped = false;
    for (const spot of placedHere) {
      const displaced = world.placedItems.get(spot);
      if (displaced === undefined || (swapCounts.get(displaced) ?? 0) >= MAX_SWAPS_PER_ITEM) continue;
      world.placedItems.delete(spot);
      const swapState = createAssumedState(world, [...assumedItems, ...items]);
      if (fits(swapState.state, item, spot, checkAccess)) {
        world.placedItems.set(spot, item);
        swapCounts.set(displaced, (swapCounts.get(displaced) ?? 0) + 1);
        items.unshift(displaced);
        swapped = true;
        break;
      }
      world.placedItems.set(spot, displaced);
    }
    if (!swapped) {
      throw new FillError(item,
        `${items.length} items left, ${locations.length} open locations, ${placedHere.length} placed`);
    }
  }
};

export { fillRestrictive };
