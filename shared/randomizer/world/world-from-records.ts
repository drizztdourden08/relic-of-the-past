/* @layer shared-game @kind logic */
/**
 * The world, read off the records.
 *
 * The region collection IS the engine's region list now: `regionRecords` hands over all 239
 * rows in record order, and `build-world` keys its graph by their ids. Nothing states a region,
 * its world or its type twice any more, and a region fact the rules want (the transform
 * suppression flag) is read off the record instead of a list kept beside them.
 *
 * `checksByRegion` reads each check's own `regionId`, which is why it is exact: a screen could
 * not answer for it, because the reference's partition is finer than a screen in the places it
 * splits one room into wings and sixteen regions have no screen at all. It hands over every
 * row of a region; which of them a seed fills is one rule over the record (seed-locations.ts).
 *
 * `crossingsByRegion` is the other direction and stays a MEASUREMENT. It draws the passages the
 * connection records make, which are the game's PHYSICAL crossings, and the graph's passages
 * are logical ones (rules/tables/region-graph.data.ts). A row names its crossing only where one
 * crossing joins the same pair of regions; the rest have none, because a mirror spot, a retry
 * from the menu and a wing boundary inside one room cross no tile.
 * `tests/randomizer/world-from-records.keep.test.ts` pins the gap: it can only shrink.
 */
import { all, getScreen } from '@shared/game/data';
import type { CheckId, ConnectionId, RegionId } from '@shared/game/data/types/ids';
import type { ConnectionKind, RegionRecord } from '@shared/game/data/types';

/** One physical crossing, as the connection records draw it, between two different regions. */
interface RegionCrossing {
  connectionId: ConnectionId;
  from: RegionId;
  to: RegionId;
  kind: ConnectionKind;
}

let ordered: readonly RegionRecord[] | null = null;
let checks: Map<RegionId, readonly CheckId[]> | null = null;
let crossings: Map<RegionId, readonly RegionCrossing[]> | null = null;

/**
 * Every region, by id, which is the order the reference's four taxonomies list them in. The
 * order is load order otherwise, because the registry seeds one record file at a time, and the
 * graph's own order has to be the reference's: the prefill and the normal placement both walk
 * it. The keep test pins the two orders together.
 */
const regionRecords = (): readonly RegionRecord[] => {
  ordered ??= [...all('region')].sort((left, right) => left.id.localeCompare(right.id));
  return ordered;
};

/** The regions the transformed player cannot cross, as the records flag them. */
const bunnyImpassableRegionIds = (): readonly RegionId[] =>
  regionRecords().filter((region) => region.bunnyImpassable === true).map((region) => region.id);

/**
 * The checks each region owns, off the records' own `regionId`. A check standing for no place
 * (a held item, a status, a combined event) carries none and belongs to no region here.
 */
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

/**
 * The crossings leaving each region, from the connections a player can walk out through. Both
 * ends have to name a region, so a crossing into a room no wing owns is absent.
 */
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

export { bunnyImpassableRegionIds, checksByRegion, crossingsByRegion, regionRecords };
export type { RegionCrossing };
