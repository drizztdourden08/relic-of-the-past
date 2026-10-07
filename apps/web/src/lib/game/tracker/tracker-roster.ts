/* @layer bridge-wasm @kind logic */
/**
 * The rows the app lists for a run, built once and read by every surface that lists them:
 * the Checks widget, the randomizer page's spoiler tab and the cheat console's Checks tab.
 * The console used to build its own, which was the whole dataset whatever the run, so a
 * seed's shop shelves were missing from it and locations the seed never generated were in it.
 *
 * On a seed the roster is the seed's own: every record the placement names, plus a virtual
 * row for each location no record covers (shelves, chiefly), plus the event rows. No event is
 * a location of a seed, so the two lists never share a row. Without a placement it is the
 * dataset's own list, which is where the fairy rungs and the intro's story beats live: real
 * rows that were never locations of any world.
 */
import { placementCheckRecords, eventCheckRecords } from '../randomizer-client/virtual-locations';
import type { CheckRecord } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const trackerCheckRecords = (
  checkRecords: readonly CheckRecord[], placement: Placement | null,
): CheckRecord[] => {
  if (placement === null) return [...checkRecords];
  return [...placementCheckRecords(checkRecords, placement), ...eventCheckRecords(checkRecords)];
};

export { trackerCheckRecords };
