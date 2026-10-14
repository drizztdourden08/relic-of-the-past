/* @layer shared-game @kind constants */
import type { PauseEvent } from './pause.type';

const NAVIGATION_EVENT_TYPES: ReadonlySet<PauseEvent['type']> = new Set(['move', 'prevScreen', 'nextScreen', 'screen', 'focus']);

export { NAVIGATION_EVENT_TYPES };
