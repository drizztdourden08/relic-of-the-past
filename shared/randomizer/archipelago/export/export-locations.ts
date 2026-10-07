/* @layer shared-game @kind logic */
/**
 * locations.json: every location of the widest world, with its Archipelago id and name, its
 * region, whether it exists in every world or only while a profile's world model lists it,
 * and its rule tree as the engine holds it. The story events are no locations here: they
 * travel in regions.json and the loader creates them (export-regions.ts).
 */
import { AP_LOCATION_IDS, AP_LOCATION_NAMES } from '../ap-ids.data';
import { isShopSlotLocation } from '../../world/shops/shop-slots';
import { TRUE } from '../../world/rules/rule-node-build';
import type { World } from '../../world/world.type';
import type { WorldLocation } from '../../world/region.type';
import type { ExportedLocation, LocationRequires } from './export.type';

const requiresOf = (location: WorldLocation): LocationRequires => {
  if (isShopSlotLocation(location.key)) return { present: 'shop' };
  return location.pondSlot ? { present: 'pond' } : { always: true };
};

const idOf = (location: WorldLocation): number => {
  const id = AP_LOCATION_IDS[location.key];
  if (id === undefined) throw new Error(`location has no Archipelago id: ${location.key}`);
  return id;
};

const exportLocations = (world: World): ExportedLocation[] => {
  const names = new Set<string>();
  return [...world.locationsByKey.values()].map((location) => {
    const id = idOf(location);
    const name = AP_LOCATION_NAMES[id];
    if (names.has(name)) throw new Error(`two locations named ${name}`);
    names.add(name);
    return {
      key: location.key,
      id,
      name,
      region: location.region,
      prize: location.prize,
      requires: requiresOf(location),
      rule: world.getLocationRule(location.key)?.node ?? TRUE,
    };
  });
};

export { exportLocations };
