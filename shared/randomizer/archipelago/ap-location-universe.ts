/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import { buildWorld } from '../world/build-world';
import { POND_REGION_LOCATIONS } from '../world/pond/pond-region-locations';
import { isSeedLocation } from '../world/seed-locations';
import { ALL_SHOP_SLOT_LOCATIONS } from '../world/shops/shop-slots';
import { compareApKeys } from './ap-key-order';
import { widestWorldOptions } from './export/widest-world-options';
import type { LocationKey } from '../world/location-key';

const widestWorldKeys = (): readonly LocationKey[] => [...buildWorld(widestWorldOptions()).locationsByKey.keys()];

const apLocationUniverse = (): readonly LocationKey[] => {
  const keys = new Set<LocationKey>([
    ...widestWorldKeys(),
    ...all('check').filter(isSeedLocation).map((check) => check.id),
    ...ALL_SHOP_SLOT_LOCATIONS.keys(),
    ...[...POND_REGION_LOCATIONS.values()].flat(),
  ]);
  return [...keys].sort(compareApKeys);
};

export { apLocationUniverse };
