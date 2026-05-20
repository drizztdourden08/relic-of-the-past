import type { RegionDefinition } from '../types';
import { ALL_LIGHT_WORLD_REGIONS } from './light-world';
import { ALL_DARK_WORLD_REGIONS } from './dark-world';

export { ALL_LIGHT_WORLD_REGIONS } from './light-world';
export { ALL_DARK_WORLD_REGIONS } from './dark-world';
export { TAG_METADATA, hasAllTags, hasAnyTag, getTagNamespace, getTagValue } from './tags';
export type { RegionTag, WorldTag, EnvironmentTag, LocationTypeTag, AreaTag, DungeonTag, RoleTag, TagMetadata } from './tags';

const ALL_REGIONS: RegionDefinition[] = [
  ...ALL_LIGHT_WORLD_REGIONS,
  ...ALL_DARK_WORLD_REGIONS,
];

const REGION_BY_ID = new Map<string, RegionDefinition>(
  ALL_REGIONS.map(r => [r.id, r])
);

export { ALL_REGIONS, REGION_BY_ID };
export { getRegionLookup, resolveCurrentRegion } from './detection';
export type { RegionLookup } from './detection';
