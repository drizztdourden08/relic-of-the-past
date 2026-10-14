/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { canFillLocation } from './can-fill-location';
import { createAssumedState } from './create-assumed-state';
import { FillError } from './fill-error';
import { trySwap } from './try-swap';
import type { ItemKey } from '../item-ids';
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
  const swapRun = { world, items, assumedItems, placedHere, swapCounts, fits };
  while (items.length > 0) {
    const item = items.pop() as ItemKey;
    const assumed = createAssumedState(world, [...assumedItems, ...items]);
    const checkAccess = !relaxWhenBeatable || !world.isBeaten(assumed.state);
    const spotIndex = locations.findIndex((key) => fits(assumed.state, item, key, checkAccess));
    if (spotIndex >= 0) {
      const spot = itemAt(locations.splice(spotIndex, 1), 0);
      world.placedItems.set(spot, item);
      placedHere.push(spot);
      continue;
    }
    if (!trySwap(swapRun, item, checkAccess)) {
      throw new FillError(item,
        `${items.length} items left, ${locations.length} open locations, ${placedHere.length} placed`);
    }
  }
};

export { fillRestrictive };
