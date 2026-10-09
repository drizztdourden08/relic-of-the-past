/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '../../world/location-key';
import { WORLD_ITEM_SCOPE_LOCATIONS } from '../../world/scope-tables';
import { capabilityCache } from './capability-cache';
import { probeTable } from './probe-table';

const probeDeliverableWorldLocations = (): ReadonlySet<LocationKey> => {
  capabilityCache.world ??= probeTable(WORLD_ITEM_SCOPE_LOCATIONS);
  return capabilityCache.world;
};

export { probeDeliverableWorldLocations };
