/* @layer renderer-app @kind logic */
import { LOCK_CAUSE_ORDER } from '@drizztdourden08/brock-react';
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { hostLockCause } from '../host-lock-cause';

const hostLockProvider: LockCauseProvider<GameSettings> = {
  id: 'host',
  order: LOCK_CAUSE_ORDER.host,
  causeOf: (key) => hostLockCause(key),
};

export { hostLockProvider };
