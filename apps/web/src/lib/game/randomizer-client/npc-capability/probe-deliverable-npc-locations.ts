/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { NPC_SCOPE_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { capabilityCache } from './capability-cache';
import { probeTable } from './probe-table';

const probeDeliverableNpcLocations = (): ReadonlySet<LocationKey> => {
  capabilityCache.npc ??= probeTable(NPC_SCOPE_LOCATIONS);
  return capabilityCache.npc;
};

export { probeDeliverableNpcLocations };
