/* @layer renderer-app @kind logic */
import type { LocationKey } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { markCollected } from '@app/game/randomizer-client/online-collected';

const rotpApMarkCollected: NonNullable<ArchipelagoGame<unknown, unknown>['markCollected']> = (keys) => {
  markCollected(keys as readonly LocationKey[]);
};

export { rotpApMarkCollected };
