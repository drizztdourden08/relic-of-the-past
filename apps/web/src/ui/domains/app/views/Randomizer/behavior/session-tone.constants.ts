/* @layer renderer-components @kind constants */
import type { ChipTone } from '@ds/primitives';
import type { ActiveSession } from '@app/lib/game/randomizer-client';

const SESSION_TONE: Readonly<Record<ActiveSession['status'], ChipTone>> = {
  idle: 'idle',
  starting: 'warn',
  reconnecting: 'warn',
  active: 'ok',
  error: 'bad',
};

export { SESSION_TONE };
