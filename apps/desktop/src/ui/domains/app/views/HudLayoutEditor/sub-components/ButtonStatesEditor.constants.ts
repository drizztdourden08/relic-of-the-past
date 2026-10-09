/* @layer renderer-components @kind constants */
import type { HudButtonVerb } from '@shared/types/hud';

const VERBS: readonly HudButtonVerb[] = ['up', 'down', 'left', 'right', 'pause', 'map'];
const STATES = ['pressed', 'held', 'unassigned'] as const;

export { STATES, VERBS };
