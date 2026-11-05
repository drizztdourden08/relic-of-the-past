/* @layer renderer-app @kind logic */
import { apLocationIdOf, locationKeyOfApId } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

const locationKeyOf: ArchipelagoGame<unknown, unknown>['locationKeyOf'] = (id) => {
  try {
    return locationKeyOfApId(id);
  } catch {
    return null;
  }
};

const locationIdOf: ArchipelagoGame<unknown, unknown>['locationIdOf'] = (key) => {
  try {
    return apLocationIdOf(key as LocationKey);
  } catch {
    return null;
  }
};

export { locationIdOf, locationKeyOf };
