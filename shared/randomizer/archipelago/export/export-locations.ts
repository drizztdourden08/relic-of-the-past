/* @layer shared-game @kind logic */
/**
 * locations.json: every location of the widest world, with its Archipelago id and name, its
 * region, whether it exists in every world or only while a profile's world model lists it,
 * and its rule tree as the engine holds it.
 *
 * An event location has no id, and its name is the location's own display name; a name
 * another location already carries is a porting error and throws.
 */
import { AP_LOCATION_IDS, AP_LOCATION_NAMES } from '../ap-ids.data';
import { locationDisplayName } from '../../world/display-names/location-display-name';
import { isShopSlotLocation } from '../../world/shops/shop-slots';
import { TRUE } from '../../world/rules/rule-node-build';
import type { World } from '../../world/world.type';
import type { WorldLocation } from '../../world/region.type';
import type { ExportedLocation, LocationRequires } from './export.type';

const requiresOf = (location: WorldLocation): LocationRequires => {
  if (isShopSlotLocation(location.key)) return { present: 'shop' };
  return location.pondSlot ? { present: 'pond' } : { always: true };
};

const nameOf = (location: WorldLocation): { id: number | null; name: string } => {
  if (location.event) return { id: null, name: locationDisplayName(location.key) };
  const id = AP_LOCATION_IDS[location.key];
  if (id === undefined) throw new Error(`location has no Archipelago id: ${location.key}`);
  return { id, name: AP_LOCATION_NAMES[id] };
};

const exportLocations = (world: World): ExportedLocation[] => {
  const names = new Set<string>();
  return [...world.locationsByKey.values()].map((location) => {
    const { id, name } = nameOf(location);
    if (names.has(name)) throw new Error(`two locations named ${name}`);
    names.add(name);
    return {
      key: location.key,
      id,
      name,
      region: location.region,
      event: location.event,
      prize: location.prize,
      requires: requiresOf(location),
      rule: world.getLocationRule(location.key)?.node ?? TRUE,
    };
  });
};

export { exportLocations };
