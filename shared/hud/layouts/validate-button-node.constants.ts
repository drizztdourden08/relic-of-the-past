/* @layer shared-hud @kind constants */
const VERBS = ['up', 'down', 'left', 'right', 'pause', 'map'] as const;
const STATES = ['idle', 'pressed', 'held', 'unassigned'] as const;
const OPTIONAL_STATES = ['pressed', 'held', 'unassigned'] as const;
const BUTTON_KEYS = ['type', 'bind', 'states'] as const;

export { BUTTON_KEYS, OPTIONAL_STATES, STATES, VERBS };
