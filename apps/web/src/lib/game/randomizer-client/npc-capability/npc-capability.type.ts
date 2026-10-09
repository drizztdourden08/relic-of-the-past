/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';

type CapabilityCache = {
  npc: ReadonlySet<LocationKey> | null;
  world: ReadonlySet<LocationKey> | null;
  pond: ReadonlySet<LocationKey> | null;
};

export type { CapabilityCache };
