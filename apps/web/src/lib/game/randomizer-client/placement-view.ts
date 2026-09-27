/* @layer bridge-wasm @kind logic */
/**
 * Crosswalks a placement into the tracker's own vocabulary, so a check can be
 * shown holding what THIS run put there instead of its vanilla contents.
 *
 * A placement is keyed by id, so a real check needs no lookup at all. What is left is the
 * two kinds of row the dataset does not model on its own: a slot with no check record, which
 * takes the virtual id virtual-locations.ts mints for it, and an item with no item record,
 * which is counted and reported instead of silently dropped.
 */
import { isSlotKey } from '@shared/randomizer/world/location-key';
import { isUnrecordedItem } from '@shared/randomizer/world/item-ids.data';
import { virtualCheckIdOf } from './virtual-locations';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CheckId, ItemId } from '@shared/game/data';

interface PlacementView {
  /** check id → the item actually placed there. */
  itemByCheck: Map<CheckId, ItemId>;
  /** check id → the sweep sphere the location was reached in. */
  sphereByCheck: Map<CheckId, number>;
  /** Placement locations with no check record of their own. */
  unmatchedLocations: string[];
  /** Placed items with no item record here, by location. */
  unmatchedItems: string[];
}

const emptyView = (): PlacementView => ({
  itemByCheck: new Map(),
  sphereByCheck: new Map(),
  unmatchedLocations: [],
  unmatchedItems: [],
});

const buildPlacementView = (placement: Placement | null): PlacementView => {
  const view = emptyView();
  if (!placement) return view;

  const sphereOfLocation = new Map<string, number>();
  for (const sphere of placement.spheres) {
    for (const location of sphere.locations) sphereOfLocation.set(location, sphere.index);
  }

  for (const [location, item] of Object.entries(placement.locations)) {
    // A location with no real check still gets the exact virtual id
    // virtualChecksOf mints for it, so its row shows what this seed actually
    // placed instead of nothing.
    const checkId = isSlotKey(location) ? virtualCheckIdOf(location) : (location as CheckId);
    const sphere = sphereOfLocation.get(location);
    if (sphere !== undefined) view.sphereByCheck.set(checkId, sphere);

    if (isUnrecordedItem(item)) {
      view.unmatchedItems.push(`${location}: ${item}`);
      continue;
    }
    view.itemByCheck.set(checkId, item as ItemId);
  }

  return view;
};

export { buildPlacementView, emptyView };
export type { PlacementView };
