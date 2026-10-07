/* @layer bridge-wasm @kind logic */
/**
 * The two item-throwing waters as the core counts them, and which of a
 * placement's locations are their numbered rungs. The core reads a water by
 * its place in wish_pond_plan.c's own order (the light world's water first,
 * the dark world's second), so that index is written down once here and every
 * other file asks for it by pond id.
 *
 * A rung is a location only while its pond's plan lists it: a legacy pond
 * lists nothing, and a pond at its native economy lists its own two fairy
 * slots, which are ordinary npc checks and never rungs. Pure: a function of
 * the settings alone.
 */

import { pondInstanceOf } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { POND_LOCATION_SET } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import type { PondInstance } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondProfiles } from '@shared/randomizer/ap-world/pond/pond-profiles.type';

/** One water the core arms a rung table for. */
interface WishPondWater {
  instance: PondInstance;
  /** The core's index for this water (wish_pond_plan.c). */
  pond: number;
}

/** Where one rung sits: which water, and its place in that water's sequence from zero. */
interface WishPondRungKey {
  pond: number;
  rung: number;
}

/** In the core's own counting order. */
const WISH_POND_WATERS: readonly WishPondWater[] = [
  { instance: pondInstanceOf('wishing'), pond: 0 },
  { instance: pondInstanceOf('cursed'), pond: 1 },
];

/** Every rung location of both waters, each mapped to its key. Empty when neither water carries rungs. */
const wishPondRungKeysOf = (profiles: PondProfiles): ReadonlyMap<string, WishPondRungKey> => {
  const keys = new Map<string, WishPondRungKey>();
  for (const { instance, pond } of WISH_POND_WATERS) {
    const { locations } = pondPlanOf(profiles[instance.id], instance);
    locations.forEach((location, rung) => {
      if (POND_LOCATION_SET.has(location)) keys.set(location, { pond, rung });
    });
  }
  return keys;
};

export { WISH_POND_WATERS, wishPondRungKeysOf };
export type { WishPondRungKey, WishPondWater };
