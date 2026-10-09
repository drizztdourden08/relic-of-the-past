/* @layer renderer-components @kind constants */
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { ActiveSession } from '@app/lib/game/randomizer-client';

const SESSION_TONE: Readonly<Record<ActiveSession['status'], StatusTone>> = {
  idle: 'neutral',
  starting: 'warning',
  reconnecting: 'warning',
  active: 'success',
  error: 'danger',
};

export { SESSION_TONE };
