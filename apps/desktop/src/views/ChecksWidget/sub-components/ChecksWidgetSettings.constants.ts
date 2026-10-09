/* @layer renderer-widgets @kind constants */
import type { Hint } from '@drizztdourden08/tessera/primitives';

const PIN_HEADER_HINT: Hint = { label: 'Pin header', description: 'Keep the summary and filters in place' };

const NOTIFY_HINT: Hint = { label: 'Notifications', description: 'A card over the game for each check or event you complete' };

const NOTIFY_WHEN_CLOSED_HINT: Hint = { label: 'While closed', description: 'Keep notifying while this tracker is closed' };

export { NOTIFY_HINT, NOTIFY_WHEN_CLOSED_HINT, PIN_HEADER_HINT };
