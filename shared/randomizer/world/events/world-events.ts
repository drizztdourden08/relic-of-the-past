/* @layer shared-game @kind logic */
import { EVENTS_BY_REGION } from './world-events.constants';
import type { RegionId } from '@rotp/game-data';
import type { WorldEvent } from '../region.type';

const worldEventsOf = (region: RegionId): WorldEvent[] => [...(EVENTS_BY_REGION.get(region) ?? [])];

export { worldEventsOf };
