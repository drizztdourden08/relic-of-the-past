/* @layer bridge-wasm @kind logic */
/**
 * Crosswalks a placement into the tracker's own vocabulary, so a check can be
 * shown holding what THIS run put there instead of its vanilla contents.
 *
 * Two lookups, both by community-standard name: the location name gives the
 * check id (a real one, or the virtual id virtual-locations.ts mints for a
 * slot this app's dataset does not model on its own), the item name gives
 * the item record. Only the item lookup can still miss (a placed name with
 * no item record here), and a miss is counted and reported instead of
 * silently dropped: a spoiler that omits ten items is worse than one that
 * says it did.
 */
import { checkIdByStandardName } from './check-names';
import { itemIdByStandardName } from './item-lookup';
import { virtualCheckIdOf } from './virtual-locations';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { CheckId, ItemId } from '@shared/game/data';

interface PlacementView {
  /** check id → the item actually placed there. */
  itemByCheck: Map<CheckId, ItemId>;
  /** check id → the sweep sphere the location was reached in. */
  sphereByCheck: Map<CheckId, number>;
  /** Placement locations with no check of that name here. */
  unmatchedLocations: string[];
  /** Placed item names with no item record here, by location. */
  unmatchedItems: string[];
}

const emptyView = (): PlacementView => ({
  itemByCheck: new Map(),
  sphereByCheck: new Map(),
  unmatchedLocations: [],
  unmatchedItems: [],
});

const buildPlacementView = (placement: ApPlacement | null): PlacementView => {
  const view = emptyView();
  if (!placement) return view;

  const sphereOfLocation = new Map<string, number>();
  for (const sphere of placement.spheres) {
    for (const location of sphere.locations) sphereOfLocation.set(location, sphere.index);
  }

  for (const [location, itemName] of Object.entries(placement.nameView)) {
    // A location with no real check still gets the exact virtual id
    // virtualChecksOf mints for it, so its row shows what this seed actually
    // placed instead of nothing.
    const checkId = (checkIdByStandardName(location) as CheckId | undefined) ?? virtualCheckIdOf(location);
    const sphere = sphereOfLocation.get(location);
    if (sphere !== undefined) view.sphereByCheck.set(checkId, sphere);

    const itemId = itemIdByStandardName(itemName);
    if (itemId === undefined) {
      view.unmatchedItems.push(`${location}: ${itemName}`);
      continue;
    }
    view.itemByCheck.set(checkId, itemId);
  }

  return view;
};

export { buildPlacementView, emptyView };
export type { PlacementView };
