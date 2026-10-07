/* @layer renderer-components @kind logic */
/** The session's state as a chip tone: running is ok, on its way is a warning, failed is bad. */
import type { ChipTone } from '@ds/primitives';
import type { ActiveSession } from '@app/lib/game/randomizer-client';

const SESSION_TONE: Readonly<Record<ActiveSession['status'], ChipTone>> = {
  idle: 'idle',
  starting: 'warn',
  reconnecting: 'warn',
  active: 'ok',
  error: 'bad',
};

const sessionToneOf = (status: ActiveSession['status']): ChipTone => SESSION_TONE[status];

export { sessionToneOf };
