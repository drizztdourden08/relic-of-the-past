/* @layer renderer-app @kind types */
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

type Gate = Pick<NonNullable<ArchipelagoGame<unknown, unknown>>, 'allows' | 'visible' | 'patched'>;

export type { Gate };
