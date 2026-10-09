/* @layer shared-game @kind logic */
import { REGION_GRAPH } from '../rules/tables/region-graph.data';
import type { RegionId } from '@rotp/game-data';
import type { RegionGraphRow } from '../region.type';

const passagesBySource = (): ReadonlyMap<RegionId, readonly RegionGraphRow[]> => {
  const rows = new Map<RegionId, RegionGraphRow[]>();
  const named = new Set<string>();
  for (const row of REGION_GRAPH) {
    if (named.has(row.exit)) throw new Error(`duplicate exit: ${row.exit}`);
    named.add(row.exit);
    rows.set(row.from, [...(rows.get(row.from) ?? []), row]);
  }
  return rows;
};

export { passagesBySource };
