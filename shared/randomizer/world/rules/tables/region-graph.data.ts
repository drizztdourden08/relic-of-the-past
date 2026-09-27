/* @layer shared-game @kind data */
/**
 * THE reachability graph: every passage between two regions, in one table.
 *
 * The reference states this twice, as the exits each region owns and as the wiring that names
 * each exit's target, across seven files. One row states it once: where the passage starts,
 * where it ends, and the name the rule tables key its requirement by. The four parts below are
 * its four taxonomies, in their own order, because the graph's order is the order the sweep
 * and the fill walk it in.
 *
 * A row is LOGIC. `connectionId` is the one place it touches the map, naming the crossing the
 * records draw for that passage where exactly one of them joins the same pair of regions;
 * 187 of the 392 rows carry none, which is honest, because a mirror spot, a retry from the
 * menu and a wing boundary inside one room cross no tile.
 */
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
