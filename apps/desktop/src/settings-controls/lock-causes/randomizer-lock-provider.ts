/* @layer renderer-app @kind logic */
import { LOCK_CAUSE_ORDER, useProfilesStore } from '@drizztdourden08/brock-react';
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';

const frozenKeys = (): string[] => Object.keys(useProfilesStore.getState().active?.randomizer?.frozenSettings ?? {});

const randomizerLockProvider: LockCauseProvider<GameSettings> = {
  id: 'randomizer',
  order: LOCK_CAUSE_ORDER.module,
  causeOf: (key) => (frozenKeys().includes(key) ? 'randomizer' : null),
};

export { randomizerLockProvider };
