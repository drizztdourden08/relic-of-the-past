/* @layer shared-game @kind logic */
import { getCheck } from '@rotp/game-data';
import { WORLD_EVENT_IDS } from './story-events.data';
import type { RegionId } from '@rotp/game-data';
import type { WorldEvent } from '../region.type';

const eventsByRegion = (): ReadonlyMap<RegionId, readonly WorldEvent[]> => {
  const byRegion = new Map<RegionId, WorldEvent[]>();
  for (const key of WORLD_EVENT_IDS) {
    const { regionId } = getCheck(key);
    if (regionId === undefined) throw new Error(`story event with no region: ${key}`);
    byRegion.set(regionId, [...(byRegion.get(regionId) ?? []), { key, region: regionId }]);
  }
  return byRegion;
};

export { eventsByRegion };
