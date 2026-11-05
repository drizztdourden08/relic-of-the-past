/* @layer renderer-app @kind constants */
import type { CheckStatus } from '@rotp/game-data';
import type { LocationStatus } from '@drizztdourden08/brock-randomizer/tracker';

const STATUS_OF: Readonly<Record<CheckStatus, LocationStatus>> = {
  completed: 'checked', reachable: 'available', blocked: 'blocked',
};

export { STATUS_OF };
