/* @layer shared-game @kind logic */
import {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS,
} from '../scope-tables';
import { POND_LOCATION_SET } from '../pond/pond-rungs';
import type { CheckId, ItemId, RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key.type';
import type { WorldLocation } from '../region.type';

const vanillaItemOf = (key: LocationKey): ItemId | undefined =>
  KEY_DROP_LOCATIONS.get(key as CheckId) ?? CAPACITY_UPGRADE_LOCATIONS.get(key as CheckId)
  ?? NPC_SCOPE_LOCATIONS.get(key as CheckId) ?? WORLD_ITEM_SCOPE_LOCATIONS.get(key as CheckId);

const buildLocation = (key: LocationKey, region: RegionId): WorldLocation => {
  const vanillaItem = vanillaItemOf(key);
  return {
    key,
    region,
    kdsOnly: KEY_DROP_LOCATIONS.has(key as CheckId),
    capacityOnly: CAPACITY_UPGRADE_LOCATIONS.has(key as CheckId),
    pondSlot: POND_LOCATION_SET.has(key) || CAPACITY_UPGRADE_LOCATIONS.has(key as CheckId),
    prize: PRIZE_LOCATIONS.has(key as CheckId),
    ...(vanillaItem !== undefined ? { vanillaItem } : {}),
  };
};

export { buildLocation };
