/* @layer bridge-wasm @kind logic */
import { pollRoomFlags } from '../tracker';
import { addCollectedChecks } from '../tracker/collected-checks';
import { suppressLocationReport } from './location-poller';
import { markLocationFired } from './override-fire-registry';
import { checkIdOfLocation } from '@rotp/randomizer';
import type { CheckId } from '@rotp/game-data';
import type { LocationKey } from '@rotp/randomizer';

const markCollected = (keys: readonly LocationKey[]): void => {
  const checkIds: CheckId[] = [];
  for (const key of keys) {
    suppressLocationReport(key);
    const checkId = checkIdOfLocation(key);
    if (checkId === undefined) markLocationFired(key);
    else checkIds.push(checkId);
  }
  if (addCollectedChecks(checkIds)) pollRoomFlags(true);
};

export { markCollected };
