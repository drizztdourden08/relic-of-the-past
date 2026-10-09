/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { CheckId, RegionId } from '@rotp/game-data';

let checks: Map<RegionId, readonly CheckId[]> | null = null;

const checksByRegion = (): ReadonlyMap<RegionId, readonly CheckId[]> => {
  if (checks !== null) return checks;
  const rows = new Map<RegionId, CheckId[]>();
  for (const check of all('check')) {
    if (check.regionId === undefined) continue;
    rows.set(check.regionId, [...(rows.get(check.regionId) ?? []), check.id]);
  }
  checks = rows;
  return rows;
};

export { checksByRegion };
