/* @layer shared-game @kind logic */
import { shopLocationsByRegion } from '../shops/shop-slots';
import { markWorldZones } from '../world-zones';
import { worldEventsOf } from '../events/world-events';
import { regionRecords } from '../world-from-records';
import { PASSAGES_BY_SOURCE } from './build-world.constants';
import { buildLocation } from './build-location';
import { buildShopLocation } from './build-shop-location';
import { regionLocationKeys } from './region-location-keys';
import type { RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key.type';
import type { Exit, Region } from '../region.type';
import type { WorldOptions } from '../world.type';

const wiredRegionsOf = (options: WorldOptions): Map<RegionId, Region> => {
  const { keyDropShuffle, shops, pondLocations } = options;
  const pondPresent = new Set(pondLocations);
  const shopLocations = shops === undefined
    ? new Map<RegionId, readonly LocationKey[]>()
    : shopLocationsByRegion(shops);
  const regions = new Map<RegionId, Region>();
  for (const record of regionRecords()) {
    const locations = regionLocationKeys(record.id)
      .map((key) => buildLocation(key, record.id))
      .filter((location) => (keyDropShuffle || !location.kdsOnly)
        && (!location.pondSlot || pondPresent.has(location.key)));
    for (const key of shopLocations.get(record.id) ?? []) {
      locations.push(buildShopLocation(key, record.id));
    }
    const exits: Exit[] = (PASSAGES_BY_SOURCE.get(record.id) ?? [])
      .map((row) => ({ name: row.exit, source: record.id, target: row.to }));
    regions.set(record.id, {
      id: record.id,
      name: record.name,
      type: record.type,
      locations,
      events: worldEventsOf(record.id),
      exits,
      entrances: [],
      isLightWorld: false,
      isDarkWorld: false,
    });
  }
  for (const region of regions.values()) {
    for (const exit of region.exits) {
      const target = regions.get(exit.target);
      if (target === undefined) throw new Error(`passage names unknown region: ${exit.name} -> ${exit.target}`);
      target.entrances.push(exit);
    }
  }
  markWorldZones(regions);
  return regions;
};

export { wiredRegionsOf };
