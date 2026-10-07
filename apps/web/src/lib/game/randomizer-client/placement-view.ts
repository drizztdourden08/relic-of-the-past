/* @layer bridge-wasm @kind logic */
/**
 * Crosswalks a placement into the tracker's own vocabulary, so a check can be
 * shown holding what THIS run put there instead of its vanilla contents.
 *
 * A placement is keyed by id, so a real check is its record (location-record.ts maps a
 * shelf's first stock back to the shelf's record). What is left is the
 * kinds of row the dataset does not model on its own: a slot with no check record, which
 * takes the virtual id virtual-locations.ts mints for it; an item with no item record, which
 * is counted and reported instead of silently dropped; and another player's item (an online
 * placement), which has no record in this game and is shown by name, with its owner's name
 * when the server gave one.
 */
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import { isUnrecordedItem } from '@shared/randomizer/world/item-ids.data';
import { foreignItemName, isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { virtualCheckIdOf } from './virtual-locations';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CheckId, ItemId } from '@shared/game/data';
import type { ForeignOwners } from './foreign-item-line';

interface PlacementView {
  /** check id → the item actually placed there. */
  itemByCheck: Map<CheckId, ItemId>;
  /** check id → what to call the other player's item placed there. */
  foreignByCheck: Map<CheckId, string>;
  /** check id → the sweep sphere the location was reached in. */
  sphereByCheck: Map<CheckId, number>;
  /** Placement locations with no check record of their own. */
  unmatchedLocations: string[];
  /** Placed items with no item record here, by location. */
  unmatchedItems: string[];
}

const emptyView = (): PlacementView => ({
  itemByCheck: new Map(),
  foreignByCheck: new Map(),
  sphereByCheck: new Map(),
  unmatchedLocations: [],
  unmatchedItems: [],
});

const buildPlacementView = (placement: Placement | null, foreignOwners: ForeignOwners = {}): PlacementView => {
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
    const checkId = checkIdOfLocation(location) ?? virtualCheckIdOf(location as LocationKey);
    const sphere = sphereOfLocation.get(location);
    if (sphere !== undefined) view.sphereByCheck.set(checkId, sphere);

    if (isForeignItem(item)) {
      view.foreignByCheck.set(checkId, foreignItemName(foreignOwners[location as LocationKey]));
      continue;
    }
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
