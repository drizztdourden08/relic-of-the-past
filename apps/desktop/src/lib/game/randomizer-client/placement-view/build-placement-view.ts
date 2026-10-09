/* @layer bridge-wasm @kind logic */
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import { isUnrecordedItem } from '@shared/randomizer/world/item-ids.data';
import { foreignItemName, isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { virtualCheckIdOf } from '../virtual-locations';
import { emptyView } from './empty-view';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ItemId } from '@rotp/game-data';
import type { ForeignOwners } from '../foreign-item-line';
import type { PlacementView } from './placement-view.type';

const buildPlacementView = (placement: Placement | null, foreignOwners: ForeignOwners = {}): PlacementView => {
  const view = emptyView();
  if (!placement) return view;

  const sphereOfLocation = new Map<string, number>();
  for (const sphere of placement.spheres) {
    for (const location of sphere.locations) sphereOfLocation.set(location, sphere.index);
  }

  for (const [location, item] of Object.entries(placement.locations)) {
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

export { buildPlacementView };
