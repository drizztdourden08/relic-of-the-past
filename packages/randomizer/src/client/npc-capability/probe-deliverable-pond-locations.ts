/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '../../world/location-key';
import { capabilityCache } from './capability-cache';
import { POND_SLOT_LOCATIONS } from './npc-capability.constants';
import { probeTable } from './probe-table';

const probeDeliverablePondLocations = (): ReadonlySet<LocationKey> => {
  capabilityCache.pond ??= probeTable(POND_SLOT_LOCATIONS);
  return capabilityCache.pond;
};

export { probeDeliverablePondLocations };
