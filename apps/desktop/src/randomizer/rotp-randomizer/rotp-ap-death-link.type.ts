/* @layer renderer-app @kind types */
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

type DeathLink = NonNullable<ArchipelagoGame<unknown, unknown>['deathLink']>;

export type { DeathLink };
