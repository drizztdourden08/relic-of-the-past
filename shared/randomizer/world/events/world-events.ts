/* @layer shared-game @kind logic */
/**
 * Where each story event of the world happens: the region its own record names, the same field
 * a location's region is read from. So the place an event is found at is never a second table,
 * and a record with no region is a porting error that throws when the module loads.
 */
import { getCheck } from '@shared/game/data';
import { WORLD_EVENT_IDS } from './story-events.data';
import type { RegionId } from '@shared/game/data/types/ids';
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

const EVENTS_BY_REGION = eventsByRegion();

/** The story events that happen in one region, in the order the sweep asks them. */
const worldEventsOf = (region: RegionId): WorldEvent[] => [...(EVENTS_BY_REGION.get(region) ?? [])];

export { worldEventsOf };
