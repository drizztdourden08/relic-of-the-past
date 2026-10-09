/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '../world/location-key';
import { POND_LOCATION_SET } from '../world/pond/pond-rungs';
import { pondPlanOf } from '../world/pond/pond-plan';
import { WISH_POND_WATERS } from './wish-pond-rung-keys.constants';
import type { PondProfiles } from '../world/pond/pond-profiles.type';
import type { WishPondRungKey } from './wish-pond-rung-keys.type';

const wishPondRungKeysOf = (profiles: PondProfiles): ReadonlyMap<LocationKey, WishPondRungKey> => {
  const keys = new Map<LocationKey, WishPondRungKey>();
  for (const { instance, pond } of WISH_POND_WATERS) {
    const { locations } = pondPlanOf(profiles[instance.id], instance);
    locations.forEach((location, rung) => {
      if (POND_LOCATION_SET.has(location)) keys.set(location, { pond, rung });
    });
  }
  return keys;
};

export { wishPondRungKeysOf };
export type { WishPondRungKey, WishPondWater } from './wish-pond-rung-keys.type';
