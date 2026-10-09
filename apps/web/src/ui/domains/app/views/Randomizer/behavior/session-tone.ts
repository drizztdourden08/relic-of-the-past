/* @layer renderer-components @kind logic */
import type { ChipTone } from '@ds/primitives';
import type { ActiveSession } from '@app/lib/game/randomizer-client';
import { SESSION_TONE } from './session-tone.constants';

const sessionToneOf = (status: ActiveSession['status']): ChipTone => SESSION_TONE[status];

export { sessionToneOf };
