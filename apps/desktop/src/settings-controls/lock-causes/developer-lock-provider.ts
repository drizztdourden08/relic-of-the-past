/* @layer renderer-app @kind logic */
import { LOCK_CAUSE_ORDER } from '@drizztdourden08/brock-react';
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { developerLockCause } from '../contributing/developer-lock-cause';

const developerLockProvider: LockCauseProvider<GameSettings> = {
  id: 'developer',
  order: LOCK_CAUSE_ORDER.developer,
  causeOf: developerLockCause,
};

export { developerLockProvider };
