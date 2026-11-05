/* @layer renderer-app @kind constants */
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { developerLockProvider } from './developer-lock-provider';
import { hostLockProvider } from './host-lock-provider';
import { vanillaSafeLockProvider } from './vanilla-safe-lock-provider';

const LOCK_CAUSE_PROVIDERS: readonly LockCauseProvider<GameSettings>[] = [
  hostLockProvider,
  developerLockProvider,
  vanillaSafeLockProvider,
];

export { LOCK_CAUSE_PROVIDERS };
