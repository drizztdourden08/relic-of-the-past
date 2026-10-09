/* @layer renderer-components @kind constants */
import type { HudButtonVerb } from '@rotp/hud';

const VERBS: readonly HudButtonVerb[] = ['up', 'down', 'left', 'right', 'pause', 'map'];
const STATES = ['pressed', 'held', 'unassigned'] as const;

export { STATES, VERBS };
