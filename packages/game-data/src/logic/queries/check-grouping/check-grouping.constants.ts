/* @layer shared-game @kind constants */
import type { CheckFacetDef, GroupDimensionDef } from './check-grouping.type';
import { facetCatalog } from './facet-catalog';

const GROUP_DIMENSIONS: GroupDimensionDef[] = [
  { id: 'world', label: 'World', description: 'Light World / Dark World' },
  { id: 'area', label: 'Area', description: 'Geographic region of the overworld or dungeon' },
  { id: 'location', label: 'Location Type', description: 'Cave, House, Dungeon, Overworld' },
  { id: 'dungeon', label: 'Dungeon', description: 'Specific dungeon' },
  { id: 'screen', label: 'Screen', description: 'Detailed sub-location' },
  { id: 'type', label: 'Check Type', description: 'Chest, NPC, Key Drop, Boss, etc.' },
  { id: 'content', label: 'Content', description: 'Key, Map/Compass, Boss Item, etc.' },
];

const SPHERE_DIMENSION: GroupDimensionDef =
  { id: 'sphere', label: 'Sphere', description: 'How deep into the seed the check first becomes reachable' };

const OUTSIDE_SWEEP = 'Outside the sweep';

const WORLD_FACETS: CheckFacetDef[] = [
  { id: 'world:light', label: 'Light World', category: 'world' },
  { id: 'world:dark', label: 'Dark World', category: 'world' },
];

const LOCATION_FACETS: CheckFacetDef[] = [
  { id: 'location:dungeon', label: 'Dungeon', category: 'location' },
  { id: 'location:cave', label: 'Cave', category: 'location' },
  { id: 'location:house', label: 'House', category: 'location' },
  { id: 'location:overworld', label: 'Overworld', category: 'location' },
];

const CHECK_FACET_DEFS: CheckFacetDef[] = facetCatalog(WORLD_FACETS, LOCATION_FACETS);

export { CHECK_FACET_DEFS, GROUP_DIMENSIONS, OUTSIDE_SWEEP, SPHERE_DIMENSION };
