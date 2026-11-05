/* @layer renderer-app @kind logic */
import { locationKeyOfApId } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

const locationKeyOf: ArchipelagoGame<unknown, unknown>['locationKeyOf'] = (id) => {
  try {
    return locationKeyOfApId(id);
  } catch {
    return null;
  }
};

export { locationKeyOf };
