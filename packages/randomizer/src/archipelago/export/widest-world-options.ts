/* @layer shared-game @kind logic */
import { VANILLA_MEDALLIONS } from '../../world/item-groups';
import { capacityPondSpots } from '../../world/capacity/capacity-spots';
import { POND_EXTRA_LOCATIONS, POND_PRIZE_LOCATIONS } from '../../world/pond/pond-rungs';
import { WIDEST_SHOP_SCOPE } from './widest-world.constants';
import type { WorldOptions } from '../../world/world.type';

const widestWorldOptions = (): WorldOptions => ({
  keyDropShuffle: true,
  medallions: { ...VANILLA_MEDALLIONS },
  pondLocations: [...POND_EXTRA_LOCATIONS, ...capacityPondSpots()],
  pondPrizeLocations: POND_PRIZE_LOCATIONS,
  shops: WIDEST_SHOP_SCOPE,
});

export { widestWorldOptions };
