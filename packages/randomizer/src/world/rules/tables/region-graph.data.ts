/* @layer shared-game @kind data */
import { LIGHT_REGION_GRAPH } from './region-graph-light.data';
import { DARK_REGION_GRAPH } from './region-graph-dark.data';
import { CAVE_REGION_GRAPH } from './region-graph-caves.data';
import { DUNGEON_REGION_GRAPH } from './region-graph-dungeons.data';
import type { RegionGraphRow } from '../../region.type';

const REGION_GRAPH: readonly RegionGraphRow[] = [
  ...LIGHT_REGION_GRAPH,
  ...DARK_REGION_GRAPH,
  ...CAVE_REGION_GRAPH,
  ...DUNGEON_REGION_GRAPH,
];

export { REGION_GRAPH };
