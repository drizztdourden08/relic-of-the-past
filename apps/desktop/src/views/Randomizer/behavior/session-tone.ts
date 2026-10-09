/* @layer renderer-components @kind logic */
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { ActiveSession } from '@app/game/randomizer-client';
import { SESSION_TONE } from './session-tone.constants';

const sessionToneOf = (status: ActiveSession['status']): StatusTone => SESSION_TONE[status];

export { sessionToneOf };
