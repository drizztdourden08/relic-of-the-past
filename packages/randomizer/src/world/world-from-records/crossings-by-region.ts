/* @layer shared-game @kind logic */
import { all, getScreen } from '@rotp/game-data';
import type { RegionId } from '@rotp/game-data';
import type { RegionCrossing } from '../region.type';

let crossings: Map<RegionId, readonly RegionCrossing[]> | null = null;

const crossingsByRegion = (): ReadonlyMap<RegionId, readonly RegionCrossing[]> => {
  if (crossings !== null) return crossings;
  const byId = new Map(all('connection').map((connection) => [connection.id, connection]));
  const rows = new Map<RegionId, RegionCrossing[]>();
  for (const connection of all('connection')) {
    if (!connection.canExit) continue;
    const other = byId.get(connection.toConnectionId);
    if (other === undefined) continue;
    const from = getScreen(connection.screenId).regionId;
    const to = getScreen(other.screenId).regionId;
    if (from === undefined || to === undefined || from === to) continue;
    rows.set(from, [...(rows.get(from) ?? []), { connectionId: connection.id, from, to, kind: connection.kind }]);
  }
  crossings = rows;
  return rows;
};

export { crossingsByRegion };
