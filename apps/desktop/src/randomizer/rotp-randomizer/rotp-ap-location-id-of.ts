/* @layer renderer-app @kind logic */
import { ROTP_AP_IDS } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

const locationIdOf: ArchipelagoGame<unknown, unknown>['locationIdOf'] = (key) => {
  try {
    return ROTP_AP_IDS.locationIdOf(key as LocationKey);
  } catch {
    return null;
  }
};

export { locationIdOf };
