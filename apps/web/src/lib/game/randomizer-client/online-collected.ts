/* @layer bridge-wasm @kind logic */
/**
 * The room holds these locations of this slot as checked (`!collect`, another session of the
 * slot, or this one). The poller takes each out of its reporting for the rest of the session,
 * and each one shows completed in the tracker at once: a key with a record joins the collected
 * checks, and a restock or a pond rung, which has no record, joins the taken locations its
 * virtual row reads. Nothing is written to the game: its own completion flags still say what
 * the save did.
 */
import { pollRoomFlags } from '../tracker';
import { addCollectedChecks } from '../tracker/collected-checks';
import { suppressLocationReport } from './location-poller';
import { markLocationFired } from './override-fire-registry';
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import type { CheckId } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';

const markCollected = (keys: readonly LocationKey[]): void => {
  const checkIds: CheckId[] = [];
  for (const key of keys) {
    suppressLocationReport(key);
    // A key with a record ticks the record; a restock or a pond rung has none to tick.
    const checkId = checkIdOfLocation(key);
    if (checkId === undefined) markLocationFired(key);
    else checkIds.push(checkId);
  }
  if (addCollectedChecks(checkIds)) pollRoomFlags(true);
};

export { markCollected };
