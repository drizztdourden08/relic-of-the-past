/* @layer tests @kind helper */
import { buildWorld } from '@shared/randomizer/world/build-world';
import { VANILLA_MEDALLIONS } from '@shared/randomizer/world/item-groups';
import type { World } from '@shared/randomizer/world/world.type';

const vanillaWorld = (keyDropShuffle = true): World => buildWorld({
  keyDropShuffle,
  medallions: { ...VANILLA_MEDALLIONS },
  pondLocations: [],
  pondPrizeLocations: [],
});

export { vanillaWorld };
