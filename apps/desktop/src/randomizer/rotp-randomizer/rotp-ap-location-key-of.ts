/* @layer renderer-app @kind logic */
import { ROTP_AP_IDS } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

const locationKeyOf: ArchipelagoGame<unknown, unknown>['locationKeyOf'] = (id) => {
  return ROTP_AP_IDS.locationKeyOf(id) ?? null;
};

export { locationKeyOf };
