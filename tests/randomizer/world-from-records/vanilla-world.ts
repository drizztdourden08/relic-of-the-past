/* @layer tests @kind helper */
import { buildWorld } from '@rotp/randomizer';
import { VANILLA_MEDALLIONS } from '@rotp/randomizer';
import type { World } from '@rotp/randomizer';

const vanillaWorld = (keyDropShuffle = true): World => buildWorld({
  keyDropShuffle,
  medallions: { ...VANILLA_MEDALLIONS },
  pondLocations: [],
  pondPrizeLocations: [],
});

export { vanillaWorld };
