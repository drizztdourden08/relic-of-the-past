/* @layer renderer-app @kind constants */
const DPAD_DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

const STICK_DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

const STICK_PICK_FRACTION = 0.5;

const SWALLOW_CLICK_MS = 600;

export { DPAD_DIRECTIONS, STICK_DIRECTIONS, STICK_PICK_FRACTION, SWALLOW_CLICK_MS };
