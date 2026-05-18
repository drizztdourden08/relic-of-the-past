import type { RegionDefinition, RegionConnection } from '../types';
import { OVERWORLD_REGIONS, OVERWORLD_CONNECTIONS } from './overworld';
import { DUNGEON_REGIONS, DUNGEON_CONNECTIONS } from './dungeons';

export { OVERWORLD_REGIONS, OVERWORLD_CONNECTIONS } from './overworld';
export { DUNGEON_REGIONS, DUNGEON_CONNECTIONS } from './dungeons';

export const ALL_REGIONS: RegionDefinition[] = [...OVERWORLD_REGIONS, ...DUNGEON_REGIONS];

export const ALL_CONNECTIONS: RegionConnection[] = [...OVERWORLD_CONNECTIONS, ...DUNGEON_CONNECTIONS];

export const REGION_BY_ID = new Map<string, RegionDefinition>(
  ALL_REGIONS.map(r => [r.id, r])
);
