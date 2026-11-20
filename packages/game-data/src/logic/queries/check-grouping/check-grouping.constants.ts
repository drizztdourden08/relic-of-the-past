/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { CheckFacetDef, GroupDimensionDef } from './check-grouping.type';
import { facetCatalog } from './facet-catalog';

const GROUP_DIMENSIONS: GroupDimensionDef[] = [
  {
    id: 'world',
    label: msg('game-labels:group.dim.world.label'),
    description: msg('game-labels:group.dim.world.description'),
  },
  {
    id: 'area',
    label: msg('game-labels:group.dim.area.label'),
    description: msg('game-labels:group.dim.area.description'),
  },
  {
    id: 'location',
    label: msg('game-labels:group.dim.location.label'),
    description: msg('game-labels:group.dim.location.description'),
  },
  {
    id: 'dungeon',
    label: msg('game-labels:group.dim.dungeon.label'),
    description: msg('game-labels:group.dim.dungeon.description'),
  },
  {
    id: 'screen',
    label: msg('game-labels:group.dim.screen.label'),
    description: msg('game-labels:group.dim.screen.description'),
  },
  {
    id: 'type',
    label: msg('game-labels:group.dim.type.label'),
    description: msg('game-labels:group.dim.type.description'),
  },
  {
    id: 'content',
    label: msg('game-labels:group.dim.content.label'),
    description: msg('game-labels:group.dim.content.description'),
  },
];

const SPHERE_DIMENSION: GroupDimensionDef = {
  id: 'sphere',
  label: msg('game-labels:group.dim.sphere.label'),
  description: msg('game-labels:group.dim.sphere.description'),
};

const OUTSIDE_SWEEP = 'Outside the sweep';

const WORLD_FACETS: CheckFacetDef[] = [
  { id: 'world:light', label: msg('game-labels:group.lightWorld'), category: 'world' },
  { id: 'world:dark', label: msg('game-labels:group.darkWorld'), category: 'world' },
];

const LOCATION_FACETS: CheckFacetDef[] = [
  { id: 'location:dungeon', label: msg('game-labels:group.dungeon'), category: 'location' },
  { id: 'location:cave', label: msg('game-labels:group.cave'), category: 'location' },
  { id: 'location:house', label: msg('game-labels:group.house'), category: 'location' },
  { id: 'location:overworld', label: msg('game-labels:group.overworld'), category: 'location' },
];

const CHECK_FACET_DEFS: CheckFacetDef[] = facetCatalog(WORLD_FACETS, LOCATION_FACETS);

export { CHECK_FACET_DEFS, GROUP_DIMENSIONS, OUTSIDE_SWEEP, SPHERE_DIMENSION };
