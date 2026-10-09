/* @layer shared-game @kind logic */
import type { RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key.type';
import type { WorldLocation } from '../region.type';

const buildShopLocation = (key: LocationKey, region: RegionId): WorldLocation => ({
  key,
  region,
  kdsOnly: false,
  capacityOnly: false,
  pondSlot: false,
  prize: false,
});

export { buildShopLocation };
