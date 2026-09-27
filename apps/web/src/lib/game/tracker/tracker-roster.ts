/* @layer bridge-wasm @kind logic */
/**
 * The rows the app lists for a run, built once and read by every surface that lists them:
 * the Checks widget, the randomizer page's spoiler tab and the cheat console's Checks tab.
 * The console used to build its own, which was the whole dataset whatever the run, so a
 * seed's shop shelves were missing from it and locations the seed never generated were in it.
 *
 * On a seed the roster is the seed's own: every record the placement names, plus a virtual
 * row for each location no record covers (shelves, chiefly), plus the event rows. Without a
 * placement it is the dataset's own list, which is where the fairy rungs and the intro's
 * story beats live: real rows that were never locations of any world.
 *
 * Deduplicated, because three records are both a location of the world AND an event record
 * (the flute spot, the floodgate, the ruins), so the two lists overlapped and the tracker
 * drew each of them twice.
 */
import { placementCheckRecords, eventCheckRecords } from '../randomizer-client/virtual-locations';
import type { CheckRecord } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const trackerCheckRecords = (
  checkRecords: readonly CheckRecord[], placement: Placement | null,
): CheckRecord[] => {
  if (placement === null) return [...checkRecords];
  const byId = new Map<string, CheckRecord>();
  for (const check of [...placementCheckRecords(checkRecords, placement), ...eventCheckRecords(checkRecords)]) {
    if (!byId.has(check.id)) byId.set(check.id, check);
  }
  return [...byId.values()];
};

export { trackerCheckRecords };
